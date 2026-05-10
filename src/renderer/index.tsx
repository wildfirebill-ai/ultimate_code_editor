import React from 'react';
import ReactDOM from 'react-dom/client';
import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import App from './App';

self.MonacoEnvironment = {
  getWorker(_workerId: string, label: string) {
    switch (label) {
      case 'json': return new Worker(new URL('monaco-editor/esm/vs/language/json/json.worker.js', import.meta.url));
      case 'css':
      case 'scss':
      case 'less': return new Worker(new URL('monaco-editor/esm/vs/language/css/css.worker.js', import.meta.url));
      case 'html':
      case 'handlebars':
      case 'razor': return new Worker(new URL('monaco-editor/esm/vs/language/html/html.worker.js', import.meta.url));
      case 'typescript':
      case 'javascript': return new Worker(new URL('monaco-editor/esm/vs/language/typescript/ts.worker.js', import.meta.url));
      default: return new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url));
    }
  }
};

loader.config({ monaco });

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

declare global {
  interface Window {
    electronAPI: {
      window: {
        minimize: () => Promise<void>;
        maximize: () => Promise<void>;
        close: () => Promise<void>;
        isMaximized: () => Promise<boolean>;
      };
      fileSystem: {
        readFile: (filePath: string) => Promise<{ content?: string; error?: string; path?: string }>;
        writeFile: (filePath: string, content: string) => Promise<{ success?: boolean; error?: string }>;
        readDirectory: (dirPath: string) => Promise<{ files?: any[]; error?: string; path?: string }>;
        checkExists: (filePath: string) => Promise<boolean>;
        openFileDialog: () => Promise<{ canceled: boolean; filePaths: string[] }>;
        openFolderDialog: (defaultPath?: string) => Promise<{ canceled: boolean; filePaths: string[] }>;
        getUserHome: () => Promise<string>;
        deleteFile: (filePath: string) => Promise<{ success?: boolean; error?: string }>;
        createFile: (filePath: string) => Promise<{ success?: boolean; error?: string }>;
        createDirectory: (dirPath: string) => Promise<{ success?: boolean; error?: string }>;
        rename: (oldPath: string, newPath: string) => Promise<{ success?: boolean; error?: string }>;
        copy: (srcPath: string, destPath: string) => Promise<{ success?: boolean; error?: string }>;
        getInfo: (filePath: string) => Promise<{ size?: number; modifiedAt?: string; createdAt?: string; isDirectory?: boolean; error?: string }>;
        showSaveDialog: (options?: any) => Promise<{ canceled: boolean; filePath?: string }>;
        getAppPath: () => Promise<string>;
      };
      shell: {
        openExternal: (url: string) => Promise<void>;
      };
      on: (channel: string, callback: (...args: any[]) => void) => void;
      send: (channel: string, ...args: any[]) => void;
      invoke: (channel: string, ...args: any[]) => Promise<any>;
      removeAllListeners: (channel: string) => void;
    };
  }
}
