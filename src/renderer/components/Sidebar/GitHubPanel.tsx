import React, { useEffect, useState, useCallback } from 'react';
import { GitPullRequestCreate, LogIn, FolderGit2, Plus, RefreshCw, GitPullRequest, ExternalLink, Lock, Globe, Star, ChevronRight, ChevronDown } from 'lucide-react';
import { useGitHubStore } from '../../stores/githubStore';
import { useEditorStore } from '../../stores/editorStore';
import { useSettingsStore } from '../../stores/settingsStore';

const GitHubPanel: React.FC = () => {
  const {
    token, user, orgs, repos, loading, error,
    loadToken, setToken, validateAndLoad,
    cloneRepo, createRepo, createPR,
  } = useGitHubStore();

  const workspacePath = useEditorStore((s) => s.workspacePath);
  const setWorkspace = useEditorStore((s) => s.setWorkspace);
  const defaultWorkspacePath = useSettingsStore((s) => s.defaultWorkspacePath);

  const [tokenInput, setTokenInput] = useState('');
  const [view, setView] = useState<'token' | 'dashboard' | 'clone' | 'create-repo' | 'create-pr' | 'prs'>('token');
  const [cloneUrl, setCloneUrl] = useState('');
  const [clonePath, setClonePath] = useState('');
  const [newRepoName, setNewRepoName] = useState('');
  const [newRepoDesc, setNewRepoDesc] = useState('');
  const [newRepoPrivate, setNewRepoPrivate] = useState(true);
  const [prRepoFull, setPrRepoFull] = useState('');
  const [prTitle, setPrTitle] = useState('');
  const [prBody, setPrBody] = useState('');
  const [prHead, setPrHead] = useState('');
  const [prBase, setPrBase] = useState('');
  const [expandedSection, setExpandedSection] = useState<string | null>('__your__');
  const [orgReposCache, setOrgReposCache] = useState<Record<string, any[]>>({});
  const [loadingOrg, setLoadingOrg] = useState('');

  useEffect(() => { loadToken(); }, []);

  useEffect(() => {
    if (token) {
      validateAndLoad();
      setView('dashboard');
    }
  }, [token]);

  const handleSetToken = useCallback(async () => {
    if (!tokenInput.trim()) return;
    const ok = await setToken(tokenInput.trim());
    if (ok) { setTokenInput(''); }
  }, [tokenInput, setToken]);

  const handleClone = useCallback(async () => {
    if (!cloneUrl || !clonePath) return;
    const ok = await cloneRepo(cloneUrl, clonePath);
    if (ok && workspacePath && window.electronAPI) {
      const data = await window.electronAPI.fileSystem.readDirectory(clonePath);
      if (data.files) {
        setWorkspace(clonePath, data.files);
      }
    }
    if (ok) setView('dashboard');
  }, [cloneUrl, clonePath, cloneRepo, workspacePath, setWorkspace]);

  const handleCreateRepo = useCallback(async () => {
    if (!newRepoName.trim()) return;
    const ok = await createRepo(newRepoName.trim(), newRepoDesc.trim(), newRepoPrivate);
    if (ok) { setNewRepoName(''); setNewRepoDesc(''); setView('dashboard'); }
  }, [newRepoName, newRepoDesc, newRepoPrivate, createRepo]);

  const handleToggleSection = useCallback(async (section: string | null) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
      if (section && section !== '__your__' && !orgReposCache[section] && window.electronAPI) {
        setLoadingOrg(section);
        const res = await window.electronAPI.github.orgRepos(token, section);
        if (res.repos) {
          setOrgReposCache(prev => ({ ...prev, [section]: res.repos }));
        }
        setLoadingOrg('');
      }
    }
  }, [expandedSection, orgReposCache, token]);

  const handleRefreshRepos = useCallback(() => {
    const cur = expandedSection;
    if (cur === '__your__' && window.electronAPI) {
      validateAndLoad();
    } else if (cur && cur !== '__your__' && window.electronAPI) {
      setLoadingOrg(cur);
      window.electronAPI.github.orgRepos(token, cur).then(res => {
        if (res.repos) setOrgReposCache(prev => ({ ...prev, [cur]: res.repos }));
        setLoadingOrg('');
      });
    } else {
      validateAndLoad();
    }
  }, [expandedSection, token, validateAndLoad]);

  const handleCloneOne = useCallback(async (repo: any) => {
    if (!token || !window.electronAPI) return;
    const [owner] = repo.full_name.split('/');
    const basePath = defaultWorkspacePath || workspacePath || (await window.electronAPI.fileSystem.getUserHome()) || 'C:\\projects';
    const destDir = `${basePath}\\github\\${owner}`;
    const destPath = `${destDir}\\${repo.name}`;
    await window.electronAPI.fileSystem.createDirectory(destDir);
    const ok = await cloneRepo(repo.clone_url, destPath);
    if (ok) {
      const data = await window.electronAPI.fileSystem.readDirectory(destPath);
      if (data.files) setWorkspace(destPath, data.files);
    }
  }, [token, defaultWorkspacePath, workspacePath, cloneRepo, setWorkspace]);

  const handleCreatePR = useCallback(async () => {
    if (!prRepoFull.trim() || !prTitle.trim() || !prHead.trim() || !prBase.trim()) return;
    const [owner, repo] = prRepoFull.trim().split('/');
    if (!owner || !repo) return;
    const ok = await createPR(owner, repo, prTitle.trim(), prBody.trim(), prHead.trim(), prBase.trim());
    if (ok) { setPrTitle(''); setPrBody(''); setPrHead(''); setPrBase(''); setView('dashboard'); }
  }, [prRepoFull, prTitle, prBody, prHead, prBase, createPR]);

  if (!token) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <GitPullRequestCreate size={40} style={{ color: 'var(--accent)', margin: '0 auto 12px', display: 'block' }} />
          <h3 style={{ margin: '0 0 4px', fontSize: 15, color: 'var(--text)' }}>GitHub</h3>
          <p style={{ margin: '0 0 16px', fontSize: 12, color: 'var(--text-dim)' }}>
            Connect to GitHub to clone repos, create PRs, and manage your code
          </p>
          <input
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="Paste your GitHub token..."
            type="password"
            onKeyDown={(e) => { if (e.key === 'Enter') handleSetToken(); }}
            style={{
              width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border)',
              borderRadius: 6, padding: '8px 10px', fontSize: 13, color: 'var(--text)',
              outline: 'none', marginBottom: 8, boxSizing: 'border-box',
            }}
          />
          <button onClick={handleSetToken} disabled={!tokenInput.trim() || loading}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '8px 12px', background: tokenInput.trim() && !loading ? 'var(--accent)' : 'var(--border)',
              border: 'none', borderRadius: 6, cursor: tokenInput.trim() && !loading ? 'pointer' : 'default',
              color: '#fff', fontSize: 13, fontWeight: 600,
            }}
          >
            <LogIn size={16} />
            {loading ? 'Validating...' : 'Connect'}
          </button>
          {error && <p style={{ color: 'var(--red)', fontSize: 12, marginTop: 8 }}>{error}</p>}
          <p style={{ marginTop: 12, fontSize: 11, color: 'var(--text-dim)' }}>
            Create a token at{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); window.electronAPI?.shell.openExternal('https://github.com/settings/tokens'); }}
              style={{ color: 'var(--accent)' }}>github.com/settings/tokens</a>
            <br />with <code style={{ background: 'var(--hover-bg)', padding: '1px 4px', borderRadius: 3 }}>repo</code> and <code style={{ background: 'var(--hover-bg)', padding: '1px 4px', borderRadius: 3 }}>read:org</code> scopes
          </p>
        </div>
      </div>
    );
  }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <GitPullRequestCreate size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', flex: 1 }}>
            {view === 'dashboard' ? (user?.name || user?.login || 'GitHub') : view === 'clone' ? 'Clone Repo' : view === 'create-repo' ? 'New Repo' : view === 'create-pr' ? 'New PR' : 'Pull Requests'}
          </span>
          {view !== 'dashboard' && (
          <button onClick={() => setView('dashboard')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', padding: 2, borderRadius: 3, fontSize: 12 }}>
            Back
          </button>
        )}
      </div>

      {view === 'dashboard' && (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {user && (
            <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <img src={user.avatar_url} alt="" style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0 }} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{user.name || user.login}</div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{user.login}</div>
              </div>
              <button onClick={() => { useGitHubStore.setState({ token: '', user: null, orgs: [], repos: [] }); }}
                title="Disconnect"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', padding: 4, borderRadius: 3, fontSize: 11 }}
              >Logout</button>
            </div>
          )}

          <div style={{ padding: '6px 12px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <button onClick={() => setView('clone')}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', background: 'var(--hover-bg)', border: '1px solid var(--border)', borderRadius: 4, cursor: 'pointer', color: 'var(--text)', fontSize: 11 }}>
              <FolderGit2 size={12} /> Clone
            </button>
            <button onClick={() => setView('create-repo')}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', background: 'var(--hover-bg)', border: '1px solid var(--border)', borderRadius: 4, cursor: 'pointer', color: 'var(--text)', fontSize: 11 }}>
              <Plus size={12} /> New Repo
            </button>
            <button onClick={() => setView('create-pr')}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', background: 'var(--hover-bg)', border: '1px solid var(--border)', borderRadius: 4, cursor: 'pointer', color: 'var(--text)', fontSize: 11 }}>
              <GitPullRequest size={12} /> New PR
            </button>
            <button onClick={handleRefreshRepos}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', fontSize: 11, marginLeft: 'auto' }}>
              <RefreshCw size={12} /> Refresh
            </button>
          </div>

          <div>
            <div style={{ padding: '6px 12px', fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--border)' }}>
              Repositories
            </div>

            <div onClick={() => handleToggleSection('__your__')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: 'var(--text)', borderBottom: '1px solid var(--border)', userSelect: 'none' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--hover-bg)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
              {expandedSection === '__your__' ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              Your Repos
              <span style={{ color: 'var(--text-dim)', fontSize: 11, marginLeft: 4 }}>({repos.length})</span>
            </div>
            {expandedSection === '__your__' && (
              <div>
                {loading && <div style={{ padding: '10px 20px', textAlign: 'center', color: 'var(--text-dim)', fontSize: 12 }}>Loading…</div>}
                {error && <div style={{ padding: '6px 12px', fontSize: 12, color: 'var(--red)', borderBottom: '1px solid var(--border)' }}>{error}</div>}
                {!loading && repos.length === 0 && !error && (
                  <div style={{ padding: '10px 20px', textAlign: 'center', color: 'var(--text-dim)', fontSize: 12 }}>No repositories found</div>
                )}
                {repos.map((repo) => (
                  <div key={repo.id}
                    style={{ padding: '8px 12px 8px 24px', borderBottom: '1px solid var(--line)', cursor: 'pointer', fontSize: 13 }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--hover-bg)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      {repo.private ? <Lock size={12} style={{ color: 'var(--orange)', flexShrink: 0 }} /> : <Globe size={12} style={{ color: 'var(--green)', flexShrink: 0 }} />}
                      <span style={{ color: 'var(--accent)', fontWeight: 500, fontSize: 13 }}>{repo.full_name}</span>
                    </div>
                    {repo.description && <div style={{ color: 'var(--text-dim)', fontSize: 12, margin: '2px 0', lineHeight: 1.3 }}>{repo.description}</div>}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                      {repo.language && <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{repo.language}</span>}
                      <span style={{ fontSize: 11, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Star size={10} /> {repo.private ? 'Private' : 'Public'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                      <button title="Clone repository" onClick={() => handleCloneOne(repo)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 3, padding: '2px 6px', borderRadius: 3, fontSize: 11 }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--active-bg)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                        <FolderGit2 size={12} /> Clone
                      </button>
                      <button title="Open in Browser" onClick={() => window.electronAPI?.shell.openExternal(repo.html_url)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 3, padding: '2px 6px', borderRadius: 3, fontSize: 11 }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--active-bg)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                        <ExternalLink size={12} /> Open
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {orgs.length > 0 && orgs.map((org) => (
              <div key={org.login}>
                <div onClick={() => handleToggleSection(org.login)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: 'var(--text)', borderBottom: '1px solid var(--border)', userSelect: 'none' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--hover-bg)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                  {expandedSection === org.login ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  {org.login}
                  {orgReposCache[org.login] && <span style={{ color: 'var(--text-dim)', fontSize: 11, marginLeft: 4 }}>({orgReposCache[org.login].length})</span>}
                </div>
                {expandedSection === org.login && (
                  <div>
                    {loadingOrg === org.login && (
                      <div style={{ padding: '10px 20px', textAlign: 'center', color: 'var(--text-dim)', fontSize: 12 }}>Loading…</div>
                    )}
                    {orgReposCache[org.login]?.length === 0 && loadingOrg !== org.login && (
                      <div style={{ padding: '10px 20px', textAlign: 'center', color: 'var(--text-dim)', fontSize: 12 }}>No repositories</div>
                    )}
                    {orgReposCache[org.login]?.map((repo) => (
                      <div key={repo.id}
                        style={{ padding: '8px 12px 8px 24px', borderBottom: '1px solid var(--line)', cursor: 'pointer', fontSize: 13 }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--hover-bg)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          {repo.private ? <Lock size={12} style={{ color: 'var(--orange)', flexShrink: 0 }} /> : <Globe size={12} style={{ color: 'var(--green)', flexShrink: 0 }} />}
                          <span style={{ color: 'var(--accent)', fontWeight: 500, fontSize: 13 }}>{repo.full_name}</span>
                        </div>
                        {repo.description && <div style={{ color: 'var(--text-dim)', fontSize: 12, margin: '2px 0', lineHeight: 1.3 }}>{repo.description}</div>}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                          {repo.language && <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{repo.language}</span>}
                          <span style={{ fontSize: 11, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Star size={10} /> {repo.private ? 'Private' : 'Public'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                          <button title="Clone repository" onClick={() => handleCloneOne(repo)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 3, padding: '2px 6px', borderRadius: 3, fontSize: 11 }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--active-bg)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                            <FolderGit2 size={12} /> Clone
                          </button>
                          <button title="Open in Browser" onClick={() => window.electronAPI?.shell.openExternal(repo.html_url)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 3, padding: '2px 6px', borderRadius: 3, fontSize: 11 }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--active-bg)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                            <ExternalLink size={12} /> Open
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'clone' && (
        <div style={{ padding: 12, flex: 1 }}>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--text-dim)', marginBottom: 4 }}>Repository URL</label>
          <input value={cloneUrl} onChange={(e) => setCloneUrl(e.target.value)}
            placeholder="https://github.com/user/repo.git"
            style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '8px 10px', fontSize: 13, color: 'var(--text)', outline: 'none', marginBottom: 8, boxSizing: 'border-box' }} />
          <label style={{ display: 'block', fontSize: 12, color: 'var(--text-dim)', marginBottom: 4 }}>Destination Path</label>
          <input value={clonePath} onChange={(e) => setClonePath(e.target.value)}
            placeholder={workspacePath ? `${workspacePath}\\repo-name` : 'C:\\projects\\repo-name'}
            style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '8px 10px', fontSize: 13, color: 'var(--text)', outline: 'none', marginBottom: 12, boxSizing: 'border-box' }} />
          <button onClick={handleClone} disabled={!cloneUrl || !clonePath || loading}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 12px', background: cloneUrl && clonePath && !loading ? 'var(--accent)' : 'var(--border)', border: 'none', borderRadius: 6, cursor: cloneUrl && clonePath && !loading ? 'pointer' : 'default', color: '#fff', fontSize: 13, fontWeight: 600 }}>
            {loading ? 'Cloning...' : 'Clone Repository'}
          </button>
          {error && <p style={{ color: 'var(--red)', fontSize: 12, marginTop: 8 }}>{error}</p>}
        </div>
      )}

      {view === 'create-repo' && (
        <div style={{ padding: 12, flex: 1 }}>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--text-dim)', marginBottom: 4 }}>Repository Name</label>
          <input value={newRepoName} onChange={(e) => setNewRepoName(e.target.value)}
            placeholder="my-awesome-project"
            style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '8px 10px', fontSize: 13, color: 'var(--text)', outline: 'none', marginBottom: 8, boxSizing: 'border-box' }} />
          <label style={{ display: 'block', fontSize: 12, color: 'var(--text-dim)', marginBottom: 4 }}>Description</label>
          <input value={newRepoDesc} onChange={(e) => setNewRepoDesc(e.target.value)}
            placeholder="Optional description"
            style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '8px 10px', fontSize: 13, color: 'var(--text)', outline: 'none', marginBottom: 8, boxSizing: 'border-box' }} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text)', marginBottom: 12, cursor: 'pointer' }}>
            <input type="checkbox" checked={newRepoPrivate} onChange={(e) => setNewRepoPrivate(e.target.checked)}
              style={{ accentColor: 'var(--accent)' }} />
            Private repository
          </label>
          <button onClick={handleCreateRepo} disabled={!newRepoName.trim() || loading}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 12px', background: newRepoName.trim() && !loading ? 'var(--accent)' : 'var(--border)', border: 'none', borderRadius: 6, cursor: newRepoName.trim() && !loading ? 'pointer' : 'default', color: '#fff', fontSize: 13, fontWeight: 600 }}>
            {loading ? 'Creating...' : 'Create Repository'}
          </button>
          {error && <p style={{ color: 'var(--red)', fontSize: 12, marginTop: 8 }}>{error}</p>}
        </div>
      )}

      {view === 'create-pr' && (
        <div style={{ padding: 12, flex: 1, overflow: 'auto' }}>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--text-dim)', marginBottom: 4 }}>Repository (owner/repo)</label>
          <input value={prRepoFull} onChange={(e) => setPrRepoFull(e.target.value)}
            placeholder="owner/repository"
            style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '8px 10px', fontSize: 13, color: 'var(--text)', outline: 'none', marginBottom: 8, boxSizing: 'border-box' }} />
          <label style={{ display: 'block', fontSize: 12, color: 'var(--text-dim)', marginBottom: 4 }}>Title</label>
          <input value={prTitle} onChange={(e) => setPrTitle(e.target.value)}
            placeholder="PR title"
            style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '8px 10px', fontSize: 13, color: 'var(--text)', outline: 'none', marginBottom: 8, boxSizing: 'border-box' }} />
          <label style={{ display: 'block', fontSize: 12, color: 'var(--text-dim)', marginBottom: 4 }}>Description</label>
          <textarea value={prBody} onChange={(e) => setPrBody(e.target.value)}
            placeholder="PR description"
            rows={4}
            style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '8px 10px', fontSize: 13, color: 'var(--text)', outline: 'none', marginBottom: 8, boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' }} />
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-dim)', marginBottom: 4 }}>Head Branch</label>
              <input value={prHead} onChange={(e) => setPrHead(e.target.value)}
                placeholder="feature-branch"
                style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '8px 10px', fontSize: 13, color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-dim)', marginBottom: 4 }}>Base Branch</label>
              <input value={prBase} onChange={(e) => setPrBase(e.target.value)}
                placeholder="main"
                style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '8px 10px', fontSize: 13, color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>
          <button onClick={handleCreatePR} disabled={!prRepoFull.trim() || !prTitle.trim() || !prHead.trim() || !prBase.trim() || loading}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 12px', background: prRepoFull.trim() && prTitle.trim() && prHead.trim() && prBase.trim() && !loading ? 'var(--accent)' : 'var(--border)', border: 'none', borderRadius: 6, cursor: prRepoFull.trim() && prTitle.trim() && prHead.trim() && prBase.trim() && !loading ? 'pointer' : 'default', color: '#fff', fontSize: 13, fontWeight: 600 }}>
            {loading ? 'Creating...' : 'Create Pull Request'}
          </button>
          {error && <p style={{ color: 'var(--red)', fontSize: 12, marginTop: 8 }}>{error}</p>}
        </div>
      )}
    </div>
  );
};

export default GitHubPanel;