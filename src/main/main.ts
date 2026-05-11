import { app, BrowserWindow, ipcMain, Menu, dialog, shell, screen } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;
  mainWindow = new BrowserWindow({
    width: sw,
    height: sh,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0d1117',
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
    },
    icon: path.join(__dirname, '../../resources/icon.png'),
  });

  const devURL = process.env.VITE_DEV_SERVER_URL;

  if (devURL) {
    mainWindow.loadURL(devURL);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    const rendererPath = path.join(__dirname, '../renderer/index.html');
    if (fs.existsSync(rendererPath)) {
      mainWindow.loadFile(rendererPath);
    } else {
      mainWindow.loadURL('http://localhost:5173');
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send('window-state-changed', 'maximized');
  });
  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send('window-state-changed', 'normal');
  });
}

function createMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        { label: 'New File', accelerator: 'CmdOrCtrl+N', click: () => mainWindow?.webContents.send('menu-action', 'new-file') },
        { label: 'Open File...', accelerator: 'CmdOrCtrl+O', click: () => mainWindow?.webContents.send('menu-action', 'open-file') },
        { label: 'Open Folder...', accelerator: 'CmdOrCtrl+K', click: () => mainWindow?.webContents.send('menu-action', 'open-folder') },
        { type: 'separator' },
        { label: 'Save', accelerator: 'CmdOrCtrl+S', click: () => mainWindow?.webContents.send('menu-action', 'save') },
        { label: 'Save As...', accelerator: 'CmdOrCtrl+Shift+S', click: () => mainWindow?.webContents.send('menu-action', 'save-as') },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { type: 'separator' },
        { label: 'Find', accelerator: 'CmdOrCtrl+F', click: () => mainWindow?.webContents.send('menu-action', 'find') },
        { label: 'Replace', accelerator: 'CmdOrCtrl+H', click: () => mainWindow?.webContents.send('menu-action', 'replace') },
      ],
    },
    {
      label: 'Selection',
      submenu: [
        { label: 'Select All', accelerator: 'CmdOrCtrl+A', click: () => mainWindow?.webContents.send('menu-action', 'select-all') },
        { label: 'Add Cursor Above', accelerator: 'CmdOrCtrl+Alt+Up', click: () => mainWindow?.webContents.send('menu-action', 'add-cursor-above') },
        { label: 'Add Cursor Below', accelerator: 'CmdOrCtrl+Alt+Down', click: () => mainWindow?.webContents.send('menu-action', 'add-cursor-below') },
        { label: 'Multi Cursor', accelerator: 'Alt+Click', click: () => {} },
      ],
    },
    {
      label: 'View',
      submenu: [
        { label: 'Command Palette', click: () => mainWindow?.webContents.send('menu-action', 'command-palette') },
        { type: 'separator' },
        { label: 'Toggle Sidebar', accelerator: 'CmdOrCtrl+B', click: () => mainWindow?.webContents.send('menu-action', 'toggle-sidebar') },
        { label: 'Toggle Terminal', accelerator: 'CmdOrCtrl+`', click: () => mainWindow?.webContents.send('menu-action', 'toggle-terminal') },
        { label: 'Toggle Minimap', click: () => mainWindow?.webContents.send('menu-action', 'toggle-minimap') },
        { type: 'separator' },
        { label: 'Zoom In', accelerator: 'CmdOrCtrl+=', click: () => mainWindow?.webContents.send('menu-action', 'zoom-in') },
        { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', click: () => mainWindow?.webContents.send('menu-action', 'zoom-out') },
        { type: 'separator' },
        { role: 'toggleDevTools' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'AI',
      submenu: [
        { label: 'Toggle Agent Mode', accelerator: 'CmdOrCtrl+Shift+I', click: () => mainWindow?.webContents.send('menu-action', 'toggle-agent') },
        { type: 'separator' },
        { label: 'Inline Completion', accelerator: 'Alt+\\', click: () => mainWindow?.webContents.send('menu-action', 'inline-complete') },
        { label: 'Explain Code', click: () => mainWindow?.webContents.send('menu-action', 'ai-explain') },
        { label: 'Refactor Code', click: () => mainWindow?.webContents.send('menu-action', 'ai-refactor') },
        { label: 'Generate Tests', click: () => mainWindow?.webContents.send('menu-action', 'ai-tests') },
      ],
    },
    {
      label: 'Terminal',
      submenu: [
        { label: 'New Terminal', accelerator: 'CmdOrCtrl+Shift+`', click: () => mainWindow?.webContents.send('menu-action', 'new-terminal') },
        { label: 'Split Terminal', click: () => mainWindow?.webContents.send('menu-action', 'split-terminal') },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About Ultimate Editor',
          click: () => {
            dialog.showMessageBox({
              type: 'info',
              title: 'About Ultimate Editor',
              message: 'Ultimate Editor v1.0.0',
              detail: 'The ultimate code editor combining the best features from VS Code, Zed, Continue.dev, Tabby, Roo Code, Aider, and Void IDE.',
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// --- IPC Handlers ---

ipcMain.handle('window-minimize', () => {
  mainWindow?.minimize();
});

ipcMain.handle('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.handle('window-close', () => {
  mainWindow?.close();
});

ipcMain.handle('window-is-maximized', () => {
  return mainWindow?.isMaximized() ?? false;
});

ipcMain.handle('read-file', async (_event, filePath: string) => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return { content, path: filePath };
  } catch (err: any) {
    return { error: err.message };
  }
});

ipcMain.handle('write-file', async (_event, filePath: string, content: string) => {
  try {
    fs.writeFileSync(filePath, content, 'utf-8');
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
});

ipcMain.handle('read-directory', async (_event, dirPath: string) => {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const files = entries.map((entry) => ({
      name: entry.name,
      path: path.join(dirPath, entry.name),
      isDirectory: entry.isDirectory(),
      isFile: entry.isFile(),
      isSymlink: entry.isSymbolicLink(),
    }));
    return { files, path: dirPath };
  } catch (err: any) {
    return { error: err.message };
  }
});

ipcMain.handle('check-file-exists', async (_event, filePath: string) => {
  return fs.existsSync(filePath);
});

ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'All Files', extensions: ['*'] },
      { name: 'Code Files', extensions: ['js', 'ts', 'jsx', 'tsx', 'py', 'rs', 'go', 'java', 'c', 'cpp', 'h', 'hpp', 'cs', 'rb', 'php', 'swift', 'kt', 'scala', 'html', 'css', 'scss', 'less', 'json', 'xml', 'yaml', 'yml', 'toml', 'md', 'sql', 'sh', 'bat', 'ps1'] },
    ],
  });
  return result;
});

ipcMain.handle('open-folder-dialog', async (_event, defaultPath?: string) => {
  const result = await dialog.showOpenDialog({
    defaultPath,
    properties: ['openDirectory'],
  });
  return result;
});

ipcMain.handle('get-user-home', () => {
  return app.getPath('home');
});

ipcMain.handle('delete-file', async (_event, filePath: string) => {
  try {
    fs.unlinkSync(filePath);
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
});

ipcMain.handle('create-file', async (_event, filePath: string) => {
  try {
    fs.writeFileSync(filePath, '', 'utf-8');
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
});

ipcMain.handle('create-directory', async (_event, dirPath: string) => {
  try {
    fs.mkdirSync(dirPath, { recursive: true });
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
});

ipcMain.handle('rename-file', async (_event, oldPath: string, newPath: string) => {
  try {
    fs.renameSync(oldPath, newPath);
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
});

ipcMain.handle('copy-file', async (_event, srcPath: string, destPath: string) => {
  try {
    fs.copyFileSync(srcPath, destPath);
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
});

ipcMain.handle('get-file-info', async (_event, filePath: string) => {
  try {
    const stats = fs.statSync(filePath);
    return {
      size: stats.size,
      modifiedAt: stats.mtime.toISOString(),
      createdAt: stats.birthtime.toISOString(),
      isDirectory: stats.isDirectory(),
    };
  } catch (err: any) {
    return { error: err.message };
  }
});

ipcMain.handle('open-external', async (_event, url: string) => {
  shell.openExternal(url);
});

ipcMain.handle('show-save-dialog', async (_event, options: any) => {
  const result = await dialog.showSaveDialog(options);
  return result;
});

ipcMain.handle('get-app-path', () => {
  return app.getAppPath();
});

ipcMain.handle('run-command', async (_event, command: string, cwd?: string) => {
  return new Promise((resolve) => {
    exec(command, { timeout: 30000, cwd }, (error, stdout, stderr) => {
      if (error) {
        resolve({ stdout, stderr: stderr || error.message, exitCode: error.code ?? 1 });
      } else {
        resolve({ stdout, stderr, exitCode: 0 });
      }
    });
  });
});

ipcMain.handle('hf-search', async (_event, query: string, token: string) => {
  try {
    const url = `https://huggingface.co/api/models?search=${encodeURIComponent(query)}&filter=gguf&limit=20`;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`HF API error ${res.status}: ${res.statusText}`);
    const data = await res.json();
    return { success: true, models: data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('hf-download', async (_event, model: string, filename: string, destination: string, token: string) => {
  try {
    const url = `https://huggingface.co/${model}/resolve/main/${filename}`;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(300000) });
    if (!res.ok) throw new Error(`HF download error ${res.status}: ${res.statusText}`);
    const buffer = await res.arrayBuffer();
    const destPath = path.join(destination, filename);
    fs.writeFileSync(destPath, Buffer.from(buffer));
    return { success: true, path: destPath, size: buffer.byteLength };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('hf-list-local', async (_event, dir: string) => {
  try {
    if (!fs.existsSync(dir)) return { success: true, files: [] };
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.gguf')).map(f => {
      const stats = fs.statSync(path.join(dir, f));
      return { name: f, size: stats.size, modified: stats.mtime };
    });
    return { success: true, files };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

// --- Git IPC Handlers ---

function gitExec(args: string[], cwd: string): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve) => {
    exec(`git ${args.join(' ')}`, { cwd, timeout: 15000, maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        resolve({ stdout, stderr: stderr || error.message, exitCode: error.code ?? 1 });
      } else {
        resolve({ stdout, stderr, exitCode: 0 });
      }
    });
  });
}

ipcMain.handle('git-status', async (_event, cwd: string) => {
  try {
    const { stdout, stderr, exitCode } = await gitExec(['status', '--porcelain', '-u'], cwd);
    if (exitCode !== 0) return { error: stderr };
    const files = stdout.split('\n').filter(Boolean).map((line) => ({
      path: line.slice(3).trim(),
      raw: line.slice(0, 2),
      staged: line[0] !== ' ' && line[0] !== '?',
      status: line[0] === '?' ? 'U' : line[1] === 'M' ? 'M' : line[0] === 'M' ? 'M' : line[0] === 'A' ? 'A' : line[0] === 'D' ? 'D' : line[1],
    }));
    return { files };
  } catch (err: any) {
    return { error: err.message };
  }
});

ipcMain.handle('git-branch', async (_event, cwd: string) => {
  try {
    const { stdout, stderr, exitCode } = await gitExec(['branch', '--show-current'], cwd);
    if (exitCode !== 0) return { error: stderr };
    return { branch: stdout.trim() };
  } catch (err: any) {
    return { error: err.message };
  }
});

ipcMain.handle('git-log', async (_event, cwd: string, count: number = 20) => {
  try {
    const { stdout, stderr, exitCode } = await gitExec(['log', `--max-count=${count}`, '--format=%h|%an|%ar|%s'], cwd);
    if (exitCode !== 0) return { error: stderr };
    const commits = stdout.split('\n').filter(Boolean).map((line) => {
      const [hash, author, date, ...msgParts] = line.split('|');
      return { hash, author, date, message: msgParts.join('|') };
    });
    return { commits };
  } catch (err: any) {
    return { error: err.message };
  }
});

ipcMain.handle('git-add', async (_event, cwd: string, filePaths: string[]) => {
  try {
    const { stderr, exitCode } = await gitExec(['add', ...filePaths], cwd);
    if (exitCode !== 0) return { error: stderr };
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
});

ipcMain.handle('git-unstage', async (_event, cwd: string, filePaths: string[]) => {
  try {
    const { stderr, exitCode } = await gitExec(['reset', 'HEAD', '--', ...filePaths], cwd);
    if (exitCode !== 0) return { error: stderr };
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
});

ipcMain.handle('git-commit', async (_event, cwd: string, message: string) => {
  try {
    const { stderr, exitCode } = await gitExec(['commit', '-m', message], cwd);
    if (exitCode !== 0) return { error: stderr };
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
});

ipcMain.handle('git-diff', async (_event, cwd: string, filePath: string, staged: boolean = false) => {
  try {
    const args = ['diff'];
    if (staged) args.push('--cached');
    args.push('--', filePath);
    const { stdout, stderr, exitCode } = await gitExec(args, cwd);
    if (exitCode !== 0) return { error: stderr };
    return { diff: stdout };
  } catch (err: any) {
    return { error: err.message };
  }
});

ipcMain.handle('git-push', async (_event, cwd: string, remote: string = 'origin', branch: string) => {
  try {
    const { stderr, exitCode } = await gitExec(['push', remote, branch], cwd);
    if (exitCode !== 0) return { error: stderr };
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
});

ipcMain.handle('git-pull', async (_event, cwd: string, remote: string = 'origin', branch: string) => {
  try {
    const { stderr, exitCode } = await gitExec(['pull', remote, branch], cwd);
    if (exitCode !== 0) return { error: stderr };
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
});

ipcMain.handle('git-fetch', async (_event, cwd: string) => {
  try {
    const { stderr, exitCode } = await gitExec(['fetch', '--all'], cwd);
    if (exitCode !== 0) return { error: stderr };
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
});

ipcMain.handle('git-remote', async (_event, cwd: string) => {
  try {
    const { stdout, stderr, exitCode } = await gitExec(['remote', '-v'], cwd);
    if (exitCode !== 0) return { error: stderr || 'git remote failed' };
    const remotes = stdout.split('\n').filter(Boolean).map((line) => {
      const [name, url, type] = line.split(/\s+/);
      return { name, url, type: type ? type.replace(/[()]/g, '') : '' };
    });
    return { remotes };
  } catch (err: any) {
    return { error: err.message };
  }
});

// --- GitHub IPC Handlers ---

const GITHUB_CONFIG_FILE = 'github-token.json';

function getGithubConfigPath(): string {
  return path.join(app.getPath('userData'), GITHUB_CONFIG_FILE);
}

function readGithubToken(): string | null {
  try {
    const configPath = getGithubConfigPath();
    if (!fs.existsSync(configPath)) return null;
    const data = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    return data.token || null;
  } catch { return null; }
}

function writeGithubToken(token: string): void {
  const configPath = getGithubConfigPath();
  fs.writeFileSync(configPath, JSON.stringify({ token }), 'utf-8');
}

async function githubFetch(path: string, token: string, options: RequestInit = {}): Promise<any> {
  const res = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'ultimate-editor',
      ...options.headers,
    },
  });
  const body: any = res.status === 204 ? null : await res.json();
  if (!res.ok) throw new Error(body?.message || `GitHub API error ${res.status}`);
  return body;
}

ipcMain.handle('github-get-token', async () => {
  return { token: readGithubToken() };
});

ipcMain.handle('github-set-token', async (_event, token: string) => {
  try {
    writeGithubToken(token);
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
});

ipcMain.handle('github-validate-token', async (_event, token: string) => {
  try {
    const user = await githubFetch('/user', token);
    return { valid: true, user };
  } catch (err: any) {
    return { valid: false, error: err.message };
  }
});

ipcMain.handle('github-user', async (_event, token: string) => {
  try {
    const user = await githubFetch('/user', token);
    return { user };
  } catch (err: any) {
    return { error: err.message };
  }
});

ipcMain.handle('github-orgs', async (_event, token: string) => {
  try {
    const orgs = await githubFetch('/user/orgs', token);
    return { orgs };
  } catch (err: any) {
    return { error: err.message };
  }
});

ipcMain.handle('github-user-repos', async (_event, token: string) => {
  try {
    let allRepos: any[] = [];
    let page = 1;
    let hasMore = true;
    while (hasMore) {
      const repos = await githubFetch(`/user/repos?per_page=100&page=${page}&sort=updated`, token);
      allRepos = allRepos.concat(repos);
      hasMore = repos.length === 100;
      page++;
    }
    return { repos: allRepos };
  } catch (err: any) {
    return { error: err.message };
  }
});

ipcMain.handle('github-org-repos', async (_event, token: string, org: string) => {
  try {
    let allRepos: any[] = [];
    let page = 1;
    let hasMore = true;
    while (hasMore) {
      const repos = await githubFetch(`/orgs/${encodeURIComponent(org)}/repos?per_page=100&page=${page}&sort=updated`, token);
      allRepos = allRepos.concat(repos);
      hasMore = repos.length === 100;
      page++;
    }
    return { repos: allRepos };
  } catch (err: any) {
    return { error: err.message };
  }
});

ipcMain.handle('github-clone', async (_event, url: string, destPath: string, token: string) => {
  try {
    const authenticatedUrl = url.replace('https://', `https://x-access-token:${token}@`);
    return await new Promise<{ success?: boolean; error?: string }>((resolve) => {
      exec(`git clone ${authenticatedUrl} "${destPath}"`, { timeout: 120000 }, (error, stdout, stderr) => {
        if (error) resolve({ error: stderr || error.message });
        else resolve({ success: true });
      });
    });
  } catch (err: any) {
    return { error: err.message };
  }
});

ipcMain.handle('github-create-repo', async (_event, token: string, name: string, description: string, isPrivate: boolean) => {
  try {
    const repo = await githubFetch('/user/repos', token, {
      method: 'POST',
      body: JSON.stringify({ name, description, private: isPrivate, auto_init: true }),
    });
    return { repo };
  } catch (err: any) {
    return { error: err.message };
  }
});

ipcMain.handle('github-create-pr', async (_event, token: string, owner: string, repo: string, title: string, body: string, head: string, base: string) => {
  try {
    const pr = await githubFetch(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls`, token, {
      method: 'POST',
      body: JSON.stringify({ title, body, head, base }),
    });
    return { pr };
  } catch (err: any) {
    return { error: err.message };
  }
});

ipcMain.handle('github-list-prs', async (_event, token: string, owner: string, repo: string) => {
  try {
    const prs = await githubFetch(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls?state=open&per_page=20`, token);
    return { prs };
  } catch (err: any) {
    return { error: err.message };
  }
});

ipcMain.handle('github-list-branches', async (_event, token: string, owner: string, repo: string) => {
  try {
    const branches = await githubFetch(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/branches?per_page=50`, token);
    return { branches };
  } catch (err: any) {
    return { error: err.message };
  }
});

// --- App Lifecycle ---

app.whenReady().then(() => {
  createMenu();
  createWindow();

  if (mainWindow) {
    mainWindow.webContents.on('before-input-event', (_e, input) => {
      if (input.type !== 'keyDown') return;
      if (input.key === 'F12') {
        mainWindow?.webContents.toggleDevTools();
      }
      if ((input.control || input.meta) && input.shift && input.key.toLowerCase() === 'p') {
        mainWindow?.webContents.send('menu-action', 'command-palette');
      }
    });
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});



app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
