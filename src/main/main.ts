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
        { label: 'Command Palette', accelerator: 'CmdOrCtrl+Shift+P', click: () => mainWindow?.webContents.send('menu-action', 'command-palette') },
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

// --- App Lifecycle ---

app.whenReady().then(() => {
  createMenu();
  createWindow();

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
