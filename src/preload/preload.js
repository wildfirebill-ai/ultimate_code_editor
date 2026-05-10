"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const electronAPI = {
    window: {
        minimize: () => electron_1.ipcRenderer.invoke('window-minimize'),
        maximize: () => electron_1.ipcRenderer.invoke('window-maximize'),
        close: () => electron_1.ipcRenderer.invoke('window-close'),
        isMaximized: () => electron_1.ipcRenderer.invoke('window-is-maximized'),
    },
    fileSystem: {
        readFile: (filePath) => electron_1.ipcRenderer.invoke('read-file', filePath),
        writeFile: (filePath, content) => electron_1.ipcRenderer.invoke('write-file', filePath, content),
        readDirectory: (dirPath) => electron_1.ipcRenderer.invoke('read-directory', dirPath),
        checkExists: (filePath) => electron_1.ipcRenderer.invoke('check-file-exists', filePath),
        openFileDialog: () => electron_1.ipcRenderer.invoke('open-file-dialog'),
        openFolderDialog: () => electron_1.ipcRenderer.invoke('open-folder-dialog'),
        getUserHome: () => electron_1.ipcRenderer.invoke('get-user-home'),
        deleteFile: (filePath) => electron_1.ipcRenderer.invoke('delete-file', filePath),
        createFile: (filePath) => electron_1.ipcRenderer.invoke('create-file', filePath),
        createDirectory: (dirPath) => electron_1.ipcRenderer.invoke('create-directory', dirPath),
        rename: (oldPath, newPath) => electron_1.ipcRenderer.invoke('rename-file', oldPath, newPath),
        copy: (srcPath, destPath) => electron_1.ipcRenderer.invoke('copy-file', srcPath, destPath),
        getInfo: (filePath) => electron_1.ipcRenderer.invoke('get-file-info', filePath),
        showSaveDialog: (options) => electron_1.ipcRenderer.invoke('show-save-dialog', options),
        getAppPath: () => electron_1.ipcRenderer.invoke('get-app-path'),
    },
    shell: {
        openExternal: (url) => electron_1.ipcRenderer.invoke('open-external', url),
    },
    on: (channel, callback) => {
        const validChannels = ['menu-action', 'window-state-changed', 'ai-response', 'terminal-data', 'git-update'];
        if (validChannels.includes(channel)) {
            electron_1.ipcRenderer.on(channel, (_event, ...args) => callback(...args));
        }
    },
    send: (channel, ...args) => {
        const validChannels = ['ai-request', 'terminal-input', 'git-action', 'save-file'];
        if (validChannels.includes(channel)) {
            electron_1.ipcRenderer.send(channel, ...args);
        }
    },
    invoke: (channel, ...args) => {
        return electron_1.ipcRenderer.invoke(channel, ...args);
    },
    removeAllListeners: (channel) => {
        electron_1.ipcRenderer.removeAllListeners(channel);
    },
};
electron_1.contextBridge.exposeInMainWorld('electronAPI', electronAPI);
//# sourceMappingURL=preload.js.map