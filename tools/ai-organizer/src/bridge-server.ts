import * as http from 'http';
import { mkdirSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { loadEnvFiles } from './load-env';
import { organizeWithCursor, organizeWithCursorReference } from './organize-service';
import { resolveCustomGuide } from './call-cursor';
import type { IRDocumentLike } from '../../../shared/agent-plan-types';

const REPO_ROOT = resolve(__dirname, '../../..');
const PORT = Number(process.env.FTC_BRIDGE_PORT ?? 3847);
const BRIDGE_VERSION = 'v1';

loadEnvFiles(resolve(__dirname, '..'));
loadEnvFiles(REPO_ROOT);

function sendJson(res: http.ServerResponse, status: number, body: object): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(payload);
}

function getRequestId(
  req: http.IncomingMessage,
  urlObj: URL,
  bodyRequestId?: number | string,
): string {
  if (typeof bodyRequestId === 'number' || typeof bodyRequestId === 'string') {
    const fromBody = String(bodyRequestId).trim();
    if (fromBody) return fromBody;
  }
  const queryId = (urlObj.searchParams.get('requestId') ?? '').trim();
  if (queryId) return queryId;
  const headerId = req.headers['x-ftc-request-id'];
  if (typeof headerId === 'string' && headerId.trim()) return headerId.trim();
  if (Array.isArray(headerId) && headerId[0]?.trim()) return headerId[0].trim();
  return 'n/a';
}

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolveBody, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolveBody(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function sanitizeSegment(name: string): string {
  return name.trim().replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').replace(/\s+/g, '_') || 'page';
}

function cloneWithPrefixedAssets(ir: IRDocumentLike, prefix: string): IRDocumentLike {
  function walk(node: IRDocumentLike['root']): IRDocumentLike['root'] {
    return {
      ...node,
      asset: node.asset ? `${prefix}/${node.asset}` : undefined,
      children: node.children.map((c) => walk(c)),
    };
  }
  return {
    ...ir,
    root: walk(ir.root),
  };
}

function collectAssetMap(root: IRDocumentLike['root'], out: Record<string, string>): void {
  if (root.asset) out[root.figmaId] = root.asset;
  for (const c of root.children) collectAssetMap(c, out);
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  const rawUrl = req.url ?? '/';
  const urlObj = new URL(rawUrl, `http://${req.headers.host ?? `localhost:${PORT}`}`);
  const pathname = urlObj.pathname;

  if (req.method === 'GET' && pathname === '/health') {
    const requestId = getRequestId(req, urlObj);
    sendJson(res, 200, {
      ok: true,
      requestId,
      version: BRIDGE_VERSION,
      service: 'figma-cursor-bridge',
      port: PORT,
      hasCursorKey: Boolean(process.env.CURSOR_API_KEY?.trim()),
    });
    return;
  }

  if (req.method === 'POST' && pathname === '/organize') {
    try {
      const body = JSON.parse(await readBody(req)) as {
        ir?: IRDocumentLike;
        requestId?: number | string;
        customGuideName?: string;
        customGuideMarkdown?: string;
      };
      const requestId = getRequestId(req, urlObj, body.requestId);
      if (!body.ir?.root) {
        sendJson(res, 400, { ok: false, requestId, error: '缺少 ir.root' });
        return;
      }

      const customGuide = resolveCustomGuide({
        name: body.customGuideName,
        markdown: body.customGuideMarkdown,
      });

      console.log(
        `[bridge][req:${requestId}] Cursor 整理中…`,
        (body.ir.source as { pageName?: string })?.pageName,
        customGuide ? `(+ guide: ${customGuide.name ?? 'user-guide.md'})` : '',
      );
      const { plan, organized, validation } = await organizeWithCursor(
        body.ir,
        REPO_ROOT,
        customGuide ? { customGuide } : undefined,
      );
      sendJson(res, 200, {
        ok: true,
        requestId,
        plan,
        organized,
        summary: plan.summary,
        organizer: plan.organizer,
        validation,
      });
    } catch (e) {
      const requestId = getRequestId(req, urlObj);
      const message = e instanceof Error ? e.message : String(e);
      console.error(`[bridge][req:${requestId}]`, message);
      sendJson(res, 500, { ok: false, requestId, error: message });
    }
    return;
  }

  if (req.method === 'POST' && pathname === '/save-export') {
    try {
      const body = JSON.parse(await readBody(req)) as {
        ir?: IRDocumentLike;
        images?: Record<string, string>;
        requestId?: number | string;
      };
      const requestId = getRequestId(req, urlObj, body.requestId);
      if (!body.ir?.root) {
        sendJson(res, 400, { ok: false, requestId, error: '缺少 ir.root' });
        return;
      }

      const pageName = ((body.ir.source as { pageName?: string })?.pageName ?? body.ir.root.name ?? 'Page').trim();
      const pageFolder = sanitizeSegment(pageName);
      const prefix = pageFolder;
      const outRoot = join(REPO_ROOT, 'assets', 'figma-import', pageFolder);
      mkdirSync(outRoot, { recursive: true });

      const irWithPrefix = cloneWithPrefixedAssets(body.ir, prefix);
      const irPath = join(outRoot, `${pageFolder}.ir.json`);
      writeFileSync(irPath, JSON.stringify(irWithPrefix, null, 2), 'utf8');

      const assetMap: Record<string, string> = {};
      collectAssetMap(irWithPrefix.root, assetMap);

      let savedImages = 0;
      for (const [figmaId, b64] of Object.entries(body.images ?? {})) {
        const rel = assetMap[figmaId];
        if (!rel) continue;
        const filePath = join(REPO_ROOT, 'assets', 'figma-import', rel);
        mkdirSync(join(filePath, '..'), { recursive: true });
        writeFileSync(filePath, Buffer.from(b64, 'base64'));
        savedImages++;
      }

      sendJson(res, 200, {
        ok: true,
        requestId,
        pageName,
        folder: `assets/figma-import/${pageFolder}`,
        irFile: `assets/figma-import/${pageFolder}/${pageFolder}.ir.json`,
        savedImages,
      });
    } catch (e) {
      const requestId = getRequestId(req, urlObj);
      const message = e instanceof Error ? e.message : String(e);
      console.error(`[bridge save-export][req:${requestId}]`, message);
      sendJson(res, 500, { ok: false, requestId, error: message });
    }
    return;
  }

  if (req.method === 'POST' && pathname === '/hierarchy-from-reference') {
    try {
      const body = JSON.parse(await readBody(req)) as {
        ir?: IRDocumentLike;
        referenceImageBase64?: string;
        referenceImageName?: string;
        customGuideName?: string;
        customGuideMarkdown?: string;
        requestId?: number | string;
      };
      const requestId = getRequestId(req, urlObj, body.requestId);
      if (!body.ir?.root) {
        sendJson(res, 400, { ok: false, requestId, error: '缺少 ir.root' });
        return;
      }

      const pageName = ((body.ir.source as { pageName?: string })?.pageName ?? body.ir.root.name ?? 'Page').trim();
      const pageFolder = sanitizeSegment(pageName);
      const outRoot = join(REPO_ROOT, 'assets', 'figma-import', pageFolder);
      mkdirSync(outRoot, { recursive: true });

      const sourceIrFile = `${pageFolder}.source.ir.json`;
      writeFileSync(join(outRoot, sourceIrFile), JSON.stringify(body.ir, null, 2), 'utf8');

      let savedReferenceImage: string | undefined;
      if (body.referenceImageBase64?.trim()) {
        const ext = (body.referenceImageName?.split('.').pop() ?? 'png').toLowerCase();
        const safeExt = ['png', 'jpg', 'jpeg', 'webp'].includes(ext) ? ext : 'png';
        savedReferenceImage = `reference.${safeExt}`;
        writeFileSync(
          join(outRoot, savedReferenceImage),
          Buffer.from(body.referenceImageBase64, 'base64'),
        );
      }

      const referenceImagePath = savedReferenceImage ? join(outRoot, savedReferenceImage) : undefined;
      const customGuide = resolveCustomGuide({
        name: body.customGuideName,
        markdown: body.customGuideMarkdown,
      });
      const { plan, organized, validation } = await organizeWithCursorReference(
        body.ir,
        REPO_ROOT,
        {
          referenceImageName: body.referenceImageName,
          referenceImagePath,
          referenceImageBase64: body.referenceImageBase64,
          ...(customGuide ? { customGuide } : {}),
        },
      );
      const hierarchy = {
        summary: plan.summary,
        organizer: plan.organizer,
        virtualRoot: plan.virtualRoot,
        virtualContainers: plan.virtualContainers ?? [],
      };
      const organizedFile = `${pageFolder}.hierarchy.ir.json`;
      const hierarchyFile = `${pageFolder}.hierarchy.json`;
      writeFileSync(join(outRoot, organizedFile), JSON.stringify(organized, null, 2), 'utf8');
      writeFileSync(join(outRoot, hierarchyFile), JSON.stringify(hierarchy, null, 2), 'utf8');

      sendJson(res, 200, {
        ok: true,
        requestId,
        pageName,
        organized,
        summary: plan.summary,
        validation,
        hierarchy,
        files: {
          folder: `assets/figma-import/${pageFolder}`,
          sourceIr: `assets/figma-import/${pageFolder}/${sourceIrFile}`,
          organizedIr: `assets/figma-import/${pageFolder}/${organizedFile}`,
          hierarchy: `assets/figma-import/${pageFolder}/${hierarchyFile}`,
          referenceImage: savedReferenceImage
            ? `assets/figma-import/${pageFolder}/${savedReferenceImage}`
            : null,
        },
      });
    } catch (e) {
      const requestId = getRequestId(req, urlObj);
      const message = e instanceof Error ? e.message : String(e);
      console.error(`[bridge hierarchy-from-reference][req:${requestId}]`, message);
      sendJson(res, 500, { ok: false, requestId, error: message });
    }
    return;
  }

  sendJson(res, 404, { ok: false, requestId: getRequestId(req, urlObj), error: 'Not found' });
});

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} 已被占用，bridge 可能已在執行。`);
    console.error(`  直接使用：http://127.0.0.1:${PORT}/health`);
    console.error('  若要重啟，請先關閉舊 process，或設定 FTC_BRIDGE_PORT 換埠。');
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, () => {
  console.log(`FigmaToCreator Cursor bridge: http://localhost:${PORT}`);
  console.log(`Bridge version: ${BRIDGE_VERSION}`);
  console.log('  GET  /health');
  console.log('  POST /organize  { ir: IRDocument }');
  console.log('CURSOR_API_KEY:', process.env.CURSOR_API_KEY ? '已設定 ✓' : '未設定 ✗');
});
