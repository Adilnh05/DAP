// Lightweight shims for environments without installed @types packages
// Safe minimal declarations to silence editor/type-checker errors until deps are installed.

declare module 'vite';
declare module '@vitejs/plugin-react';
declare module '@replit/vite-plugin-runtime-error-modal';
declare module '@replit/vite-plugin-cartographer';
declare module '@replit/vite-plugin-dev-banner';
declare module 'path';

declare interface ImportMeta {
  dirname: string;
}

declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined;
  }
}

declare var process: { env: NodeJS.ProcessEnv };
