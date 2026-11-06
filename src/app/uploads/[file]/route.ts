import { readFile } from 'fs/promises';
import path from 'path';

/**
 * Serves admin uploads saved to UPLOAD_DIR (see api/admin/upload/route.ts).
 *
 * On a long-running server such as Hostinger, uploads must live outside the app
 * folder: a redeploy replaces it, and `next start` does not serve files added to
 * public/ after the build. Files that do exist in public/uploads are served by
 * Next before this route is reached.
 */
const TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
};

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const dir = process.env.UPLOAD_DIR;
  const { file } = await params;
  const type = TYPES[path.extname(file).toLowerCase()];

  // Upload names are generated server-side as <timestamp>-<hex>.<ext>; reject anything else.
  if (!dir || !type || !/^[\w-]+\.[a-z]+$/i.test(file)) {
    return new Response('Not found', { status: 404 });
  }

  try {
    const body = await readFile(path.join(dir, file));
    return new Response(new Uint8Array(body), {
      headers: {
        'Content-Type': type,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
