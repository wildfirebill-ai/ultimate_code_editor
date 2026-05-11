import { contextBridge, ipcRenderer } from 'electron';

const electronAPI = {
  window: {
    minimize: () => ipcRenderer.invoke('window-minimize'),
    maximize: () => ipcRenderer.invoke('window-maximize'),
    close: () => ipcRenderer.invoke('window-close'),
    isMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  },

  fileSystem: {
    readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
    writeFile: (filePath: string, content: string) => ipcRenderer.invoke('write-file', filePath, content),
    readDirectory: (dirPath: string) => ipcRenderer.invoke('read-directory', dirPath),
    checkExists: (filePath: string) => ipcRenderer.invoke('check-file-exists', filePath),
    openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
    openFolderDialog: (defaultPath?: string) => ipcRenderer.invoke('open-folder-dialog', defaultPath),
    getUserHome: () => ipcRenderer.invoke('get-user-home'),
    deleteFile: (filePath: string) => ipcRenderer.invoke('delete-file', filePath),
    createFile: (filePath: string) => ipcRenderer.invoke('create-file', filePath),
    createDirectory: (dirPath: string) => ipcRenderer.invoke('create-directory', dirPath),
    rename: (oldPath: string, newPath: string) => ipcRenderer.invoke('rename-file', oldPath, newPath),
    copy: (srcPath: string, destPath: string) => ipcRenderer.invoke('copy-file', srcPath, destPath),
    getInfo: (filePath: string) => ipcRenderer.invoke('get-file-info', filePath),
    showSaveDialog: (options?: any) => ipcRenderer.invoke('show-save-dialog', options),
    getAppPath: () => ipcRenderer.invoke('get-app-path'),
  },

  shell: {
    openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
    runCommand: (command: string, cwd?: string) => ipcRenderer.invoke('run-command', command, cwd),
  },

  hf: {
    search: (query: string, token?: string) => ipcRenderer.invoke('hf-search', query, token),
    download: (model: string, filename: string, destination: string, token?: string) => ipcRenderer.invoke('hf-download', model, filename, destination, token),
    listLocal: (dir: string) => ipcRenderer.invoke('hf-list-local', dir),
  },

  git: {
    status: (cwd: string) => ipcRenderer.invoke('git-status', cwd),
    branch: (cwd: string) => ipcRenderer.invoke('git-branch', cwd),
    log: (cwd: string, count?: number) => ipcRenderer.invoke('git-log', cwd, count),
    add: (cwd: string, files: string[]) => ipcRenderer.invoke('git-add', cwd, files),
    unstage: (cwd: string, files: string[]) => ipcRenderer.invoke('git-unstage', cwd, files),
    commit: (cwd: string, message: string) => ipcRenderer.invoke('git-commit', cwd, message),
    diff: (cwd: string, filePath: string, staged?: boolean) => ipcRenderer.invoke('git-diff', cwd, filePath, staged),
    push: (cwd: string, remote: string, branch: string) => ipcRenderer.invoke('git-push', cwd, remote, branch),
    pull: (cwd: string, remote: string, branch: string) => ipcRenderer.invoke('git-pull', cwd, remote, branch),
    fetch: (cwd: string) => ipcRenderer.invoke('git-fetch', cwd),
    remote: (cwd: string) => ipcRenderer.invoke('git-remote', cwd),
  },

  github: {
    getToken: () => ipcRenderer.invoke('github-get-token'),
    setToken: (token: string) => ipcRenderer.invoke('github-set-token', token),
    validateToken: (token: string) => ipcRenderer.invoke('github-validate-token', token),
    user: (token: string) => ipcRenderer.invoke('github-user', token),
    orgs: (token: string) => ipcRenderer.invoke('github-orgs', token),
    userRepos: (token: string, page?: number) => ipcRenderer.invoke('github-user-repos', token, page),
    orgRepos: (token: string, org: string) => ipcRenderer.invoke('github-org-repos', token, org),
    clone: (url: string, destPath: string, token: string) => ipcRenderer.invoke('github-clone', url, destPath, token),
    createRepo: (token: string, name: string, description: string, isPrivate: boolean) => ipcRenderer.invoke('github-create-repo', token, name, description, isPrivate),
    createPR: (token: string, owner: string, repo: string, title: string, body: string, head: string, base: string) => ipcRenderer.invoke('github-create-pr', token, owner, repo, title, body, head, base),
    listPRs: (token: string, owner: string, repo: string) => ipcRenderer.invoke('github-list-prs', token, owner, repo),
    listBranches: (token: string, owner: string, repo: string) => ipcRenderer.invoke('github-list-branches', token, owner, repo),
  },

  on: (channel: string, callback: (...args: any[]) => void) => {
    const validChannels = ['menu-action', 'window-state-changed', 'ai-response', 'terminal-data', 'git-update'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (_event, ...args) => callback(...args));
    }
  },

  send: (channel: string, ...args: any[]) => {
    const validChannels = ['ai-request', 'terminal-input', 'git-action', 'save-file'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, ...args);
    }
  },

  invoke: (channel: string, ...args: any[]) => {
    return ipcRenderer.invoke(channel, ...args);
  },

  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
