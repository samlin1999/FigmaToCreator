import type { SDKImage } from '@cursor/sdk';
import {
  referenceImageCompressBase64Len,
  referenceImageJpegQuality,
  referenceImageMaxEdgePx,
  skipReferenceImageCompress,
} from '../../../shared/organize-prompt-config';

type Base64SdkImage = Extract<SDKImage, { data: string }>;
type SharpFactory = typeof import('sharp');

function isBase64SdkImage(image: SDKImage): image is Base64SdkImage {
  return 'data' in image;
}

async function loadSharp(): Promise<SharpFactory | null> {
  try {
    const mod: unknown = await import('sharp');
    if (typeof mod === 'function') return mod as SharpFactory;
    if (
      mod &&
      typeof mod === 'object' &&
      'default' in mod &&
      typeof (mod as { default: unknown }).default === 'function'
    ) {
      return (mod as { default: SharpFactory }).default;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * 示意圖 base64 過大時縮邊並轉 JPEG，降低 vision token。
 * 需安裝 sharp；失敗時回傳原圖。
 */
export async function optimizeReferenceSdkImage(
  image: SDKImage,
  label?: string,
): Promise<SDKImage> {
  if (skipReferenceImageCompress()) return image;
  if (!isBase64SdkImage(image)) return image;

  const threshold = referenceImageCompressBase64Len();
  if (image.data.length <= threshold) return image;

  const sharp = await loadSharp();
  if (!sharp) {
    console.warn(
      '[cursor-organize] 示意圖偏大但未安裝 sharp，無法自動壓縮。請在 tools/ai-organizer 執行 npm install',
    );
    return image;
  }

  const maxEdge = referenceImageMaxEdgePx();
  const input = Buffer.from(image.data, 'base64');
  const beforeKb = Math.round(image.data.length / 1024);

  try {
    const meta = await sharp(input, { failOn: 'none' }).rotate().metadata();
    const w = meta.width ?? 0;
    const h = meta.height ?? 0;
    const edge = Math.max(w, h);

    let quality = referenceImageJpegQuality();
    let best: Buffer | null = null;

    for (let attempt = 0; attempt < 4; attempt++) {
      const scaleEdge =
        attempt === 0
          ? maxEdge
          : Math.max(720, Math.floor(maxEdge / (attempt + 1)));

      let pipeline = sharp(input, { failOn: 'none' }).rotate();
      if (edge > scaleEdge) {
        pipeline = pipeline.resize(scaleEdge, scaleEdge, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      const out = await pipeline
        .jpeg({ quality, mozjpeg: true, chromaSubsampling: '4:2:0' })
        .toBuffer();

      if (!best || out.length < best.length) best = out;

      const estB64Len = Math.ceil((out.length * 4) / 3);
      if (estB64Len <= threshold) {
        const data = out.toString('base64');
        console.log(
          `[cursor-organize] 示意圖已壓縮 ${beforeKb}KB → ${Math.round(data.length / 1024)}KB base64` +
            ` (${w}×${h}, JPEG q=${quality}${edge > scaleEdge ? `, 邊≤${scaleEdge}px` : ''}${label ? `, ${label}` : ''})`,
        );
        return { data, mimeType: 'image/jpeg' };
      }

      quality = Math.max(48, quality - 14);
    }

    if (best) {
      const data = best.toString('base64');
      console.log(
        `[cursor-organize] 示意圖已壓縮（仍超過門檻）${beforeKb}KB → ${Math.round(data.length / 1024)}KB base64` +
          `${label ? ` (${label})` : ''}`,
      );
      return { data, mimeType: 'image/jpeg' };
    }
  } catch (e) {
    console.warn(`[cursor-organize] 示意圖壓縮失敗，使用原圖 (${beforeKb}KB):`, e);
  }

  return image;
}
