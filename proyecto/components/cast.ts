// Biblioteca de personajes ("model sheets"). Cada diseño se reutiliza en todos los vídeos para mantener la continuidad.
// Rasgos elegidos a partir de la iconografía histórica más reconocible de cada figura.
import type {Design} from './Character';

const SKIN = {light: '#f6cfae', pale: '#f3d3bb', warm: '#e9b48e', tan: '#d39a6a', brown: '#b77b52', ruddy: '#f0b9a0'};

export const CAST: Record<string, Design> = {
  // ---------- URSS ----------
  gorbachov: {
    name: 'Mijaíl Gorbachov', skin: SKIN.light, build: 'stout', face: 'round', nose: 'round',
    hair: {style: 'baldFringe', color: '#8f8a85'}, brows: '#6a645f',
    outfit: {type: 'suit', coat: '#3b4250', pants: '#323844', shirt: '#f2f2ee', tie: '#7a2632', boots: '#1d1d22'},
    extras: {birthmark: true, glasses: undefined},
  },
  yeltsin: {
    name: 'Borís Yeltsin', skin: SKIN.ruddy, build: 'big', face: 'square', nose: 'big',
    hair: {style: 'wavy', color: '#e9e6e0'}, brows: '#9a948c',
    outfit: {type: 'suit', coat: '#4a4f58', pants: '#3e434b', shirt: '#eef0f3', tie: '#2b4a7a', boots: '#1d1d22'},
  },
  sovietSoldier: {
    name: 'Soldado soviético', skin: SKIN.light, build: 'normal', nose: 'small',
    hair: {style: 'buzz', color: '#6b4f33'},
    hat: {style: 'helmet', color: '#5b6b3f', accent: '#d33'},
    outfit: {type: 'tunic', coat: '#7a7d52', pants: '#6a6c47', boots: '#2a2420', belt: '#4a3a24'},
    prop: 'rifle',
  },
  sovietGeneral: {
    name: 'General soviético', skin: SKIN.light, build: 'stout', face: 'square', nose: 'big',
    hair: {style: 'short', color: '#7d7468'},
    hat: {style: 'peakedCap', color: '#6f7449', accent: '#b5262f', accent2: '#e8b33b'},
    outfit: {type: 'tunic', coat: '#6f7449', pants: '#5d6140', boots: '#1d1d1d', medals: 6, epaulettes: '#d6b04a', buttons: '#d6b04a'},
    extras: {wrinkles: true},
  },
  // ---------- Napoleón ----------
  napoleon: {
    name: 'Napoleón Bonaparte', skin: SKIN.pale, build: 'normal', face: 'oval', nose: 'long',
    hair: {style: 'napoleon', color: '#4a3324'},
    hat: {style: 'bicorne', color: '#16141a'},
    outfit: {type: 'military', coat: '#1d3f8f', accent: '#c81e2e', vest: '#f4f0e6', pants: '#f4f0e6', boots: '#151316',
      epaulettes: '#e8b33b', tails: true, collar: '#c81e2e', buttons: '#e8b33b'},
    hideHandR: true,
  },
  napoleonCoronation: {
    name: 'Napoleón I (coronación)', skin: SKIN.pale, build: 'normal', face: 'oval', nose: 'long',
    hair: {style: 'napoleon', color: '#4a3324'},
    hat: {style: 'laurel', color: '#e8b33b', accent: '#e8b33b'},
    outfit: {type: 'robe', coat: '#f4f0e6', pants: '#f4f0e6', boots: '#e8b33b', cape: '#a01828', collar: '#f7f3ea', sash: '#e8b33b'},
  },
  napoleonWinter: {
    name: 'Napoleón (Rusia, 1812)', skin: SKIN.pale, build: 'normal', face: 'oval', nose: 'long',
    hair: {style: 'napoleon', color: '#4a3324'},
    hat: {style: 'bicorne', color: '#16141a'},
    outfit: {type: 'greatcoat', coat: '#6f6e6a', pants: '#f4f0e6', boots: '#151316', buttons: '#cfcfcf', collar: '#5a5955'},
    hideHandR: true,
  },
  wellington: {
    name: 'Duque de Wellington', skin: SKIN.light, build: 'slim', face: 'long', nose: 'hook',
    hair: {style: 'short', color: '#8a8580'},
    hat: {style: 'bicorneFore', color: '#16141a'},
    outfit: {type: 'military', coat: '#1d2433', pants: '#e9e4d6', boots: '#151316', cape: '#1a2030', buttons: '#c9c9c9', collar: '#1d2433'},
    prop: 'telescope',
  },
  blucher: {
    name: 'Mariscal Blücher', skin: SKIN.ruddy, build: 'normal', face: 'square', nose: 'big',
    hair: {style: 'short', color: '#e8e4dc'}, facial: {style: 'walrus', color: '#ecebe6'}, brows: '#d6d2c8',
    hat: {style: 'bicorne', color: '#16141a'},
    outfit: {type: 'military', coat: '#1d2a3a', accent: '#b5262f', pants: '#d8d4c8', boots: '#151316', epaulettes: '#d0d0d0', tails: true, collar: '#b5262f'},
    extras: {wrinkles: true}, prop: 'saber',
  },
  kutuzov: {
    name: 'Mijaíl Kutúzov', skin: SKIN.ruddy, build: 'big', face: 'round', nose: 'round',
    hair: {style: 'balding', color: '#e2ded6'},
    outfit: {type: 'military', coat: '#1f4a30', accent: '#b5262f', pants: '#e5e0d2', boots: '#151316', epaulettes: '#e8b33b', sash: '#e8b33b', medals: 3, collar: '#b5262f'},
    extras: {eyepatch: true, wrinkles: true},
  },
  grenadier: {
    name: 'Granadero francés', skin: SKIN.light, nose: 'small',
    hair: {style: 'short', color: '#4a3324'}, facial: {style: 'mustache', color: '#3a271a'},
    hat: {style: 'bearskin', color: '#1b1716', accent: '#e8b33b'},
    outfit: {type: 'military', coat: '#1d3f8f', accent: '#f4f0e6', pants: '#f4f0e6', boots: '#151316', epaulettes: '#c81e2e', tails: true, belt: '#f4f0e6'},
    prop: 'rifle',
  },
  // ---------- Taiwán ----------
  plaGeneral: {
    name: 'General chino (ficticio)', skin: SKIN.warm, build: 'stout', face: 'square', nose: 'small',
    hair: {style: 'short', color: '#1d1a19'},
    hat: {style: 'peakedCap', color: '#3f5a37', accent: '#b5262f', accent2: '#e8b33b'},
    outfit: {type: 'tunic', coat: '#3f5a37', pants: '#36502f', boots: '#121212', medals: 6, epaulettes: '#d6b04a', buttons: '#d6b04a'},
  },
  twSoldier: {
    name: 'Soldado taiwanés', skin: SKIN.warm, nose: 'small',
    hair: {style: 'buzz', color: '#1d1a19'},
    hat: {style: 'helmet', color: '#5b6447'},
    outfit: {type: 'combat', coat: '#5d6a4a', pants: '#525e41', boots: '#1d1d1d', belt: '#2b2b25'},
    prop: 'modernRifle',
  },
  chipEngineer: {
    name: 'Ingeniera de chips', skin: SKIN.warm, nose: 'small',
    hat: {style: 'hood', color: '#f1f4f8'},
    outfit: {type: 'cleanroom', coat: '#f1f4f8', pants: '#f1f4f8', boots: '#dfe6ee', glove: '#9fd0ff'},
    extras: {mask: true}, prop: 'chip',
  },
  usAdmiral: {
    name: 'Almirante de EE. UU. (ficticio)', skin: SKIN.light, build: 'normal', face: 'square', nose: 'small',
    hair: {style: 'short', color: '#a9a39b'},
    hat: {style: 'peakedCap', color: '#f4f4f4', accent: '#111827', accent2: '#e8b33b'},
    outfit: {type: 'military', coat: '#151d33', pants: '#151d33', boots: '#111', buttons: '#e8b33b', medals: 6, collar: '#151d33'},
  },
  analyst: {
    name: 'Analista', skin: SKIN.brown, nose: 'small',
    hair: {style: 'short', color: '#1d1a19'},
    outfit: {type: 'suit', coat: '#2f3a4f', pants: '#2a3242', shirt: '#eef', tie: '#c0392b'},
    extras: {glasses: 'square'}, prop: 'pointer',
  },
  // ---------- España ----------
  aranda: {
    name: 'Conde de Aranda', skin: SKIN.pale, build: 'normal', face: 'long', nose: 'long',
    hair: {style: 'wig', color: '#ecebe8'}, brows: '#8a8076',
    outfit: {type: 'court', coat: '#6b1f2b', pants: '#6b1f2b', vest: '#e3c56a', boots: '#151316', buttons: '#e8b33b', sash: '#2a5db0', embroidery: '#e8b33b'},
    extras: {wrinkles: true}, prop: 'paper',
  },
  carlos3: {
    name: 'Carlos III', skin: SKIN.ruddy, build: 'slim', face: 'long', nose: 'hook',
    hair: {style: 'wig', color: '#d9d6d0'},
    outfit: {type: 'court', coat: '#2b2b2f', pants: '#2b2b2f', vest: '#d9c27a', boots: '#151316', sash: '#2a5db0', medals: 2},
  },
  fernando7: {
    name: 'Fernando VII', skin: SKIN.pale, build: 'stout', face: 'jaw', nose: 'big',
    hair: {style: 'short', color: '#2a1d16'}, facial: {style: 'bigSideburns', color: '#2a1d16'},
    outfit: {type: 'military', coat: '#1d3a7a', accent: '#c81e2e', pants: '#f0ece0', boots: '#151316', epaulettes: '#e8b33b', sash: '#3a6fd1', medals: 3, collar: '#c81e2e', embroidery: '#e8b33b'},
  },
  bolivar: {
    name: 'Simón Bolívar', skin: SKIN.warm, build: 'slim', face: 'long', nose: 'long',
    hair: {style: 'curly', color: '#2a1d16'}, facial: {style: 'sideburns', color: '#2a1d16'},
    outfit: {type: 'military', coat: '#17264d', accent: '#c81e2e', pants: '#f0ece0', boots: '#151316', epaulettes: '#e8b33b', collar: '#c81e2e', embroidery: '#e8b33b', buttons: '#e8b33b'},
    prop: 'saber',
  },
  sanmartin: {
    name: 'José de San Martín', skin: SKIN.warm, build: 'normal', face: 'oval', nose: 'big',
    hair: {style: 'short', color: '#241914'}, facial: {style: 'bigSideburns', color: '#241914'},
    outfit: {type: 'military', coat: '#1a2b55', accent: '#c81e2e', pants: '#f0ece0', boots: '#151316', epaulettes: '#e8b33b', collar: '#c81e2e', buttons: '#e8b33b'},
    prop: 'saber',
  },
  realista: {
    name: 'Soldado realista', skin: SKIN.light, nose: 'small',
    hair: {style: 'short', color: '#3a2a20'}, facial: {style: 'mustache', color: '#3a2a20'},
    hat: {style: 'shako', color: '#1a1a1a', accent: '#e8b33b', accent2: '#c81e2e'},
    outfit: {type: 'military', coat: '#f0ece0', accent: '#2a5db0', pants: '#f0ece0', boots: '#151316', belt: '#3a2a20'},
    prop: 'rifle',
  },
  // ---------- Segunda Guerra Mundial ----------
  youngHitler: {
    name: 'Adolf Hitler (1907)', skin: SKIN.pale, build: 'slim', face: 'long', nose: 'long',
    hair: {style: 'sidePart', color: '#3a2a20'}, facial: {style: 'mustache', color: '#3a2a20'},
    hat: undefined,
    outfit: {type: 'smock', coat: '#d9cdb4', shirt: '#f4f1e8', pants: '#3b3a44', boots: '#1a1a1a'},
    prop: 'brush',
  },
  chamberlain: {
    name: 'Neville Chamberlain', skin: SKIN.light, build: 'slim', face: 'long', nose: 'big',
    hair: {style: 'short', color: '#a8a39c'}, facial: {style: 'mustache', color: '#8f8a83'},
    outfit: {type: 'suit', coat: '#2a2a30', pants: '#3a3a42', shirt: '#fbfbf5', tie: '#5a5a62'},
    extras: {wrinkles: true}, prop: 'paper',
  },
  churchill: {
    name: 'Winston Churchill', skin: SKIN.ruddy, build: 'big', face: 'round', nose: 'round',
    hair: {style: 'balding', color: '#d8b48a'},
    hat: {style: 'homburg', color: '#1c1c20', accent: '#2c2c32'},
    outfit: {type: 'suit', coat: '#2b2d36', pants: '#2b2d36', shirt: '#f6f6f0', tie: '#3a5a9a'},
    extras: {cigar: true},
  },
  stalin: {
    name: 'Iósif Stalin', skin: SKIN.light, build: 'normal', face: 'square', nose: 'big',
    hair: {style: 'combBack', color: '#4a4440'}, facial: {style: 'walrus', color: '#3d3733'},
    outfit: {type: 'tunic', coat: '#9a9478', pants: '#8c866b', boots: '#1d1d1d', collar: '#9a9478'},
    extras: {pipe: true},
  },
  gandhi: {
    name: 'Mahatma Gandhi', skin: SKIN.brown, build: 'slim', face: 'oval', nose: 'big',
    hair: {style: 'baldFringe', color: '#d8d6d0'}, facial: {style: 'mustache', color: '#e2e0da'},
    outfit: {type: 'dhoti', coat: '#f4f1e6', pants: '#f4f1e6'},
    extras: {glasses: 'round'},
  },
  // ---------- figurantes ----------
  citizenM: {name: 'Ciudadano', skin: SKIN.light, hair: {style: 'short', color: '#5a3e2a'}, hat: {style: 'ushanka', color: '#5a4a3a'},
    outfit: {type: 'greatcoat', coat: '#4d4a46', pants: '#2f2d2b', boots: '#1a1a1a'}},
  citizenF: {name: 'Ciudadana', skin: SKIN.light, hair: {style: 'long', color: '#a0612e'},
    outfit: {type: 'greatcoat', coat: '#7a2e3a', pants: '#2f2d2b', boots: '#1a1a1a'}},
  protester: {name: 'Manifestante', skin: SKIN.light, hair: {style: 'short', color: '#3a2a20'}, facial: {style: 'stubble', color: '#3a2a20'},
    outfit: {type: 'suit', coat: '#5a6b7a', pants: '#2f3540', shirt: '#ddd'}, prop: 'flag', propColor: '#fff'},
};
