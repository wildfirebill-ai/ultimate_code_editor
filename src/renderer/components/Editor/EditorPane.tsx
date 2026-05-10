import React, { useRef, useCallback, useEffect, useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { Code2, FileCode, FolderOpen, Plus, Loader2 } from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useAIStore } from '../../stores/aiStore';

function WelcomeScreen() {
  const openFile = useEditorStore((s) => s.openFile);
  const setWorkspace = useEditorStore((s) => s.setWorkspace);
  const defaultPath = useSettingsStore((s) => s.defaultWorkspacePath);

  const handleOpenFile = useCallback(async () => {
    const api = window.electronAPI;
    if (!api) return;
    const result = await api.fileSystem.openFileDialog();
    if (result && !result.canceled && result.filePaths.length > 0) {
      const filePath = result.filePaths[0];
      const data = await api.fileSystem.readFile(filePath);
      if (data.content !== undefined) {
        openFile(filePath, data.content);
      }
    }
  }, [openFile]);

  const handleOpenFolder = useCallback(async () => {
    const api = window.electronAPI;
    if (!api) return;
    const result = await api.fileSystem.openFolderDialog(defaultPath || undefined);
    if (result && !result.canceled && result.filePaths.length > 0) {
      const folderPath = result.filePaths[0];
      const data = await api.fileSystem.readDirectory(folderPath);
      if (data.files) {
        setWorkspace(folderPath, data.files);
      }
    }
  }, [setWorkspace, defaultPath]);

  const handleNewFile = useCallback(() => {
    openFile(`untitled-${Date.now()}`, '');
  }, [openFile]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        backgroundColor: '#1e1e1e',
        color: '#cccccc',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        userSelect: 'none',
      }}
    >
      <Code2 size={64} strokeWidth={1} color="#569cd6" style={{ marginBottom: 24 }} />
      <h1
        style={{
          fontSize: 28,
          fontWeight: 300,
          margin: 0,
          marginBottom: 8,
          color: '#e0e0e0',
        }}
      >
        Ultimate Editor
      </h1>
      <p style={{ fontSize: 14, color: '#888888', margin: 0, marginBottom: 32 }}>
        Combining the best of VS Code, Cursor, and Zed
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={handleOpenFile}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 18px',
            backgroundColor: '#0e639c',
            color: '#ffffff',
            border: 'none',
            borderRadius: 4,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          <FileCode size={16} />
          Open File
        </button>
        <button
          onClick={handleOpenFolder}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 18px',
            backgroundColor: '#2d2d2d',
            color: '#cccccc',
            border: '1px solid #444444',
            borderRadius: 4,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          <FolderOpen size={16} />
          Open Folder
        </button>
        <button
          onClick={handleNewFile}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 18px',
            backgroundColor: '#2d2d2d',
            color: '#cccccc',
            border: '1px solid #444444',
            borderRadius: 4,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          <Plus size={16} />
          New File
        </button>
      </div>
    </div>
  );
}

function InlineCompletionOverlay({
  editor,
  text,
  fontSize,
}: {
  editor: NonNullable<Parameters<OnMount>[0]>;
  text: string;
  fontSize: number;
}) {
  const [style, setStyle] = useState<React.CSSProperties>({ display: 'none' });

  useEffect(() => {
    const update = () => {
      const pos = editor.getPosition();
      if (!pos) {
        setStyle({ display: 'none' });
        return;
      }
      const coords = editor.getScrolledVisiblePosition(pos);
      if (!coords) {
        setStyle({ display: 'none' });
        return;
      }
      setStyle({
        position: 'absolute',
        top: coords.top,
        left: coords.left,
        color: '#888888',
        opacity: 0.6,
        pointerEvents: 'none',
        fontFamily: 'Consolas, "Courier New", monospace',
        fontSize,
        whiteSpace: 'pre',
        zIndex: 10,
      });
    };
    update();
    const d1 = editor.onDidChangeCursorPosition(update);
    const d2 = editor.onDidScrollChange(update);
    return () => {
      d1.dispose();
      d2.dispose();
    };
  }, [editor, text, fontSize]);

  return <div style={style}>{text}</div>;
}

export default function EditorPane() {
  const tabs = useEditorStore((s) => s.tabs);
  const activeTabId = useEditorStore((s) => s.activeTabId);
  const updateTabContent = useEditorStore((s) => s.updateTabContent);
  const fontSize = useEditorStore((s) => s.fontSize);
  const tabSize = useEditorStore((s) => s.tabSize);
  const wordWrap = useEditorStore((s) => s.wordWrap);
  const showMinimap = useEditorStore((s) => s.showMinimap);
  const showBreadcrumbs = useEditorStore((s) => s.showBreadcrumbs);
  const inlineCompletion = useAIStore((s) => s.inlineCompletion);
  const setInlineCompletion = useAIStore((s) => s.setInlineCompletion);

  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  const handleEditorDidMount: OnMount = useCallback((editor) => {
    editorRef.current = editor;

    editor.addAction({
      id: 'save-file',
      label: 'Save File',
      keybindings: [2048 | 49],
      run: () => {
        window.electronAPI?.send?.('save-file');
      },
    });
  }, []);

  const handleChange = useCallback(
    (value: string | undefined) => {
      if (activeTabId && value !== undefined) {
        updateTabContent(activeTabId, value);
      }
    },
    [activeTabId, updateTabContent],
  );

  const LoadingComponent = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        backgroundColor: '#1e1e1e',
        color: '#888888',
      }}
    >
      <Loader2 size={24} />
    </div>
  );

  // Sync store content to editor model when switching tabs (in case it changed externally)
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || !activeTab) return;
    const model = editor.getModel();
    if (model && model.getValue() !== activeTab.content) {
      model.setValue(activeTab.content);
    }
  }, [activeTab?.id, activeTab?.content]);

  if (!activeTab) {
    return <WelcomeScreen />;
  }

  return (
    <div className="editor-container" style={{ height: '100%', position: 'relative' }}>
      <Editor
        path={activeTab.path}
        theme="vs-dark"
        language={activeTab.language}
        value={activeTab.content}
        loading={LoadingComponent}
        onChange={handleChange}
        onMount={handleEditorDidMount}
        options={{
          fontSize,
          tabSize,
          wordWrap: wordWrap ? 'on' : 'off',
          minimap: { enabled: showMinimap },
          automaticLayout: true,
          scrollBeyondLastLine: false,
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          folding: true,
          renderLineHighlight: 'all',
          cursorBlinking: 'smooth',
          smoothScrolling: true,
          padding: { top: 8 },
          bracketPairColorization: { enabled: true },
          guides: { bracketPairs: true, indentation: true },
          selectionHighlight: true,
          occurrencesHighlight: true,
          renderWhitespace: 'selection',
        }}
      />
      {inlineCompletion && editorRef.current && (
        <InlineCompletionOverlay editor={editorRef.current} text={inlineCompletion} fontSize={fontSize} />
      )}
    </div>
  );
}
