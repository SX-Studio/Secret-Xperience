import sharp from 'sharp';

// Server-side derived images. The ORIGINAL is never sent to a browser before a
// valid rental — the feed only ever serves these derivatives.
// (Video derivatives are handled by the streaming provider — Cloudflare Stream /
// Mux — with signed playback, added in a later phase.)

export interface Derivatives {
  blur: Buffer; // heavily blurred preview for the locked feed
  thumb: Buffer; // small sharp thumbnail (also used blurred in the feed)
}

export async function generateImageDerivatives(original: Buffer): Promise<Derivatives> {
  const blur = await sharp(original)
    .resize(400, 400, { fit: 'cover' })
    .blur(28)
    .modulate({ brightness: 0.9 })
    .jpeg({ quality: 60 })
    .toBuffer();

  const thumb = await sharp(original)
    .resize(400, 400, { fit: 'cover' })
    .jpeg({ quality: 78 })
    .toBuffer();

  return { blur, thumb };
}

// Deterministic storage paths for a content item's files.
export function originalPath(contentCode: string, fileId: string, ext: string): string {
  return `originals/${contentCode}/${fileId}.${ext}`;
}
export function blurPath(contentCode: string, fileId: string): string {
  return `previews/${contentCode}/${fileId}.blur.jpg`;
}
export function thumbPath(contentCode: string, fileId: string): string {
  return `previews/${contentCode}/${fileId}.thumb.jpg`;
}
