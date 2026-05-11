import { create } from 'zustand';

interface GitHubUser {
  login: string;
  avatar_url: string;
  name: string;
  email: string;
  html_url: string;
}

interface GitHubOrg {
  login: string;
  avatar_url: string;
  description: string;
}

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  clone_url: string;
  ssh_url: string;
  private: boolean;
  fork: boolean;
  language: string;
  updated_at: string;
  owner: { login: string; avatar_url: string };
}

interface GitHubPR {
  number: number;
  title: string;
  state: string;
  html_url: string;
  created_at: string;
  user: { login: string; avatar_url: string };
  head: { ref: string; repo: { full_name: string } };
  base: { ref: string };
}

interface GitHubBranch {
  name: string;
  commit: { sha: string };
}

interface GitHubStore {
  token: string;
  user: GitHubUser | null;
  orgs: GitHubOrg[];
  repos: GitHubRepo[];
  selectedOrg: string | null;
  prs: GitHubPR[];
  branches: GitHubBranch[];
  loading: boolean;
  error: string | null;

  loadToken: () => Promise<void>;
  setToken: (token: string) => Promise<boolean>;
  validateAndLoad: () => Promise<void>;
  loadOrgs: () => Promise<void>;
  loadRepos: () => Promise<void>;
  loadOrgRepos: (org: string) => Promise<void>;
  selectOrg: (org: string | null) => void;
  loadPRs: (owner: string, repo: string) => Promise<void>;
  loadBranches: (owner: string, repo: string) => Promise<void>;
  cloneRepo: (url: string, destPath: string) => Promise<boolean>;
  createRepo: (name: string, description: string, isPrivate: boolean) => Promise<boolean>;
  createPR: (owner: string, repo: string, title: string, body: string, head: string, base: string) => Promise<boolean>;
}

export const useGitHubStore = create<GitHubStore>()((set, get) => ({
  token: '',
  user: null,
  orgs: [],
  repos: [],
  selectedOrg: null,
  prs: [],
  branches: [],
  loading: false,
  error: null,

  loadToken: async () => {
    if (!window.electronAPI) return;
    const { token } = await window.electronAPI.github.getToken();
    if (token) set({ token });
  },

  setToken: async (token) => {
    if (!window.electronAPI) return false;
    const { valid, error } = await window.electronAPI.github.validateToken(token);
    if (!valid) { set({ error: error || 'Invalid token' }); return false; }
    await window.electronAPI.github.setToken(token);
    set({ token, error: null });
    return true;
  },

  validateAndLoad: async () => {
    const { token } = get();
    if (!token || !window.electronAPI) return;
    set({ loading: true, error: null });
    try {
      const [userRes, orgsRes, reposRes] = await Promise.all([
        window.electronAPI.github.user(token),
        window.electronAPI.github.orgs(token),
        window.electronAPI.github.userRepos(token),
      ]);
      const errs = [userRes, orgsRes, reposRes].filter(r => r.error).map(r => r.error);
      set({
        user: userRes.user || null,
        orgs: orgsRes.orgs || [],
        repos: reposRes.repos || [],
        loading: false,
        error: errs.length > 0 ? errs.join('; ') : null,
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  loadOrgs: async () => {
    const { token } = get();
    if (!token || !window.electronAPI) return;
    const res = await window.electronAPI.github.orgs(token);
    if (res.orgs) set({ orgs: res.orgs });
    else set({ error: res.error || null });
  },

  loadRepos: async () => {
    const { token } = get();
    if (!token || !window.electronAPI) return;
    set({ loading: true });
    const res = await window.electronAPI.github.userRepos(token);
    if (res.repos) set({ repos: res.repos, loading: false });
    else set({ error: res.error || null, loading: false });
  },

  loadOrgRepos: async (org) => {
    const { token } = get();
    if (!token || !window.electronAPI) return;
    set({ loading: true, selectedOrg: org });
    const res = await window.electronAPI.github.orgRepos(token, org);
    if (res.repos) set({ repos: res.repos, loading: false });
    else set({ error: res.error || null, loading: false });
  },

  selectOrg: (org) => {
    set({ selectedOrg: org });
    if (org) get().loadOrgRepos(org);
    else get().loadRepos();
  },

  loadPRs: async (owner, repo) => {
    const { token } = get();
    if (!token || !window.electronAPI) return;
    const res = await window.electronAPI.github.listPRs(token, owner, repo);
    if (res.prs) set({ prs: res.prs });
  },

  loadBranches: async (owner, repo) => {
    const { token } = get();
    if (!token || !window.electronAPI) return;
    const res = await window.electronAPI.github.listBranches(token, owner, repo);
    if (res.branches) set({ branches: res.branches });
  },

  cloneRepo: async (url, destPath) => {
    const { token } = get();
    if (!token || !window.electronAPI) return false;
    set({ loading: true, error: null });
    const res = await window.electronAPI.github.clone(url, destPath, token);
    if (res.success) { set({ loading: false }); return true; }
    set({ error: res.error || 'Clone failed', loading: false });
    return false;
  },

  createRepo: async (name, description, isPrivate) => {
    const { token } = get();
    if (!token || !window.electronAPI) return false;
    set({ loading: true, error: null });
    const res = await window.electronAPI.github.createRepo(token, name, description, isPrivate);
    if (res.repo) { set({ loading: false }); get().loadRepos(); return true; }
    set({ error: res.error || 'Create failed', loading: false });
    return false;
  },

  createPR: async (owner, repo, title, body, head, base) => {
    const { token } = get();
    if (!token || !window.electronAPI) return false;
    set({ loading: true, error: null });
    const res = await window.electronAPI.github.createPR(token, owner, repo, title, body, head, base);
    if (res.pr) { set({ loading: false }); return true; }
    set({ error: res.error || 'PR creation failed', loading: false });
    return false;
  },
}));
