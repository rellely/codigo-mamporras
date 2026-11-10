#!/usr/bin/env python3
"""
Audio + timeline builder for the animated short.

For each language it:
  1. Synthesises every script line with Kokoro (local neural TTS).
  2. Applies per-character voice processing (pitch, reverb, whisper).
  3. Estimates word-level timings (for synced subtitles).
  4. Lays out scenes on a timeline and resolves sound cues.
  5. Generates an adaptive score + all sound effects procedurally (numpy).
  6. Mixes everything with music ducking and loudness-normalises with FFmpeg.

Outputs:
  public/audio/mix_<lang>.wav
  src/generated/timeline_<lang>.json

Usage: python3 scripts/build_audio.py [es|en|all]
"""
import json
import os
import re
import subprocess
import sys
import urllib.request

import numpy as np
import soundfile as sf
from scipy import signal

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS = os.path.join(ROOT, "models")
SR = 48000
FPS = 30
RNG = np.random.default_rng(6)

MODEL_URLS = {
    "kokoro-v1.0.onnx": "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx",
    "voices-v1.0.bin": "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin",
}


# ----------------------------------------------------------------------------
# TTS
# ----------------------------------------------------------------------------
def ensure_models():
    os.makedirs(MODELS, exist_ok=True)
    for name, url in MODEL_URLS.items():
        path = os.path.join(MODELS, name)
        if not os.path.exists(path):
            print("downloading", name)
            urllib.request.urlretrieve(url, path)


_kokoro = None


def tts(text, voice, lang, speed=1.0):
    global _kokoro
    if _kokoro is None:
        from kokoro_onnx import Kokoro

        _kokoro = Kokoro(os.path.join(MODELS, "kokoro-v1.0.onnx"), os.path.join(MODELS, "voices-v1.0.bin"))
    samples, sr = _kokoro.create(text, voice=voice, speed=speed, lang=lang)
    x = signal.resample_poly(samples.astype(np.float64), SR, sr)
    return x


def trim(x, thr_db=-42, pad=0.04):
    env = np.abs(x)
    thr = 10 ** (thr_db / 20) * env.max()
    idx = np.where(env > thr)[0]
    if len(idx) == 0:
        return x
    a = max(0, idx[0] - int(pad * SR))
    b = min(len(x), idx[-1] + int(pad * SR))
    return x[a:b]


# ----------------------------------------------------------------------------
# DSP helpers
# ----------------------------------------------------------------------------
def t_axis(dur):
    return np.arange(int(dur * SR)) / SR


def lowpass(x, fc, order=2):
    b, a = signal.butter(order, min(fc / (SR / 2), 0.99), "low")
    return signal.lfilter(b, a, x)


def highpass(x, fc, order=2):
    b, a = signal.butter(order, fc / (SR / 2), "high")
    return signal.lfilter(b, a, x)


def bandpass(x, lo, hi, order=2):
    b, a = signal.butter(order, [lo / (SR / 2), min(hi / (SR / 2), 0.99)], "band")
    return signal.lfilter(b, a, x)


def env_ad(n, attack, decay):
    t = np.arange(n) / SR
    e = np.minimum(1.0, t / max(attack, 1e-4)) * np.exp(-np.maximum(0, t - attack) / max(decay, 1e-4))
    return e


def reverb(x, seconds=1.8, mix=0.25, damp=4000, predelay=0.02):
    n = int(seconds * SR)
    ir = RNG.standard_normal(n) * np.exp(-np.arange(n) / SR * (6.9 / seconds))
    ir = lowpass(ir, damp)
    ir = np.concatenate([np.zeros(int(predelay * SR)), ir])
    ir /= np.sqrt(np.sum(ir ** 2)) + 1e-9
    wet = signal.fftconvolve(x, ir)[: len(x) + len(ir)]
    out = np.zeros(len(wet))
    out[: len(x)] += x * (1 - mix)
    out += wet * mix
    return out


def norm(x, peak=0.9):
    m = np.max(np.abs(x)) + 1e-9
    return x / m * peak


def noise(n):
    return RNG.standard_normal(n)


def pink(n):
    w = noise(n)
    b, a = [0.049922035, -0.095993537, 0.050612699, -0.004408786], [1, -2.494956002, 2.017265875, -0.522189400]
    return signal.lfilter(b, a, w) * 6


# ----------------------------------------------------------------------------
# Voice processing per character
# ----------------------------------------------------------------------------
def pitch_shift_resample(x, ratio):
    """ratio < 1 lowers pitch (and slows)."""
    up, down = int(round(1000 / ratio)), 1000
    return signal.resample_poly(x, up, down)


LEGACY_FX = {"narrator": ("narrator", 1.0, 0.92), "sixth": ("sixth", 0.86, 0.95)}


def voice_cfg(entry, speaker):
    """Normalise a voice entry. Legacy entries are plain voice names."""
    if isinstance(entry, str):
        fx, pitch, speed = LEGACY_FX.get(speaker, ("room", 1.0, 1.0))
        return {"voice": entry, "fx": fx, "pitch": pitch, "speed": speed}
    cfg = {"fx": "room", "pitch": 1.0, "speed": 1.0}
    cfg.update(entry)
    return cfg


def process_voice(x, fx, pitch=1.0, whisper=False):
    x = highpass(x, 70)
    if abs(pitch - 1.0) > 1e-3:
        x = pitch_shift_resample(x, pitch)
    if fx == "narrator":
        # warm, close: slight low boost + short room
        x = x + 0.25 * lowpass(x, 250)
        x = reverb(x, 0.7, 0.10, 6000)
    elif fx == "room":
        x = reverb(x, 0.9, 0.16, 5000)
    elif fx == "phone":
        x = bandpass(x, 300, 3400)
        x = reverb(x, 0.4, 0.08, 4000)
    elif fx == "hugo":
        dbl = pitch_shift_resample(x, 0.985)[: len(x)]
        x = x + 0.2 * np.pad(dbl, (int(0.01 * SR), 0))[: len(x)]
        x = reverb(x, 1.8, 0.24, 4500, predelay=0.03)
    elif fx == "sixth":
        if whisper:
            env = np.abs(signal.hilbert(x))
            env = lowpass(env, 30)
            breath = highpass(noise(len(x)), 1800) * env * 0.9
            x = 0.35 * x + breath
        # subtle doubled, detuned layer for an uncanny feel
        dbl = pitch_shift_resample(x, 0.97)[: len(x)]
        dbl = np.pad(dbl, (int(0.012 * SR), 0))[: len(x)]
        x = x + 0.35 * dbl
        x = reverb(x, 2.6, 0.32, 3500, predelay=0.04)
    return norm(trim(x, -50, 0.02) if fx not in ("sixth", "hugo") else x, 0.9)


# ----------------------------------------------------------------------------
# Word timing estimation
# ----------------------------------------------------------------------------
PUNCT_END = re.compile(r"[,.;:!?…]+[\"')\]]*$")


def tokenize(text):
    toks = []
    for raw in text.split():
        hl = "*" in raw
        clean = raw.replace("*", "")
        toks.append({"w": clean, "hl": hl})
    return toks


def word_weight(w):
    letters = re.sub(r"[^\wáéíóúüñÁÉÍÓÚÜÑ']", "", w)
    return max(1, len(letters)) + 1.2


def estimate_word_times(x, tokens):
    hop = int(0.01 * SR)
    frames = len(x) // hop
    rms = np.array([np.sqrt(np.mean(x[i * hop:(i + 1) * hop] ** 2)) for i in range(frames)])
    thr = rms.max() * 10 ** (-32 / 20)
    voiced = rms > thr
    idx = np.where(voiced)[0]
    s0, s1 = (idx[0], idx[-1] + 1) if len(idx) else (0, frames)
    # internal silent runs
    gaps = []
    i = s0
    while i < s1:
        if not voiced[i]:
            j = i
            while j < s1 and not voiced[j]:
                j += 1
            if j - i >= 11:
                gaps.append((i, j))
            i = j
        else:
            i += 1
    # phrase chunks by punctuation
    chunks, cur = [], []
    for k, tk in enumerate(tokens):
        cur.append(k)
        if PUNCT_END.search(tk["w"]) and k != len(tokens) - 1:
            chunks.append(cur)
            cur = []
    if cur:
        chunks.append(cur)
    spans = []
    if len(chunks) > 1 and len(gaps) >= len(chunks) - 1:
        best = sorted(sorted(gaps, key=lambda g: g[1] - g[0], reverse=True)[: len(chunks) - 1])
        bounds = [s0]
        for g in best:
            bounds += [g[0], g[1]]
        bounds.append(s1)
        spans = [(bounds[2 * c], bounds[2 * c + 1]) for c in range(len(chunks))]
    else:
        # fall back: whole region, all in one chunk
        chunks = [list(range(len(tokens)))]
        spans = [(s0, s1)]
    out = [None] * len(tokens)
    for ch, (a, b) in zip(chunks, spans):
        ws = np.array([word_weight(tokens[k]["w"]) for k in ch])
        edges = a + np.concatenate([[0], np.cumsum(ws)]) / ws.sum() * (b - a)
        for n, k in enumerate(ch):
            out[k] = (edges[n] * hop / SR, edges[n + 1] * hop / SR)
    return out


# ----------------------------------------------------------------------------
# Sound effects (procedural)
# ----------------------------------------------------------------------------
def sfx_boom(dur=3.0):
    t = t_axis(dur)
    f = 55 * np.exp(-t * 1.2) + 28
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * 1.4)
    hit = lowpass(noise(len(t)), 900) * np.exp(-t * 9) * 0.6
    return norm(reverb(body + hit, 2.5, 0.3, 2500), 0.95)


def sfx_sting(dur=3.2):
    t = t_axis(dur)
    freqs = [220, 233.1, 311.1, 466.2, 659.3, 698.5]
    x = np.zeros(len(t))
    for i, f in enumerate(freqs):
        saw = signal.sawtooth(2 * np.pi * f * (1 + 0.003 * np.sin(2 * np.pi * 5.5 * t + i)) * t)
        x += lowpass(saw, 3000 + 800 * i) / len(freqs)
    e = env_ad(len(t), 0.01, 0.9)
    hit = lowpass(noise(len(t)), 5000) * np.exp(-t * 14) * 0.7
    sub = np.sin(2 * np.pi * 45 * t) * np.exp(-t * 2.5)
    return norm(reverb(x * e + hit + sub * 0.8, 2.8, 0.35, 4000), 0.95)


def sfx_whoosh(dur=1.2):
    t = t_axis(dur)
    n = noise(len(t))
    e = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2
    fc = 400 + 3500 * np.sin(np.pi * t / dur)
    out = np.zeros(len(t))
    blk = 1024
    for i in range(0, len(t), blk):
        seg = n[max(0, i - 4096): i + blk]
        y = bandpass(seg, max(100, fc[i] * 0.5), fc[i] * 1.5)
        out[i:i + blk] = y[-len(out[i:i + blk]):]
    return norm(out * e, 0.8)


def sfx_footsteps(dur):
    x = np.zeros(int(dur * SR))
    step = 0.42
    t0 = 0.05
    while t0 < dur - 0.2:
        n = int(0.12 * SR)
        crunch = bandpass(noise(n), 300, 3500) * env_ad(n, 0.003, 0.035)
        for k in range(3):  # several walkers, slightly offset
            off = int((t0 + 0.07 * k + RNG.uniform(0, 0.03)) * SR)
            if off + n < len(x):
                x[off:off + n] += crunch * RNG.uniform(0.4, 1.0)
        t0 += step
    return norm(x, 0.7)


def sfx_birds(dur):
    x = np.zeros(int(dur * SR))
    t0 = 0.2
    while t0 < dur - 0.5:
        for k in range(RNG.integers(2, 5)):
            n = int(0.09 * SR)
            tt = np.arange(n) / SR
            f0 = RNG.uniform(2800, 4200)
            f = f0 + 1200 * np.sin(np.pi * tt / 0.09) * RNG.choice([-1, 1])
            chirp = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / 0.09) ** 2
            off = int((t0 + k * 0.12) * SR)
            if off + n < len(x):
                x[off:off + n] += chirp * 0.5
        t0 += RNG.uniform(0.9, 1.8)
    return norm(reverb(x, 1.5, 0.3), 0.6)


def sfx_crickets(dur):
    t = t_axis(dur)
    x = np.zeros(len(t))
    for f, rate, ph in [(4300, 14, 0), (4650, 16, 1.3), (3900, 12, 2.1)]:
        carrier = np.sin(2 * np.pi * f * t)
        pulses = (np.sin(2 * np.pi * rate * t + ph) > 0.3).astype(float)
        groups = (np.sin(2 * np.pi * 0.9 * t + ph) > -0.2).astype(float)
        x += carrier * lowpass(pulses * groups, 300)
    return norm(x, 0.5)


def sfx_fire(dur):
    n = int(dur * SR)
    base = lowpass(pink(n), 700) * 0.6
    base *= 0.7 + 0.3 * lowpass(noise(n), 2) / 0.05
    crack = np.zeros(n)
    for _ in range(int(dur * 9)):
        p = RNG.integers(0, n - 2000)
        m = RNG.integers(200, 1500)
        crack[p:p + m] += highpass(noise(m), 1500) * env_ad(m, 0.0005, 0.004) * RNG.uniform(0.3, 1.2)
    return norm(base + crack, 0.7)


def sfx_shutter():
    n = int(0.35 * SR)
    a = highpass(noise(n), 2500) * env_ad(n, 0.001, 0.012)
    b = np.roll(highpass(noise(n), 1800) * env_ad(n, 0.001, 0.02), int(0.07 * SR))
    t = np.arange(n) / SR
    whine = np.sin(2 * np.pi * (3000 + 4000 * t) * t) * np.exp(-t * 18) * 0.15
    return norm(a + 0.8 * b + whine, 0.9)


def sfx_heartbeat(dur):
    x = np.zeros(int(dur * SR))
    period = 0.95
    t0 = 0.0
    while t0 < dur - 0.3:
        for k, amp in [(0, 1.0), (0.22, 0.7)]:
            n = int(0.25 * SR)
            tt = np.arange(n) / SR
            thump = np.sin(2 * np.pi * (60 - 25 * tt) * tt) * env_ad(n, 0.005, 0.07)
            off = int((t0 + k) * SR)
            if off + n < len(x):
                x[off:off + n] += thump * amp
        t0 += period
        period = max(0.62, period * 0.96)
    return norm(lowpass(x, 200), 0.95)


def sfx_glitch():
    n = int(0.6 * SR)
    x = np.zeros(n)
    for i in range(0, n, int(0.03 * SR)):
        m = int(0.03 * SR)
        f = RNG.uniform(200, 3000)
        seg = signal.square(2 * np.pi * f * np.arange(m) / SR) * RNG.uniform(0.2, 1)
        if RNG.random() < 0.4:
            seg = noise(m) * 0.6
        x[i:i + m] = seg[: len(x[i:i + m])]
    return norm(lowpass(x, 6000) * env_ad(n, 0.002, 0.3), 0.6)


def sfx_tick():
    n = int(0.25 * SR)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * 880 * t) * env_ad(n, 0.001, 0.06) + 0.5 * np.sin(2 * np.pi * 1760 * t) * env_ad(n, 0.001, 0.03)
    return norm(reverb(x, 0.6, 0.2), 0.6)


def sfx_flap():
    n = int(0.35 * SR)
    x = bandpass(noise(n), 200, 2000) * env_ad(n, 0.01, 0.07)
    t = np.arange(n) / SR
    pop = np.sin(2 * np.pi * (180 - 100 * t) * t) * env_ad(n, 0.002, 0.05)
    return norm(x + pop, 0.7)


def sfx_click():
    n = int(0.15 * SR)
    a = highpass(noise(n), 3000) * env_ad(n, 0.0005, 0.006)
    b = np.roll(a, int(0.04 * SR)) * 0.6
    t = np.arange(n) / SR
    hum = np.sin(2 * np.pi * 120 * t) * 0.1 * env_ad(n, 0.02, 0.3)
    return norm(a + b + hum, 0.8)


def sfx_wind(dur=3.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = bandpass(pink(n), 200, 1800)
    e = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.5
    gust = 0.6 + 0.4 * np.sin(2 * np.pi * 0.7 * t)
    return norm(x * e * gust, 0.8)


def sfx_fireout():
    n = int(1.6 * SR)
    t = np.arange(n) / SR
    hiss = highpass(noise(n), 2000) * np.exp(-t * 2.5)
    thud = lowpass(noise(n), 300) * env_ad(n, 0.005, 0.2)
    return norm(hiss * 0.7 + thud, 0.85)


def sfx_chime():
    n = int(2.5 * SR)
    t = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * d) for f, d in [(523.25, 2), (659.25, 2.5), (783.99, 3), (1046.5, 3.5)])
    return norm(reverb(x, 2, 0.35), 0.6)


def sfx_riser(dur=4.0):
    t = t_axis(dur)
    x = np.zeros(len(t))
    for f in [110, 116.5, 164.8, 233]:
        x += signal.sawtooth(2 * np.pi * f * (1 + 0.04 * t / dur) * t)
    x = lowpass(x, 1200)
    e = (t / dur) ** 2
    return norm(reverb(x * e, 2, 0.3), 0.7)


def sfx_ping():
    n = int(0.9 * SR)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * 1318.5 * t) * env_ad(n, 0.002, 0.18) + 0.7 * np.sin(2 * np.pi * 1760 * t) * env_ad(n, 0.002, 0.25) * (t > 0.09)
    return norm(reverb(x, 0.8, 0.15), 0.6)


def sfx_buzz():
    n = int(0.9 * SR)
    t = np.arange(n) / SR
    gate = ((t % 0.45) < 0.3).astype(float)
    x = signal.square(2 * np.pi * 170 * t) * 0.5 + np.sin(2 * np.pi * 85 * t)
    return norm(lowpass(x * lowpass(gate, 60), 900), 0.6)


def sfx_typing(dur=2.0):
    x = np.zeros(int(dur * SR))
    t0 = 0.0
    while t0 < dur - 0.1:
        n = int(0.03 * SR)
        a = int(t0 * SR)
        x[a:a + n] += highpass(noise(n), 2500) * env_ad(n, 0.0005, 0.006) * RNG.uniform(0.4, 1)
        t0 += RNG.uniform(0.07, 0.16)
    return norm(x, 0.5)


def sfx_clock(dur):
    x = np.zeros(int(dur * SR))
    t0, k = 0.1, 0
    while t0 < dur - 0.1:
        n = int(0.05 * SR)
        tt = np.arange(n) / SR
        f = 2400 if k % 2 == 0 else 2000
        a = int(t0 * SR)
        x[a:a + n] += np.sin(2 * np.pi * f * tt) * env_ad(n, 0.0005, 0.008)
        t0 += 0.5
        k += 1
    return norm(reverb(x, 0.6, 0.25), 0.5)


def sfx_owl(dur=2.5):
    x = np.zeros(int(dur * SR))
    for start, ln in [(0.0, 0.35), (0.55, 0.25), (0.9, 0.6)]:
        n = int(ln * SR)
        tt = np.arange(n) / SR
        f = 360 - 40 * tt / ln
        hoot = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / ln) ** 1.5
        a = int(start * SR)
        x[a:a + n] += hoot
    return norm(reverb(x, 2.2, 0.4), 0.6)


def sfx_magic(dur=3.5):
    t = t_axis(dur)
    x = np.zeros(len(t))
    for i, f in enumerate([523.25, 659.25, 783.99, 1046.5, 1318.5, 1568, 2093]):
        on = i * 0.18
        e = np.clip((t - on) / 0.05, 0, 1) * np.exp(-np.maximum(0, t - on) * 1.4)
        x += np.sin(2 * np.pi * f * t) * e * 0.4
    shimmer = highpass(noise(len(t)), 6000) * np.exp(-t * 1.2) * 0.15
    return norm(reverb(x + shimmer, 3.0, 0.45), 0.7)


def sfx_swipe():
    return sfx_whoosh(0.45)


def sfx_splash():
    n = int(1.6 * SR)
    t = np.arange(n) / SR
    body = bandpass(noise(n), 300, 5000) * np.exp(-t * 4)
    drops = np.zeros(n)
    for _ in range(40):
        p0 = RNG.integers(int(0.1 * SR), n - 3000)
        m = 1500
        tt = np.arange(m) / SR
        f = RNG.uniform(800, 2500)
        drops[p0:p0 + m] += np.sin(2 * np.pi * (f + 3000 * tt) * tt) * env_ad(m, 0.001, 0.01) * RNG.uniform(0.1, 0.4)
    thump = lowpass(noise(n), 200) * env_ad(n, 0.003, 0.12)
    return norm(reverb(body + drops + thump, 1.0, 0.2), 0.85)


def sfx_engine(dur):
    t = t_axis(dur)
    f = 32 + 2 * np.sin(2 * np.pi * 0.5 * t)
    x = signal.sawtooth(2 * np.pi * np.cumsum(f) / SR) * 0.6 + bandpass(noise(len(t)), 80, 600) * 0.4
    x *= 0.8 + 0.2 * np.sin(2 * np.pi * f * 0.5 * t)
    return norm(lowpass(x, 700), 0.6)


def sfx_powerdown():
    n = int(2.2 * SR)
    t = np.arange(n) / SR
    f = 60 * np.exp(-t * 1.5) + 8
    hum = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.5 * np.sin(2 * np.pi * np.cumsum(f * 2) / SR)
    clunk = lowpass(noise(n), 400) * env_ad(n, 0.002, 0.08)
    return norm(hum * np.exp(-t * 1.2) * 0.7 + clunk, 0.8)


def sfx_static(dur=2.5):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = bandpass(noise(n), 900, 4500) * (0.6 + 0.4 * (np.sin(2 * np.pi * 7 * t) > 0))
    return norm(x * np.minimum(1, t / 0.05), 0.5)


def sfx_breath(dur=3.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = np.zeros(n)
    period = 1.3
    for k in range(int(dur / period) + 1):
        for off, ln, amp in [(0.0, 0.55, 1.0), (0.62, 0.6, 0.8)]:
            a = int((k * period + off) * SR)
            m = int(ln * SR)
            if a + m < n:
                x[a:a + m] += bandpass(noise(m), 400, 2400) * np.sin(np.pi * np.arange(m) / m) ** 2 * amp
    radio = bandpass(x, 500, 3000) + 0.15 * bandpass(noise(n), 1000, 4000)
    return norm(radio, 0.7)


def sfx_scrape(dur=1.8):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 900 + 300 * np.sin(2 * np.pi * 1.3 * t)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.4 + bandpass(noise(n), 2000, 7000) * 0.5
    x *= np.sin(np.pi * np.clip(t / dur, 0, 1)) * (0.7 + 0.3 * np.sin(2 * np.pi * 23 * t))
    return norm(reverb(x, 1.5, 0.3), 0.7)


def sfx_thud():
    n = int(0.8 * SR)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * (90 - 50 * t) * t) * env_ad(n, 0.002, 0.08) + highpass(noise(n), 2000) * env_ad(n, 0.001, 0.01) * 0.4
    roll = bandpass(noise(n), 300, 1500) * (t > 0.1) * np.exp(-np.maximum(0, t - 0.1) * 3) * 0.25
    return norm(x + roll, 0.8)


def sfx_car(dur=4.0):
    t = t_axis(dur)
    f = 48 + 10 * np.sin(2 * np.pi * 0.3 * t)
    x = signal.sawtooth(2 * np.pi * np.cumsum(f) / SR) * 0.5 + bandpass(noise(len(t)), 100, 900) * 0.5
    x = lowpass(x, 900) * np.minimum(1, t / 0.6)
    return norm(x, 0.6)


def sfx_screech():
    n = int(1.4 * SR)
    t = np.arange(n) / SR
    f = 2400 - 600 * t
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.4 + bandpass(noise(n), 1500, 6000) * 0.6
    return norm(x * np.exp(-t * 1.4) * np.minimum(1, t / 0.03), 0.8)


def sfx_snap():
    x = np.zeros(int(1.2 * SR))
    for k in range(3):
        n = int(0.06 * SR)
        a = int(RNG.uniform(0, 0.8) * SR)
        x[a:a + n] += highpass(noise(n), 1200) * env_ad(n, 0.0005, 0.012) * RNG.uniform(0.5, 1)
    return norm(reverb(x, 1.2, 0.3), 0.8)


SFX = {
    "boom": lambda d: sfx_boom(),
    "sting": lambda d: sfx_sting(),
    "whoosh": lambda d: sfx_whoosh(),
    "footsteps": sfx_footsteps,
    "birds": sfx_birds,
    "crickets": sfx_crickets,
    "fire": sfx_fire,
    "shutter": lambda d: sfx_shutter(),
    "heartbeat": sfx_heartbeat,
    "glitch": lambda d: sfx_glitch(),
    "tick": lambda d: sfx_tick(),
    "flap": lambda d: sfx_flap(),
    "click": lambda d: sfx_click(),
    "wind": lambda d: sfx_wind(),
    "fireout": lambda d: sfx_fireout(),
    "chime": lambda d: sfx_chime(),
    "riser": lambda d: sfx_riser(),
    "ping": lambda d: sfx_ping(),
    "buzz": lambda d: sfx_buzz(),
    "typing": sfx_typing,
    "clock": sfx_clock,
    "owl": lambda d: sfx_owl(),
    "magic": lambda d: sfx_magic(),
    "swipe": lambda d: sfx_swipe(),
    "splash": lambda d: sfx_splash(),
    "engine": sfx_engine,
    "powerdown": lambda d: sfx_powerdown(),
    "static": lambda d: sfx_static(),
    "breath": sfx_breath,
    "scrape": lambda d: sfx_scrape(),
    "thud": lambda d: sfx_thud(),
    "car": lambda d: sfx_car(),
    "screech": lambda d: sfx_screech(),
    "snap": lambda d: sfx_snap(),
}


# ----------------------------------------------------------------------------
# Adaptive score
# ----------------------------------------------------------------------------
MOOD = {  # layer gains per scene
    "hook": {"drone": 1.0, "pulse": 0.6, "cluster": 0.3},
    "trail": {"pluck": 1.0, "pad": 0.55},
    "tents": {"pluck": 0.8, "pad": 0.5},
    "photo": {"pluck": 0.25, "pad": 0.25, "drone": 0.35},
    "phone": {"drone": 0.8, "cluster": 0.5},
    "count": {"drone": 0.8, "pulse": 0.7, "cluster": 0.3},
    "talk": {"drone": 0.9, "cluster": 0.7},
    "shadow": {"drone": 1.0, "cluster": 1.0, "pulse": 0.8},
    "blackout": {"drone": 0.25},
    "dawn": {"pad": 0.8, "pluck": 0.45},
    "twist": {"drone": 1.0, "cluster": 0.9},
    "end": {"drone": 0.8, "cluster": 0.4},
}


def karplus(freq, dur, decay=0.996):
    n = int(dur * SR)
    p = int(SR / freq)
    buf = RNG.uniform(-1, 1, p)
    out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = decay * 0.5 * (buf[i % p] + buf[(i + 1) % p])
    return out


def layer_pluck(total):
    x = np.zeros(int(total * SR))
    bpm = 84
    beat = 60 / bpm / 2
    chords = [[261.6, 329.6, 392.0, 523.3], [196.0, 246.9, 293.7, 392.0], [220.0, 261.6, 329.6, 440.0], [174.6, 220.0, 261.6, 349.2]]
    cache = {}
    t0, k = 0.0, 0
    while t0 < total - 1:
        ch = chords[(k // 8) % 4]
        f = ch[[0, 2, 1, 3, 2, 1, 3, 2][k % 8]]
        if f not in cache:
            cache[f] = karplus(f, 1.6)
        s = cache[f]
        a = int(t0 * SR)
        b = min(len(x), a + len(s))
        x[a:b] += s[: b - a] * 0.5
        t0 += beat
        k += 1
    return reverb(x, 1.8, 0.3)


def layer_pad(total):
    t = t_axis(total)
    x = np.zeros(len(t))
    for f in [130.8, 196.0, 261.6, 329.6, 392.0]:
        for d in (-0.4, 0.4):
            x += signal.sawtooth(2 * np.pi * (f + d) * t) * 0.1
    x = lowpass(x, 900)
    x *= 0.8 + 0.2 * np.sin(2 * np.pi * 0.15 * t)
    return x


def layer_drone(total):
    t = t_axis(total)
    x = np.zeros(len(t))
    for f in [55, 55.3, 82.4, 110.2, 116.5]:
        x += signal.sawtooth(2 * np.pi * f * t) * 0.2
    x = lowpass(x, 420)
    x += 0.4 * lowpass(pink(len(t)), 200)
    x *= 0.75 + 0.25 * np.sin(2 * np.pi * 0.09 * t)
    return x


def layer_cluster(total):
    t = t_axis(total)
    x = np.zeros(len(t))
    for i, f in enumerate([880, 932.3, 987.8, 1318.5, 1396.9]):
        x += np.sin(2 * np.pi * f * t + 0.3 * np.sin(2 * np.pi * (4 + i * 0.7) * t)) * 0.12
    x *= 0.6 + 0.4 * np.sin(2 * np.pi * 0.23 * t) ** 2
    return reverb(x, 3, 0.45)[: len(t)]


def layer_pulse(total):
    x = np.zeros(int(total * SR))
    beat = 60 / 76
    t0 = 0.0
    n = int(0.6 * SR)
    tt = np.arange(n) / SR
    hit = np.sin(2 * np.pi * (70 - 35 * tt) * tt) * env_ad(n, 0.004, 0.18)
    while t0 < total - 0.6:
        a = int(t0 * SR)
        x[a:a + n] += hit
        t0 += beat
    return lowpass(x, 180)


LAYERS = {"pluck": layer_pluck, "pad": layer_pad, "drone": layer_drone, "cluster": layer_cluster, "pulse": layer_pulse}


def gain_curve(scenes, layer, total, xfade=0.7):
    n = int(total * SR)
    g = np.zeros(n)
    for sc in scenes:
        a = int(sc["start"] * SR)
        b = min(n, int((sc["start"] + sc["duration"]) * SR))
        g[a:b] = (sc.get("mood") or MOOD.get(sc["id"], {})).get(layer, 0.0)
    # smooth transitions
    k = int(xfade * SR)
    win = np.hanning(k)
    win /= win.sum()
    return signal.fftconvolve(g, win, mode="same")


# ----------------------------------------------------------------------------
# Build
# ----------------------------------------------------------------------------
def resolve_ref(ref, scene_rel_lines):
    if ref == "start":
        return 0.0
    m = re.match(r"line(\d+)\.(start|end)$", ref)
    if m:
        ln = scene_rel_lines[int(m.group(1))]
        return ln[m.group(2)]
    m = re.match(r"word:([^@]+)(?:@(\d+))?$", ref)
    if m:
        cands = m.group(1).split("|")
        only = int(m.group(2)) if m.group(2) else None
        for li, ln in enumerate(scene_rel_lines):
            if only is not None and li != only:
                continue
            for w in ln["words"]:
                key = re.sub(r"[^\wáéíóúüñ']", "", w["w"].lower())
                if key in cands:
                    return w["start"]
        raise ValueError(f"word ref not found: {ref}")
    raise ValueError(ref)


# Default mix (legacy). A script may override any key with a top-level "mix" object.
MIX_DEFAULT = {"voice": 1.0, "music": 0.28, "sfx": 0.55, "duck": 0.55, "sfx_duck": 0.0}
MIXCFG = dict(MIX_DEFAULT)


def build(lang, script_path):
    script = json.load(open(script_path))
    MIXCFG.clear()
    MIXCFG.update(MIX_DEFAULT)
    MIXCFG.update(script.get("mix", {}))
    slug = script.get("slug")
    out_name = f"{slug}_{lang}" if slug else lang
    voices = script["voices"][lang]
    lcode = script["langCodes"][lang]
    t = 0.0
    timeline = {"lang": lang, "fps": FPS, "title": script["title"][lang], "part": script.get("part", {}).get(lang, ""), "scenes": []}
    voice_events = []  # (abs_start, audio)
    for sc in script["scenes"]:
        lines = []
        cursor = 0.0
        for li, ln in enumerate(sc["lines"]):
            text = ln[lang]
            spoken = text.replace("*", "")
            vc = voice_cfg(voices[ln["speaker"]], ln["speaker"])
            speed = ln.get("slow", 1.0) * vc["speed"]
            raw = tts(spoken, vc["voice"], lcode, speed)
            raw = trim(raw)
            tokens = tokenize(text)
            times = estimate_word_times(raw, tokens)
            audio = process_voice(raw, vc["fx"], vc["pitch"], ln.get("whisper", False))
            # resampling pitch shift changes duration; scale word times accordingly
            stretch = 1 / vc["pitch"]
            times = [(a * stretch, b * stretch) for a, b in times]
            start = ln["at"] if "at" in ln else cursor + ln.get("gap", 0.3)
            speech_len = times[-1][1] if times else len(audio) / SR
            end = start + speech_len
            cursor = end
            words = [{"w": tk["w"], "hl": tk["hl"], "start": round(start + a, 3), "end": round(start + b, 3)} for tk, (a, b) in zip(tokens, times)]
            lines.append({"speaker": ln["speaker"], "text": spoken, "start": round(start, 3), "end": round(end, 3), "words": words})
            voice_events.append((t + start, audio, vc["fx"]))
        dur = max(sc["minSeconds"], cursor + sc.get("tail", 0.6))
        dur = round(dur * FPS) / FPS
        cues = {}
        cue_list = []
        for c in sc.get("cues", []):
            ct = resolve_ref(c["ref"], lines) + c.get("offset", 0.0)
            cues[c["id"]] = round(ct, 3)
            cue_list.append((t + ct, c, dur - max(0, ct)))
        timeline["scenes"].append({"id": sc["id"], "start": round(t, 4), "duration": dur, "lines": lines, "cues": cues, "mood": sc.get("mood")})
        sc["_cues"] = cue_list
        t += dur
    total = t
    timeline["durationInFrames"] = int(round(total * FPS))
    print(f"[{lang}] total {total:.2f}s")

    n = int((total + 3) * SR)
    voice_bus = np.zeros(n)
    for start, audio, spk in voice_events:
        a = int(start * SR)
        b = min(n, a + len(audio))
        voice_bus[a:b] += audio[: b - a] * (0.85 if spk == "sixth" else 1.0)

    sfx_bus = np.zeros(n)
    for sc in script["scenes"]:
        for abs_t, c, remain in sc["_cues"]:
            span = remain + 0.4 if c.get("span") == "scene" else 3.0
            s = SFX[c["sound"]](max(0.5, span))
            if c.get("span") == "scene":
                fade = int(0.35 * SR)
                s[:fade] *= np.linspace(0, 1, fade)
                s[-fade:] *= np.linspace(1, 0, fade)
            a = int(max(0, abs_t) * SR)
            b = min(n, a + len(s))
            sfx_bus[a:b] += s[: b - a] * c.get("gain", 0.7)

    music = np.zeros(n)
    for name, fn in LAYERS.items():
        layer = fn(total)
        layer = norm(layer, 1.0)
        g = gain_curve(timeline["scenes"], name, total)
        m = min(len(layer), len(g))
        music[:m] += layer[:m] * g[:m] * MIXCFG['music']
    # duck music under voice
    venv = lowpass(np.abs(voice_bus), 8)
    venv = np.clip(venv / (venv.max() + 1e-9) * 4, 0, 1)
    venv = signal.fftconvolve(venv, np.hanning(int(0.3 * SR)) / (0.15 * SR), mode="same")
    duck = 1 - MIXCFG['duck'] * np.clip(venv, 0, 1)
    sfx_duck = 1 - MIXCFG['sfx_duck'] * np.clip(venv, 0, 1)
    mix = voice_bus * MIXCFG['voice'] + sfx_bus * MIXCFG['sfx'] * sfx_duck + music * duck
    end = int((total) * SR)
    mix = mix[:end]
    fade = int(0.8 * SR)
    mix[-fade:] *= np.linspace(1, 0, fade)
    mix = norm(mix, 0.95)
    stereo = np.stack([mix, mix], axis=1)

    os.makedirs(os.path.join(ROOT, "public", "audio"), exist_ok=True)
    os.makedirs(os.path.join(ROOT, "src", "generated"), exist_ok=True)
    raw_path = os.path.join(ROOT, "public", "audio", f"_raw_{out_name}.wav")
    out_path = os.path.join(ROOT, "public", "audio", f"mix_{out_name}.wav")
    sf.write(raw_path, stereo.astype(np.float32), SR, subtype="FLOAT")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", raw_path, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", str(SR), "-c:a", "pcm_s16le", out_path], check=True)
    os.remove(raw_path)
    with open(os.path.join(ROOT, "src", "generated", f"timeline_{out_name}.json"), "w") as f:
        json.dump(timeline, f, ensure_ascii=False, indent=1)
    print(f"[{out_name}] wrote {out_path}")


if __name__ == "__main__":
    # usage: build_audio.py [script.json] [es|en|all]
    #        build_audio.py [es|en|all]            (legacy: story/script.json)
    args = sys.argv[1:]
    script_path = os.path.join(ROOT, "story", "script.json")
    if args and args[0].endswith(".json"):
        script_path = os.path.abspath(args.pop(0))
    ensure_models()
    available = list(json.load(open(script_path))["langCodes"].keys())
    which = args[0] if args else "all"
    for lg in (available if which == "all" else [which]):
        build(lg, script_path)
