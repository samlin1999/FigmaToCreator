/// <reference path="./types.d.ts" />

/** Cocos Creator 擴展 Editor 全域型別（精簡） */
declare global {
  const Editor: {
    App: { path: string };
    Project: { path: string };
    Panel: { open: (name: string) => void };
    Dialog: {
      select: (opts: {
        title?: string;
        path?: string;
        type?: string;
        filters?: Array<{ name: string; extensions: string[] }>;
      }) => Promise<{ canceled?: boolean; filePaths?: string[] }>;
    };
    Message: {
      request: (module: string, message: string, ...args: unknown[]) => Promise<unknown>;
    };
  };
}

export {};
