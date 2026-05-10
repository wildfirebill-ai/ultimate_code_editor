import React, { useState, useMemo } from 'react';
import { BarChart3, Trash2, Cpu, Brain, Hash, Clock } from 'lucide-react';
import { useAIStore, TokenUsageEntry } from '../../stores/aiStore';

interface TimeRange {
  key: string;
  label: string;
  slots: number;
  duration: number;
  format: (ts: number, index: number) => string;
}

const ranges: TimeRange[] = [
  { key: 'hourly', label: 'Hourly', slots: 24, duration: 3600000,
    format: (_, i) => `${24 - 1 - i}h ago` },
  { key: 'daily', label: 'Daily', slots: 30, duration: 86400000,
    format: (ts) => { const d = new Date(ts); return `${d.getMonth() + 1}/${d.getDate()}`; } },
  { key: 'weekly', label: 'Weekly', slots: 12, duration: 604800000,
    format: (ts) => `W${Math.ceil((new Date(ts).getTime() - new Date(new Date(ts).getFullYear(), 0, 1).getTime()) / 604800000)}` },
  { key: 'monthly', label: 'Monthly', slots: 12, duration: 2592000000,
    format: (ts) => { const d = new Date(ts); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; } },
  { key: 'yearly', label: 'Yearly', slots: 5, duration: 31536000000,
    format: (ts) => `${new Date(ts).getFullYear()}` },
];

function aggregateByRange(entries: TokenUsageEntry[], range: TimeRange) {
  const now = Date.now();
  const slotSize = range.duration;
  const totalSpan = slotSize * range.slots;
  const cutoff = now - totalSpan;

  const filtered = entries.filter((e) => e.timestamp >= cutoff);
  if (filtered.length === 0) return [];

  const maxTotal = Math.max(...filtered.map((e) => e.totalTokens), 1);
  const modelSet = new Set(filtered.map((e) => e.model));

  return Array.from(modelSet).map((model) => {
    const modelEntries = filtered.filter((e) => e.model === model);
    const slots = Array.from({ length: range.slots }, (_, i) => {
      const slotStart = now - (range.slots - i) * slotSize;
      const slotEnd = slotStart + slotSize;
      const inSlot = modelEntries.filter((e) => e.timestamp >= slotStart && e.timestamp < slotEnd);
      return {
        label: range.format(slotStart, i),
        promptTokens: inSlot.reduce((s, e) => s + e.promptTokens, 0),
        responseTokens: inSlot.reduce((s, e) => s + e.responseTokens, 0),
        totalTokens: inSlot.reduce((s, e) => s + e.totalTokens, 0),
        count: inSlot.length,
      };
    });
    const total = slots.reduce((s, sl) => s + sl.totalTokens, 0);
    return { model, slots, total, maxTotal };
  });
}

const TokenUsage: React.FC = () => {
  const tokenUsage = useAIStore((s) => s.tokenUsage);
  const clearTokenUsage = useAIStore((s) => s.clearTokenUsage);
  const [rangeKey, setRangeKey] = useState('daily');

  const range = ranges.find((r) => r.key === rangeKey) || ranges[1];
  const modelData = useMemo(() => aggregateByRange(tokenUsage, range), [tokenUsage, rangeKey]);

  const grandTotal = modelData.reduce((s, m) => s + m.total, 0);
  const allSlotsMax = Math.max(...modelData.flatMap((m) => m.slots.map((s) => s.totalTokens)), 1);

  return (
    <div style={{ padding: '12px 16px', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <BarChart3 size={20} style={{ color: 'var(--accent)' }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Token Usage</div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{tokenUsage.length} records · {grandTotal.toLocaleString()} total tokens</div>
        </div>
        {tokenUsage.length > 0 && (
          <button
            onClick={clearTokenUsage}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 4, borderRadius: 4 }}
            title="Clear usage data"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 12, flexWrap: 'wrap' }}>
        {ranges.map((r) => (
          <button
            key={r.key}
            onClick={() => setRangeKey(r.key)}
            style={{
              padding: '4px 10px', fontSize: 11, borderRadius: 4, cursor: 'pointer',
              background: rangeKey === r.key ? 'var(--accent)' : 'var(--hover-bg)',
              color: rangeKey === r.key ? '#fff' : 'var(--text-dim)',
              border: 'none', fontWeight: rangeKey === r.key ? 600 : 400,
            }}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {modelData.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-dim)', gap: 8, padding: 20 }}>
            <BarChart3 size={32} />
            <div style={{ fontSize: 13 }}>No usage data</div>
            <div style={{ fontSize: 11 }}>Send a message to Ollama to see token usage.</div>
          </div>
        ) : (
          modelData.map((md) => (
            <div key={md.model} style={{ background: 'var(--hover-bg)', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Cpu size={14} style={{ color: 'var(--accent)' }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{md.model}</span>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                  <Hash size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 2 }} />
                  {md.total.toLocaleString()} tokens
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 48, padding: '2px 0' }}>
                {md.slots.map((slot, i) => {
                  const heightPct = allSlotsMax > 0 ? (slot.totalTokens / allSlotsMax) * 100 : 0;
                  return (
                    <div
                      key={i}
                      title={`${slot.label}: ${slot.totalTokens} tokens (${slot.promptTokens} prompt + ${slot.responseTokens} response, ${slot.count} requests)`}
                      style={{
                        flex: 1, display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'flex-end',
                        height: '100%', minWidth: 4, position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          width: '100%', minHeight: heightPct > 0 ? Math.max(heightPct * 0.48, 2) : 0,
                          background: slot.totalTokens > 0
                            ? 'linear-gradient(to top, var(--accent), var(--purple))'
                            : 'transparent',
                          borderRadius: '2px 2px 0 0',
                          transition: 'height 0.2s',
                          opacity: slot.count > 0 ? 1 : 0.15,
                        }}
                      />
                      {range.slots <= 30 && (
                        <div style={{
                          fontSize: 7, color: 'var(--text-dim)', marginTop: 1,
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          width: '100%', textAlign: 'center',
                        }}>
                          {slot.label}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: 'var(--text-dim)' }}>
                <span>Prompt: {md.slots.reduce((s, sl) => s + sl.promptTokens, 0).toLocaleString()}</span>
                <span>Response: {md.slots.reduce((s, sl) => s + sl.responseTokens, 0).toLocaleString()}</span>
                <span>Requests: {md.slots.reduce((s, sl) => s + sl.count, 0)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TokenUsage;
