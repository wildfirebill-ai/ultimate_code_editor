import React, { useState, useCallback } from 'react';
import { Search, File, X, ChevronRight } from 'lucide-react';
import { SearchResult } from '@shared/types';

const MOCK_RESULTS: SearchResult[] = [
  { file: 'src/renderer/App.tsx', line: 23, column: 5, match: 'useEffect', lineContent: '  React.useEffect(() => {' },
  { file: 'src/renderer/App.tsx', line: 45, column: 12, match: 'useEffect', lineContent: '    useEffect(() => {' },
  { file: 'src/renderer/components/Sidebar.tsx', line: 12, column: 3, match: 'useEffect', lineContent: '  useEffect(() => {' },
  { file: 'src/renderer/stores/editorStore.ts', line: 55, column: 8, match: 'useEffect', lineContent: '  // useEffect usage' },
  { file: 'src/renderer/styles/global.css', line: 120, column: 1, match: 'effect', lineContent: '/* transition effect */' },
];

const SearchPanel: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(() => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    const q = query.toLowerCase();
    const filtered = MOCK_RESULTS.filter(
      (r) =>
        r.file.toLowerCase().includes(q) ||
        r.match.toLowerCase().includes(q) ||
        r.lineContent.toLowerCase().includes(q)
    );
    setResults(filtered);
    setHasSearched(true);
  }, [query]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    },
    [handleSearch]
  );

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
  }, []);

  const highlightMatch = (text: string, q: string) => {
    if (!q.trim()) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span style={{ background: 'var(--accent)', color: '#fff', borderRadius: 2, padding: '0 2px' }}>
          {text.slice(idx, idx + q.length)}
        </span>
        {text.slice(idx + q.length)}
      </>
    );
  };

  return (
    <div className="search-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none' }} />
            <input
              className="search-input"
              type="text"
              placeholder="Search in files..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{
                width: '100%',
                padding: '6px 28px 6px 30px',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 4,
                color: 'var(--text)',
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {query && (
              <button
                onClick={clearSearch}
                style={{
                  position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)',
                  display: 'flex', padding: 2,
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={handleSearch}
            style={{
              background: 'var(--accent)', color: '#fff', border: 'none',
              padding: '6px 12px', borderRadius: 4, cursor: 'pointer',
              fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap',
            }}
          >
            Search
          </button>
        </div>
      </div>

      <div className="search-results" style={{ flex: 1, overflow: 'auto', padding: '4px 0' }}>
        {hasSearched && results.length === 0 && (
          <div style={{ padding: '20px 16px', color: 'var(--text-dim)', fontSize: 13, textAlign: 'center' }}>
            No results found for "{query}"
          </div>
        )}

        {!hasSearched && (
          <div style={{ padding: '20px 16px', color: 'var(--text-dim)', fontSize: 13, textAlign: 'center' }}>
            Enter a search query and press Enter or click Search
          </div>
        )}

        {results.map((result, idx) => (
          <div
            key={`${result.file}-${result.line}-${idx}`}
            className="search-result-item"
            style={{
              padding: '6px 12px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              fontSize: 13,
              borderLeft: '3px solid transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--hover-bg)';
              e.currentTarget.style.borderLeftColor = 'var(--accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderLeftColor = 'transparent';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-dim)', fontSize: 12 }}>
              <File size={12} />
              <span style={{ color: 'var(--text)', fontWeight: 500 }}>{result.file.split('/').pop()}</span>
              <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>
                <ChevronRight size={10} style={{ display: 'inline', verticalAlign: 'middle' }} />
                {' '}{result.file}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
              <span
                style={{
                  background: 'var(--accent-dim)',
                  color: 'var(--accent)',
                  fontSize: 11,
                  padding: '0 4px',
                  borderRadius: 3,
                  fontWeight: 600,
                  fontFamily: 'monospace',
                }}
              >
                L{result.line}
              </span>
              <span style={{ color: 'var(--text)', fontFamily: 'monospace', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {highlightMatch(result.lineContent, query)}
              </span>
            </div>
          </div>
        ))}

        {hasSearched && results.length > 0 && (
          <div style={{ padding: '8px 12px', color: 'var(--text-dim)', fontSize: 11, borderTop: '1px solid var(--border)' }}>
            {results.length} result{results.length !== 1 ? 's' : ''} found
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPanel;
