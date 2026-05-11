import React, { useEffect, useState, useCallback } from 'react';
import { GitBranch, Plus, X, RefreshCw, Check, GitCommit, FileCode } from 'lucide-react';
import { useGitStore } from '../../stores/gitStore';
import { useEditorStore } from '../../stores/editorStore';

const STATUS_COLORS: Record<string, string> = {
  M: '#ffc107',
  A: '#28a745',
  D: '#dc3545',
  U: '#6c757d',
};

const STATUS_LABELS: Record<string, string> = {
  M: 'Modified',
  A: 'Added',
  D: 'Deleted',
  U: 'Untracked',
};

const GitPanel: React.FC = () => {
  const workspacePath = useEditorStore((s) => s.workspacePath);
  const {
    branch, stagedFiles, unstagedFiles, commits,
    loading, error, refresh, stageFile, stageAll, unstageFile, commit,
  } = useGitStore();

  const [commitMsg, setCommitMsg] = useState('');
  const [committing, setCommitting] = useState(false);

  useEffect(() => {
    if (workspacePath) refresh(workspacePath);
  }, [workspacePath]);

  const handleRefresh = useCallback(() => {
    if (workspacePath) refresh(workspacePath);
  }, [workspacePath, refresh]);

  const handleStage = useCallback((filePath: string) => {
    if (workspacePath) stageFile(workspacePath, filePath);
  }, [workspacePath, stageFile]);

  const handleUnstage = useCallback((filePath: string) => {
    if (workspacePath) unstageFile(workspacePath, filePath);
  }, [workspacePath, unstageFile]);

  const handleStageAll = useCallback(() => {
    if (workspacePath) stageAll(workspacePath);
  }, [workspacePath, stageAll]);

  const handleCommit = useCallback(async () => {
    if (!workspacePath || !commitMsg.trim() || committing) return;
    setCommitting(true);
    const ok = await commit(workspacePath, commitMsg);
    if (ok) setCommitMsg('');
    setCommitting(false);
  }, [workspacePath, commitMsg, committing, commit]);

  const changeCount = stagedFiles.length + unstagedFiles.length;

  return (
    <div className="git-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
          <GitBranch size={14} style={{ color: 'var(--accent)' }} />
          <span>{branch || (loading ? '...' : 'no repo')}</span>
          <button
            title="Refresh"
            onClick={handleRefresh}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', padding: 2, borderRadius: 3 }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--hover-bg)'; e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-dim)'; }}
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '6px 12px', fontSize: 12, color: 'var(--red)', borderBottom: '1px solid var(--border)' }}>
          {error}
        </div>
      )}

      {!workspacePath && (
        <div style={{ padding: '20px 16px', color: 'var(--text-dim)', fontSize: 13, textAlign: 'center' }}>
          Open a folder to view Git changes
        </div>
      )}

      {workspacePath && !loading && changeCount === 0 && !error && (
        <div style={{ padding: '20px 16px', color: 'var(--text-dim)', fontSize: 13, textAlign: 'center' }}>
          No changes yet
        </div>
      )}

      {stagedFiles.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Staged ({stagedFiles.length})
            </span>
          </div>
          {stagedFiles.map((item, idx) => (
            <div key={`staged-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px', cursor: 'pointer', fontSize: 13 }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--hover-bg)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: 3, fontSize: 11, fontWeight: 700, fontFamily: 'monospace', flexShrink: 0, background: `${STATUS_COLORS[item.status]}22`, color: STATUS_COLORS[item.status] }}>
                {item.status}
              </span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <span style={{ color: 'var(--text)', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                  {item.path.split(/[/\\]/).pop()}
                </span>
                <span style={{ color: 'var(--text-dim)', fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                  {item.path}
                </span>
              </div>
              <button title="Unstage" onClick={() => handleUnstage(item.path)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', padding: 2, borderRadius: 3 }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--orange)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-dim)'; }}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </>
      )}

      {unstagedFiles.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Changes ({unstagedFiles.length})
            </span>
            <button title="Stage All" onClick={handleStageAll}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', padding: 2, borderRadius: 3 }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--hover-bg)'; e.currentTarget.style.color = 'var(--text)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-dim)'; }}
            >
              <Plus size={14} />
            </button>
          </div>
          {unstagedFiles.map((item, idx) => (
            <div key={`unstaged-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px', cursor: 'pointer', fontSize: 13 }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--hover-bg)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              onClick={() => handleStage(item.path)}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: 3, fontSize: 11, fontWeight: 700, fontFamily: 'monospace', flexShrink: 0, background: `${STATUS_COLORS[item.status]}22`, color: STATUS_COLORS[item.status] }}>
                {item.status}
              </span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <span style={{ color: 'var(--text)', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                  {item.path.split(/[/\\]/).pop()}
                </span>
                <span style={{ color: 'var(--text-dim)', fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                  {item.path}
                </span>
              </div>
              <span style={{ fontSize: 10, color: 'var(--text-dim)', padding: '1px 4px', borderRadius: 3, background: 'var(--bg)', fontFamily: 'monospace', flexShrink: 0 }}>
                {STATUS_LABELS[item.status]}
              </span>
            </div>
          ))}
        </>
      )}

      {stagedFiles.length > 0 && (
        <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              value={commitMsg}
              onChange={(e) => setCommitMsg(e.target.value)}
              placeholder="Commit message..."
              onKeyDown={(e) => { if (e.key === 'Enter' && commitMsg.trim()) handleCommit(); }}
              style={{
                flex: 1, background: 'var(--input-bg)', border: '1px solid var(--border)',
                borderRadius: 4, padding: '6px 8px', fontSize: 13, color: 'var(--text)',
                outline: 'none',
              }}
            />
            <button onClick={handleCommit} disabled={!commitMsg.trim() || committing}
              style={{
                display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px',
                background: commitMsg.trim() && !committing ? 'var(--accent)' : 'var(--border)',
                border: 'none', borderRadius: 4, cursor: commitMsg.trim() && !committing ? 'pointer' : 'default',
                color: '#fff', fontSize: 12, fontWeight: 600,
              }}
            >
              <Check size={14} />
              Commit
            </button>
          </div>
        </div>
      )}

      {commits.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border)', flex: 1, overflow: 'auto' }}>
          <div style={{ padding: '6px 12px', fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--border)' }}>
            Recent Commits
          </div>
          {commits.map((c, i) => (
            <div key={c.hash} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '6px 12px', fontSize: 12, borderBottom: i < commits.length - 1 ? '1px solid var(--line)' : 'none' }}>
              <GitCommit size={12} style={{ color: 'var(--text-dim)', marginTop: 2, flexShrink: 0 }} />
              <div style={{ minWidth: 0 }}>
                <span style={{ color: 'var(--accent)', fontFamily: 'monospace', fontSize: 11 }}>{c.hash}</span>
                <span style={{ color: 'var(--text)', marginLeft: 6 }}>{c.message}</span>
                <div style={{ color: 'var(--text-dim)', fontSize: 10, marginTop: 1 }}>
                  {c.author} &middot; {c.date}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GitPanel;
