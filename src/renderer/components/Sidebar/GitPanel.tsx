import React, { useState } from 'react';
import { GitBranch, Plus, File, X, Circle } from 'lucide-react';

interface ChangeItem {
  path: string;
  status: 'M' | 'A' | 'D' | 'U';
}

const DEMO_BRANCH = 'main';

const DEMO_CHANGES: ChangeItem[] = [
  { path: 'src/renderer/App.tsx', status: 'M' },
  { path: 'src/renderer/components/Sidebar/SearchPanel.tsx', status: 'A' },
  { path: 'src/renderer/components/Sidebar/GitPanel.tsx', status: 'A' },
  { path: 'src/renderer/styles/global.css', status: 'M' },
  { path: 'src/shared/types.ts', status: 'M' },
  { path: 'package.json', status: 'M' },
  { path: 'src/old/utils.ts', status: 'D' },
  { path: 'src/temp/debug.log', status: 'U' },
];

const STATUS_LABELS: Record<string, string> = {
  M: 'Modified',
  A: 'Added',
  D: 'Deleted',
  U: 'Untracked',
};

const GitPanel: React.FC = () => {
  const [branch] = useState(DEMO_BRANCH);
  const [changes] = useState(DEMO_CHANGES);

  return (
    <div className="git-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
        <div className="git-branch" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
          <GitBranch size={14} style={{ color: 'var(--accent)' }} />
          <span>{branch}</span>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-dim)', fontWeight: 400 }}>
            {changes.length} change{changes.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Changes
        </span>
        <button
          title="Stage All Changes"
          style={{
            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)',
            display: 'flex', padding: 2, borderRadius: 3,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--hover-bg)'; e.currentTarget.style.color = 'var(--text)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-dim)'; }}
        >
          <Plus size={14} />
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '4px 0' }}>
        {changes.length === 0 && (
          <div style={{ padding: '20px 16px', color: 'var(--text-dim)', fontSize: 13, textAlign: 'center' }}>
            No changes yet
          </div>
        )}

        {changes.map((item, idx) => (
          <div
            key={`${item.path}-${idx}`}
            className="git-change-item"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '5px 12px',
              cursor: 'pointer',
              fontSize: 13,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--hover-bg)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <span
              className={`change-type ${item.status}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 20,
                height: 20,
                borderRadius: 3,
                fontSize: 11,
                fontWeight: 700,
                fontFamily: 'monospace',
                flexShrink: 0,
                background:
                  item.status === 'M' ? 'rgba(255, 193, 7, 0.15)' :
                  item.status === 'A' ? 'rgba(40, 167, 69, 0.15)' :
                  item.status === 'D' ? 'rgba(220, 53, 69, 0.15)' :
                  'rgba(108, 117, 125, 0.15)',
                color:
                  item.status === 'M' ? '#ffc107' :
                  item.status === 'A' ? '#28a745' :
                  item.status === 'D' ? '#dc3545' :
                  '#6c757d',
              }}
            >
              {item.status}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
              <span
                style={{
                  color: 'var(--text)',
                  fontSize: 13,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {item.path.split('/').pop()}
              </span>
              <span
                style={{
                  color: 'var(--text-dim)',
                  fontSize: 11,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {item.path}
              </span>
            </div>
            <span
              style={{
                fontSize: 10,
                color: 'var(--text-dim)',
                padding: '1px 4px',
                borderRadius: 3,
                background: 'var(--bg)',
                fontFamily: 'monospace',
                flexShrink: 0,
              }}
            >
              {STATUS_LABELS[item.status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GitPanel;
