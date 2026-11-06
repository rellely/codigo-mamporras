import React from 'react';
import {useCurrentFrame} from 'remotion';
import {SharedDefs} from '../components/Character';
import {GalleryScreen, Phone} from '../components/sets/PhoneUI';
import {EASE, kf} from '../lib/anim';

export type Crop = {x: number; y: number; w: number; h: number};
export type PhoneSpot = {x: number; y: number; s: number};
export const PHOTO = {w: 600, h: 800, top: 190};

/** Stage coordinates of a world point shown inside the phone photo. */
export const photoPoint = (px: number, py: number, c: Crop, p: PhoneSpot) => ({
	x: p.x + p.s * (-300 + ((px - c.x) * PHOTO.w) / c.w),
	y: p.y + p.s * (-590 + PHOTO.top + ((py - c.y) * PHOTO.h) / c.h),
});

const PhotoView: React.FC<{node: React.ReactNode; crop: Crop; style?: React.CSSProperties}> = ({node, crop, style}) => (
	<svg width={PHOTO.w} height={PHOTO.h} viewBox={`${crop.x} ${crop.y} ${crop.w} ${crop.h}`} preserveAspectRatio="xMidYMid slice" style={style}>
		<SharedDefs />
		{node}
	</svg>
);

/** Phone gallery showing a photo; optionally swipes in from a previous photo. */
export const PhonePhoto: React.FC<{
	spot: PhoneSpot;
	photo: React.ReactNode;
	crop: Crop;
	prev?: {photo: React.ReactNode; crop: Crop};
	swipeAt?: number;
	date: string;
	index: string;
	time?: string;
	filter?: string;
}> = ({spot, photo, crop, prev, swipeAt = 0, date, index, time, filter}) => {
	const frame = useCurrentFrame();
	const t = prev ? kf(frame, [[swipeAt, 0], [swipeAt + 9, 1]], EASE) : 1;
	return (
		<Phone x={spot.x} y={spot.y} s={spot.s}>
			<GalleryScreen
				date={date}
				index={index}
				time={time}
				photo={
					<g>
						{prev && t < 1 && (
							<g transform={`translate(${-PHOTO.w * t} 0)`}>
								<PhotoView node={prev.photo} crop={prev.crop} />
							</g>
						)}
						<g transform={`translate(${PHOTO.w * (1 - t)} 0)`} style={{filter}}>
							<PhotoView node={photo} crop={crop} />
						</g>
					</g>
				}
			/>
		</Phone>
	);
};
