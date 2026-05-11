import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  ChevronRight,
  File,
  Folder,
  FolderOpen,
  FilePlus,
  FolderPlus,
  Pencil,
  Trash2,
  RefreshCw,
  Minimize2,
} from 'lucide-react';
import { FileNode } from '@shared/types';
import { useEditorStore } from '../../stores/editorStore';
import { useSettingsStore } from '../../stores/settingsStore';

interface ContextMenuState {
  x: number;
  y: number;
  node: FileNode;
}

interface FileItemProps {
  node: FileNode;
  depth: number;
  onContextMenu: (e: React.MouseEvent, node: FileNode) => void;
  onContextMenuAction: (action: string, node: FileNode) => void;
  renaming: string | null;
  renameValue: string;
  setRenaming: (v: string | null) => void;
  setRenameValue: (v: string) => void;
}

const FileItem: React.FC<FileItemProps> = ({
  node,
  depth,
  onContextMenu,
  onContextMenuAction,
  renaming,
  renameValue,
  setRenaming,
  setRenameValue,
}) => {
  const [expanded, setExpanded] = useState(node.expanded || false);
  const [children, setChildren] = useState<FileNode[]>(node.children || []);
  const [loading, setLoading] = useState(false);
  const selectedFile = useEditorStore((s) => s.selectedFile);
  const setSelectedFile = useEditorStore((s) => s.setSelectedFile);
  const openFile = useEditorStore((s) => s.openFile);
  const inputRef = useRef<HTMLInputElement>(null);

  const isSelected = selectedFile === node.path;
  const isDir = node.isDirectory;

  useEffect(() => {
    if (renaming === node.path && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [renaming, node.path]);

  const loadChildren = useCallback(async () => {
    if (!isDir || children.length > 0) return;
    setLoading(true);
    try {
      const entries = await window.electronAPI.fileSystem.readDirectory(node.path);
      const mapped: FileNode[] = entries.map((e: any) => ({
        name: e.name,
        path: e.path,
        isDirectory: e.isDirectory,
        isFile: e.isFile,
        isSymlink: e.isSymlink || false,
        children: [],
      }));
      setChildren(mapped);
    } catch {
      setChildren([]);
    } finally {
      setLoading(false);
    }
  }, [isDir, node.path, children.length]);

  const handleClick = useCallback(async () => {
    setSelectedFile(node.path);
    if (isDir) {
      if (!expanded) {
        await loadChildren();
      }
      setExpanded((p) => !p);
    } else {
      try {
        const data = await window.electronAPI.fileSystem.readFile(node.path);
        if (data.content !== undefined) {
          openFile(node.path, data.content);
        }
      } catch {
        // ignore
      }
    }
  }, [node.path, isDir, expanded, loadChildren, setSelectedFile, openFile]);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onContextMenu(e, node);
    },
    [onContextMenu, node]
  );

  const handleRenameSubmit = useCallback(async () => {
    if (!renameValue.trim() || renameValue === node.name) {
      setRenaming(null);
      return;
    }
    try {
      const parentPath = node.path.substring(0, node.path.lastIndexOf('\\'));
      const newPath = `${parentPath}\\${renameValue}`;
      await window.electronAPI.fileSystem.rename(node.path, newPath);
      const entries = await window.electronAPI.fileSystem.readDirectory(parentPath);
      const mapped: FileNode[] = entries.map((e: any) => ({
        name: e.name,
        path: e.path,
        isDirectory: e.isDirectory,
        isFile: e.isFile,
        isSymlink: e.isSymlink || false,
        children: [],
      }));
      const parentDir = parentPath;
      const fs = useEditorStore.getState().fileTree;
      const updateTree = (nodes: FileNode[]): FileNode[] =>
        nodes.map((n) => {
          if (n.path === parentDir) return { ...n, children: mapped };
          if (n.children) return { ...n, children: updateTree(n.children) };
          return n;
        });
      useEditorStore.getState().setFileTree(updateTree(fs));
    } catch {
      // ignore
    }
    setRenaming(null);
  }, [renameValue, node, setRenaming]);

  const handleRenameKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleRenameSubmit();
      } else if (e.key === 'Escape') {
        setRenaming(null);
      }
    },
    [handleRenameSubmit, setRenaming]
  );

  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      e.dataTransfer.setData('text/plain', node.path);
    },
    [node.path]
  );

  if (renaming === node.path) {
    return (
      <div
        className="file-tree-item"
        style={{ paddingLeft: 8 + depth * 16 }}
        onContextMenu={handleContextMenu}
      >
        <span className="expand-icon" style={{ visibility: 'hidden' }}>
          <ChevronRight size={14} />
        </span>
        <span className="file-icon">
          {isDir ? <Folder size={14} /> : <File size={14} />}
        </span>
        <input
          ref={inputRef}
          className="file-name"
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onBlur={handleRenameSubmit}
          onKeyDown={handleRenameKeyDown}
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--accent)',
            color: 'var(--text)',
            outline: 'none',
            fontSize: 13,
            padding: '1px 4px',
            borderRadius: 3,
            flex: 1,
          }}
        />
      </div>
    );
  }

  return (
    <>
      <div
        className={`file-tree-item${isSelected ? ' selected' : ''}`}
        style={{ paddingLeft: 8 + depth * 16 }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        draggable
        onDragStart={handleDragStart}
      >
        <span className={`expand-icon${expanded ? ' expanded' : ''}`}>
          {isDir ? (
            <ChevronRight size={14} />
          ) : (
            <span style={{ width: 14 }} />
          )}
        </span>
        <span className="file-icon">
          {isDir ? (
            expanded ? (
              <FolderOpen size={14} />
            ) : (
              <Folder size={14} />
            )
          ) : (
            <File size={14} />
          )}
        </span>
        <span className="file-name">{node.name}</span>
        {loading && (
          <span style={{ color: 'var(--text-dim)', fontSize: 11, marginLeft: 'auto' }}>
            ...
          </span>
        )}
      </div>
      {isDir && expanded && children.length > 0 && (
        <div>
          {children.map((child) => (
            <FileItem
              key={child.path}
              node={child}
              depth={depth + 1}
              onContextMenu={onContextMenu}
              onContextMenuAction={onContextMenuAction}
              renaming={renaming}
              renameValue={renameValue}
              setRenaming={setRenaming}
              setRenameValue={setRenameValue}
            />
          ))}
        </div>
      )}
    </>
  );
};

const FileExplorer: React.FC = () => {
  const workspacePath = useEditorStore((s) => s.workspacePath);

  const fileTree = useEditorStore((s) => s.fileTree);
  const setFileTree = useEditorStore((s) => s.setFileTree);
  const setSelectedFile = useEditorStore((s) => s.setSelectedFile);
  const openFile = useEditorStore((s) => s.openFile);
  const setWorkspace = useEditorStore((s) => s.setWorkspace);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const rootDir = workspacePath
    ? {
        name: workspacePath.split('\\').pop() || workspacePath.split('/').pop() || workspacePath,
        path: workspacePath,
        isDirectory: true,
        isFile: false,
        isSymlink: false,
        expanded: true,
        children: fileTree,
      }
    : null;

  const loadWorkspace = useCallback(async () => {
    if (!workspacePath) return;
    try {
      const entries = await window.electronAPI.fileSystem.readDirectory(workspacePath);
      const mapped: FileNode[] = entries.map((e: any) => ({
        name: e.name,
        path: e.path,
        isDirectory: e.isDirectory,
        isFile: e.isFile,
        isSymlink: e.isSymlink || false,
        children: [],
      }));
      setFileTree(mapped);
    } catch {
      setFileTree([]);
    }
  }, [workspacePath, setFileTree]);

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  const collapseAll = useCallback(() => {
    const collapse = (nodes: FileNode[]): FileNode[] =>
      nodes.map((n) => ({
        ...n,
        expanded: false,
        children: n.children ? collapse(n.children) : n.children,
      }));
    setFileTree(collapse(fileTree));
  }, [fileTree, setFileTree]);

  const handleContextMenu = useCallback((e: React.MouseEvent, node: FileNode) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, node });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  useEffect(() => {
    const handler = () => closeContextMenu();
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [closeContextMenu]);

  const handleCreateFile = useCallback(
    async (parentPath: string) => {
      const name = prompt('Enter file name:');
      if (!name) return;
      try {
        const newPath = `${parentPath}\\${name}`;
        await window.electronAPI.fileSystem.writeFile(newPath, '');
        const data = await window.electronAPI.fileSystem.readFile(newPath);
        if (data.content !== undefined) {
          openFile(newPath, data.content);
        }
        const entries = await window.electronAPI.fileSystem.readDirectory(parentPath);
        const mapped: FileNode[] = entries.map((e: any) => ({
          name: e.name,
          path: e.path,
          isDirectory: e.isDirectory,
          isFile: e.isFile,
          isSymlink: e.isSymlink || false,
          children: [],
        }));
        const updateTree = (nodes: FileNode[]): FileNode[] =>
          nodes.map((n) => {
            if (n.path === parentPath) return { ...n, children: mapped };
            if (n.children) return { ...n, children: updateTree(n.children) };
            return n;
          });
        setFileTree(updateTree(fileTree));
      } catch {
        // ignore
      }
    },
    [fileTree, setFileTree, openFile]
  );

  const handleCreateFolder = useCallback(
    async (parentPath: string) => {
      const name = prompt('Enter folder name:');
      if (!name) return;
      try {
        const newPath = `${parentPath}\\${name}`;
        await window.electronAPI.fileSystem.createDirectory(newPath);
        const entries = await window.electronAPI.fileSystem.readDirectory(parentPath);
        const mapped: FileNode[] = entries.map((e: any) => ({
          name: e.name,
          path: e.path,
          isDirectory: e.isDirectory,
          isFile: e.isFile,
          isSymlink: e.isSymlink || false,
          children: [],
        }));
        const updateTree = (nodes: FileNode[]): FileNode[] =>
          nodes.map((n) => {
            if (n.path === parentPath) return { ...n, children: mapped };
            if (n.children) return { ...n, children: updateTree(n.children) };
            return n;
          });
        setFileTree(updateTree(fileTree));
      } catch {
        // ignore
      }
    },
    [fileTree, setFileTree]
  );

  const handleRename = useCallback((node: FileNode) => {
    setRenaming(node.path);
    setRenameValue(node.name);
    setContextMenu(null);
  }, []);

  const handleDelete = useCallback(
    async (node: FileNode) => {
      if (!window.confirm(`Delete "${node.name}"?`)) return;
      try {
        if (node.isDirectory) {
          await window.electronAPI.fileSystem.deleteDirectory(node.path);
        } else {
          await window.electronAPI.fileSystem.deleteFile(node.path);
        }
        const parentPath = node.path.substring(0, node.path.lastIndexOf('\\'));
        const entries = await window.electronAPI.fileSystem.readDirectory(parentPath);
        const mapped: FileNode[] = entries.map((e: any) => ({
          name: e.name,
          path: e.path,
          isDirectory: e.isDirectory,
          isFile: e.isFile,
          isSymlink: e.isSymlink || false,
          children: [],
        }));
        const updateTree = (nodes: FileNode[]): FileNode[] =>
          nodes.map((n) => {
            if (n.path === parentPath) return { ...n, children: mapped };
            if (n.children) return { ...n, children: updateTree(n.children) };
            return n;
          });
        setFileTree(updateTree(fileTree));
      } catch {
        // ignore
      }
    },
    [fileTree, setFileTree]
  );

  const handleContextMenuAction = useCallback(
    (action: string, node: FileNode) => {
      setContextMenu(null);
      switch (action) {
        case 'new-file':
          handleCreateFile(node.isDirectory ? node.path : node.path.substring(0, node.path.lastIndexOf('\\')));
          break;
        case 'new-folder':
          handleCreateFolder(node.isDirectory ? node.path : node.path.substring(0, node.path.lastIndexOf('\\')));
          break;
        case 'rename':
          handleRename(node);
          break;
        case 'delete':
          handleDelete(node);
          break;
      }
    },
    [handleCreateFile, handleCreateFolder, handleRename, handleDelete]
  );

  const defaultWorkspacePath = useSettingsStore((s) => s.defaultWorkspacePath);

  const handleOpenFolder = useCallback(async () => {
    try {
      const result = await window.electronAPI.fileSystem.openFolderDialog(defaultWorkspacePath || undefined);
      if (result && !result.canceled && result.filePaths.length > 0) {
        const folderPath = result.filePaths[0];
        const data = await window.electronAPI.fileSystem.readDirectory(folderPath);
        if (data && data.files) {
          setWorkspace(folderPath, data.files);
        }
      }
    } catch {
      // ignore
    }
  }, [setWorkspace]);

  if (!workspacePath) {
    return (
      <div className="sidebar-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, padding: 20 }}>
        <FolderOpen size={40} style={{ color: 'var(--text-dim)' }} />
        <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>No folder opened</div>
        <button
          onClick={handleOpenFolder}
          style={{
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            padding: '6px 16px',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          Open Folder
        </button>
      </div>
    );
  }

  return (
    <div className="sidebar-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="sidebar-header">
        <span>{rootDir?.name || 'Workspace'}</span>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            className="activity-btn"
            title="Collapse All"
            onClick={collapseAll}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 2, display: 'flex' }}
          >
            <Minimize2 size={14} />
          </button>
          <button
            className="activity-btn"
            title="Refresh"
            onClick={loadWorkspace}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 2, display: 'flex' }}
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '4px 0' }}>
        {rootDir && (
          <FileItem
            node={rootDir}
            depth={0}
            onContextMenu={handleContextMenu}
            onContextMenuAction={handleContextMenuAction}
            renaming={renaming}
            renameValue={renameValue}
            setRenaming={setRenaming}
            setRenameValue={setRenameValue}
          />
        )}
      </div>

      {contextMenu && (
        <div
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            background: 'var(--sidebar-bg)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            padding: '4px 0',
            zIndex: 1000,
            minWidth: 160,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="context-menu-item"
            onClick={() => handleContextMenuAction('new-file', contextMenu.node)}
            style={{
              padding: '6px 16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              color: 'var(--text)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--hover-bg)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <FilePlus size={14} />
            New File
          </div>
          <div
            className="context-menu-item"
            onClick={() => handleContextMenuAction('new-folder', contextMenu.node)}
            style={{
              padding: '6px 16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              color: 'var(--text)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--hover-bg)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <FolderPlus size={14} />
            New Folder
          </div>
          <div
            className="context-menu-item"
            onClick={() => handleContextMenuAction('rename', contextMenu.node)}
            style={{
              padding: '6px 16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              color: 'var(--text)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--hover-bg)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <Pencil size={14} />
            Rename
          </div>
          <div
            className="context-menu-item"
            onClick={() => handleContextMenuAction('delete', contextMenu.node)}
            style={{
              padding: '6px 16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              color: 'var(--text)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--hover-bg)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <Trash2 size={14} />
            Delete
          </div>
        </div>
      )}
    </div>
  );
};

export default FileExplorer;
