import React, { useState, useCallback } from 'react';
import { Server, Plug, PlugZap, Folder, File, Upload, Download, FolderPlus, Trash2, ChevronRight, ChevronDown, RefreshCw, Loader2, LogIn, Shield } from 'lucide-react';

type Protocol = 'ftp' | 'sftp';

interface RemoteFile {
  name: string;
  path: string;
  isDirectory: boolean;
  isFile: boolean;
  size: number;
  modifiedAt: string;
}

const FTPPanel: React.FC = () => {
  const [protocol, setProtocol] = useState<Protocol>('ftp');
  const [host, setHost] = useState('');
  const [port, setPort] = useState(21);
  const [user, setUser] = useState('anonymous');
  const [password, setPassword] = useState('');
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [currentDir, setCurrentDir] = useState('/');
  const [files, setFiles] = useState<RemoteFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dirStack, setDirStack] = useState<string[]>(['/']);
  const [showConnect, setShowConnect] = useState(true);

  const api = useCallback(() => protocol === 'ftp' ? 'ftp' : 'sftp', [protocol]);

  const handleProtocolChange = useCallback((p: Protocol) => {
    setProtocol(p);
    setPort(p === 'ftp' ? 21 : 22);
  }, []);

  const handleConnect = useCallback(async () => {
    setConnecting(true);
    setError('');
    try {
      const mod = protocol === 'ftp' ? 'ftp' : 'sftp';
      const result = await (window.electronAPI as any)?.[mod]?.connect(host, port, user, password);
      if (result?.success) {
        setConnected(true);
        setShowConnect(false);
        const mod2 = protocol === 'ftp' ? 'ftp' : 'sftp';
        const list = await (window.electronAPI as any)?.[mod2]?.list();
        if (list?.success) setFiles(list.files || []);
      } else {
        setError(result?.error || 'Connection failed');
      }
    } catch (err: any) {
      setError(err.message || 'Connection failed');
    } finally {
      setConnecting(false);
    }
  }, [host, port, user, password, protocol]);

  const handleDisconnect = useCallback(async () => {
    const mod = protocol === 'ftp' ? 'ftp' : 'sftp';
    try { await (window.electronAPI as any)?.[mod]?.disconnect(); } catch {}
    setConnected(false);
    setFiles([]);
    setCurrentDir('/');
    setDirStack(['/']);
    setShowConnect(true);
  }, [protocol]);

  const navigateToDir = useCallback(async (dir: string) => {
    setLoading(true);
    setError('');
    try {
      const mod = protocol === 'ftp' ? 'ftp' : 'sftp';
      const list = await (window.electronAPI as any)?.[mod]?.list(dir);
      if (list?.success) {
        setFiles(list.files || []);
        setCurrentDir(dir);
        setDirStack((s) => [...s, dir]);
      } else {
        setError(list?.error || 'Failed to list directory');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [protocol]);

  const goBack = useCallback(() => {
    if (dirStack.length <= 1) return;
    const newStack = dirStack.slice(0, -1);
    const parent = newStack[newStack.length - 1];
    setDirStack(newStack);
    navigateToDir(parent);
  }, [dirStack, navigateToDir]);

  const refreshDir = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const mod = protocol === 'ftp' ? 'ftp' : 'sftp';
      const list = await (window.electronAPI as any)?.[mod]?.list(currentDir);
      if (list?.success) {
        setFiles(list.files || []);
      } else {
        setError(list?.error || 'Failed to list directory');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentDir, protocol]);

  const handleDownload = useCallback(async (file: RemoteFile) => {
    if (!window.electronAPI) return;
    const result = await window.electronAPI.fileSystem.showSaveDialog({ defaultPath: file.name });
    if (result.canceled || !result.filePath) return;
    try {
      const mod = protocol === 'ftp' ? 'ftp' : 'sftp';
      const dl = await (window.electronAPI as any)?.[mod]?.download(file.path, result.filePath);
      if (!dl?.success) setError(dl?.error || 'Download failed');
    } catch (err: any) {
      setError(err.message);
    }
  }, [protocol]);

  const handleUpload = useCallback(async () => {
    if (!window.electronAPI) return;
    const result = await window.electronAPI.fileSystem.openFileDialog();
    if (result.canceled || !result.filePaths?.length) return;
    const localPath = result.filePaths[0];
    const fileName = localPath.split('\\').pop() || localPath.split('/').pop() || 'file';
    const remotePath = currentDir === '/' ? fileName : currentDir + '/' + fileName;
    try {
      const mod = protocol === 'ftp' ? 'ftp' : 'sftp';
      const up = await (window.electronAPI as any)?.[mod]?.upload(localPath, remotePath);
      if (up?.success) refreshDir();
      else setError(up?.error || 'Upload failed');
    } catch (err: any) {
      setError(err.message);
    }
  }, [currentDir, protocol, refreshDir]);

  const handleMkdir = useCallback(async () => {
    const name = prompt('Directory name:');
    if (!name) return;
    const remotePath = currentDir === '/' ? name : currentDir + '/' + name;
    try {
      const mod = protocol === 'ftp' ? 'ftp' : 'sftp';
      const mk = await (window.electronAPI as any)?.[mod]?.mkdir(remotePath);
      if (mk?.success) refreshDir();
      else setError(mk?.error || 'Failed to create directory');
    } catch (err: any) {
      setError(err.message);
    }
  }, [currentDir, protocol, refreshDir]);

  const handleRemove = useCallback(async (file: RemoteFile) => {
    if (!confirm(`Delete ${file.name}?`)) return;
    try {
      const mod = protocol === 'ftp' ? 'ftp' : 'sftp';
      const rm = file.isDirectory
        ? await (window.electronAPI as any)?.[mod]?.removeDir(file.path)
        : await (window.electronAPI as any)?.[mod]?.remove(file.path);
      if (rm?.success) refreshDir();
      else setError(rm?.error || 'Failed to delete');
    } catch (err: any) {
      setError(err.message);
    }
  }, [protocol, refreshDir]);

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  };

  const rowStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '8px 0', borderBottom: '1px solid var(--border)',
  };

  const inputStyle: React.CSSProperties = {
    background: 'var(--input-bg)', border: '1px solid var(--border)',
    borderRadius: 4, color: 'var(--text)', fontSize: 13,
    padding: '6px 10px', width: 140, outline: 'none',
    fontFamily: 'var(--font-mono)',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 13, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6,
  };

  const btnStyle: React.CSSProperties = {
    padding: '6px 12px', borderRadius: 4, fontSize: 12, fontWeight: 500,
    border: '1px solid var(--border)', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 4,
    transition: 'all 0.15s',
  };

  if (showConnect) {
    return (
      <div style={{ padding: '12px 16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Server size={20} style={{ color: 'var(--accent)' }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Remote Connection</div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Connect via FTP or SFTP</div>
          </div>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}><Shield size={14} /> Protocol</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => handleProtocolChange('ftp')} style={{
              ...btnStyle, padding: '4px 12px', fontSize: 12,
              background: protocol === 'ftp' ? 'var(--accent)' : 'var(--hover-bg)',
              color: protocol === 'ftp' ? '#fff' : 'var(--text-dim)',
              border: protocol === 'ftp' ? '1px solid var(--accent)' : '1px solid var(--border)',
            }}>FTP</button>
            <button onClick={() => handleProtocolChange('sftp')} style={{
              ...btnStyle, padding: '4px 12px', fontSize: 12,
              background: protocol === 'sftp' ? 'var(--accent)' : 'var(--hover-bg)',
              color: protocol === 'sftp' ? '#fff' : 'var(--text-dim)',
              border: protocol === 'sftp' ? '1px solid var(--accent)' : '1px solid var(--border)',
            }}>SFTP</button>
          </div>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}><Server size={14} /> Host</span>
          <input style={inputStyle} value={host} onChange={(e) => setHost(e.target.value)} placeholder="ftp.example.com" />
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}><Server size={14} /> Port</span>
          <input style={{ ...inputStyle, width: 80 }} type="number" value={port} onChange={(e) => setPort(parseInt(e.target.value) || (protocol === 'ftp' ? 21 : 22))} />
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}><LogIn size={14} /> Username</span>
          <input style={inputStyle} value={user} onChange={(e) => setUser(e.target.value)} placeholder="anonymous" />
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}><LogIn size={14} /> Password</span>
          <input style={inputStyle} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" />
        </div>
        {error && (
          <div style={{ padding: '8px 12px', background: 'var(--hover-bg)', borderRadius: 6, fontSize: 12, color: 'var(--red)', marginBottom: 8 }}>{error}</div>
        )}
        <button style={{ ...btnStyle, background: 'var(--accent)', color: '#fff', justifyContent: 'center', marginTop: 8 }}
          onClick={handleConnect} disabled={connecting || !host}>
          {connecting ? <Loader2 size={14} className="spin" /> : <Plug size={14} />}
          {connecting ? 'Connecting...' : 'Connect'}
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '12px 16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        {protocol === 'sftp' ? <Shield size={20} style={{ color: connected ? 'var(--green)' : 'var(--text-dim)' }} />
          : <Server size={20} style={{ color: connected ? 'var(--green)' : 'var(--text-dim)' }} />}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{protocol.toUpperCase()}</div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user}@{host}:{port}
          </div>
        </div>
        <button onClick={handleDisconnect} style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex' }} title="Disconnect">
          <PlugZap size={16} />
        </button>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        <button onClick={goBack} disabled={dirStack.length <= 1} style={{ ...btnStyle, padding: '4px 8px', fontSize: 11, color: 'var(--text-dim)', background: 'transparent' }}>
          ../
        </button>
        <button onClick={refreshDir} disabled={loading} style={{ ...btnStyle, padding: '4px 8px', fontSize: 11, color: 'var(--text-dim)', background: 'transparent' }}>
          <RefreshCw size={12} className={loading ? 'spin' : ''} />
        </button>
        <button onClick={handleUpload} style={{ ...btnStyle, padding: '4px 8px', fontSize: 11, color: 'var(--text-dim)', background: 'transparent' }} title="Upload file">
          <Upload size={12} />
        </button>
        <button onClick={handleMkdir} style={{ ...btnStyle, padding: '4px 8px', fontSize: 11, color: 'var(--text-dim)', background: 'transparent' }} title="New directory">
          <FolderPlus size={12} />
        </button>
      </div>

      <div style={{ fontSize: 11, color: 'var(--text-dim)', padding: '4px 0', marginBottom: 4, fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {currentDir}
      </div>

      {error && (
        <div style={{ padding: '6px 10px', background: 'var(--hover-bg)', borderRadius: 4, fontSize: 11, color: 'var(--red)', marginBottom: 8 }}>{error}</div>
      )}

      <div style={{ flex: 1, overflow: 'auto' }}>
        {loading ? (
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-dim)' }}>
            <Loader2 size={20} className="spin" style={{ display: 'inline' }} />
          </div>
        ) : files.length === 0 ? (
          <div style={{ padding: '20px 16px', color: 'var(--text-dim)', fontSize: 13, textAlign: 'center' }}>Empty directory</div>
        ) : (
          files.map((file, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px',
              cursor: file.isDirectory ? 'pointer' : 'default', borderRadius: 4, fontSize: 13,
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--hover-bg)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              onDoubleClick={() => { if (file.isDirectory) navigateToDir(file.path); }}
            >
              {file.isDirectory ? (
                <ChevronRight size={12} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
              ) : (
                <File size={12} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
              )}
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text)' }}>
                {file.name}
              </span>
              {file.isFile && (
                <span style={{ fontSize: 11, color: 'var(--text-dim)', flexShrink: 0 }}>{formatSize(file.size)}</span>
              )}
              {file.isFile && (
                <button onClick={() => handleDownload(file)} style={{ padding: 2, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', flexShrink: 0 }} title="Download">
                  <Download size={12} />
                </button>
              )}
              <button onClick={() => handleRemove(file)} style={{ padding: 2, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', display: 'flex', flexShrink: 0 }} title="Delete">
                <Trash2 size={12} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FTPPanel;
