import { create } from 'zustand';

interface GitFile {
  path: string;
  raw: string;
  staged: boolean;
  status: string;
}

interface GitCommit {
  hash: string;
  author: string;
  date: string;
  message: string;
}

interface GitStore {
  branch: string;
  files: GitFile[];
  stagedFiles: GitFile[];
  unstagedFiles: GitFile[];
  commits: GitCommit[];
  loading: boolean;
  error: string | null;

  refresh: (repoPath: string) => Promise<void>;
  stageFile: (repoPath: string, filePath: string) => Promise<void>;
  stageAll: (repoPath: string) => Promise<void>;
  unstageFile: (repoPath: string, filePath: string) => Promise<void>;
  commit: (repoPath: string, message: string) => Promise<boolean>;
}

export const useGitStore = create<GitStore>()((set, get) => ({
  branch: '',
  files: [],
  stagedFiles: [],
  unstagedFiles: [],
  commits: [],
  loading: false,
  error: null,

  refresh: async (repoPath: string) => {
    if (!repoPath || !window.electronAPI) return;
    set({ loading: true, error: null });
    try {
      const [statusRes, branchRes, logRes] = await Promise.all([
        window.electronAPI.git.status(repoPath),
        window.electronAPI.git.branch(repoPath),
        window.electronAPI.git.log(repoPath, 15),
      ]);

      const files = statusRes.files || [];
      set({
        files,
        stagedFiles: files.filter((f) => f.staged),
        unstagedFiles: files.filter((f) => !f.staged),
        branch: branchRes.branch || '',
        commits: logRes.commits || [],
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  stageFile: async (repoPath, filePath) => {
    if (!window.electronAPI) return;
    const res = await window.electronAPI.git.add(repoPath, [filePath]);
    if (res.success) get().refresh(repoPath);
    else set({ error: res.error || null });
  },

  stageAll: async (repoPath) => {
    if (!window.electronAPI) return;
    const unstaged = get().unstagedFiles;
    if (unstaged.length === 0) return;
    const res = await window.electronAPI.git.add(repoPath, unstaged.map((f) => f.path));
    if (res.success) get().refresh(repoPath);
    else set({ error: res.error || null });
  },

  unstageFile: async (repoPath, filePath) => {
    if (!window.electronAPI) return;
    const res = await window.electronAPI.git.unstage(repoPath, [filePath]);
    if (res.success) get().refresh(repoPath);
    else set({ error: res.error || null });
  },

  commit: async (repoPath, message) => {
    if (!window.electronAPI || !message.trim()) return false;
    const res = await window.electronAPI.git.commit(repoPath, message);
    if (res.success) {
      get().refresh(repoPath);
      return true;
    }
    set({ error: res.error || null });
    return false;
  },
}));
