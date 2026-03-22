import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const BG = '#0D1B2A';
const CARD = 'rgba(255,255,255,0.06)';
const BORDER = '1px solid rgba(255,255,255,0.12)';
const ACCENT = '#4A8FA8';
const STORAGE_KEY = 'safeguide_journal';

const MOODS = [
  { value: 5, emoji: '😄', label: 'Great',      color: '#7ACCA0' },
  { value: 4, emoji: '😊', label: 'Good',       color: '#A5C8D8' },
  { value: 3, emoji: '😐', label: 'Okay',       color: '#D4A017' },
  { value: 2, emoji: '😔', label: 'Low',        color: '#E07A55' },
  { value: 1, emoji: '😢', label: 'Struggling', color: '#E05555' },
];

const TAGS = ['Anxiety', 'Gratitude', 'Grief', 'Anger', 'Hope', 'Loneliness', 'Progress', 'Relationships', 'Work', 'Health', 'Sleep', 'Family'];

const PROMPTS = [
  "What's on your mind right now? There's no right or wrong answer.",
  "What's one thing that happened today — good or bad — that you want to remember?",
  "What are you feeling in your body right now? Where do you feel it?",
  "What would you tell a close friend who was feeling the way you feel today?",
  "What's one small thing you're grateful for, even if today was hard?",
  "What do you wish someone understood about how you're feeling?",
  "What has been draining your energy lately? What has been giving you energy?",
  "What do you need most right now — and how could you give that to yourself?",
  "If today had a colour, what would it be, and why?",
  "What's one thing you're proud of yourself for, no matter how small?",
  "What fears have been showing up for you lately?",
  "What would make tomorrow slightly better than today?",
];

// ── Storage helpers ───────────────────────────────────────────────────────
const loadEntries = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
};
const saveEntries = (entries) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));

const genId = () => `j_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

// ── Format helpers ────────────────────────────────────────────────────────
const fmtDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};
const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

// ── Word count ────────────────────────────────────────────────────────────
const wordCount = (text) => text.trim().split(/\s+/).filter(Boolean).length;

// ── Entry card ────────────────────────────────────────────────────────────
const EntryCard = ({ entry, onClick, onDelete }) => {
  const mood = MOODS.find(m => m.value === entry.mood);
  const preview = entry.body.length > 160 ? entry.body.slice(0, 160) + '…' : entry.body;

  return (
    <div onClick={onClick} style={{
      background: CARD, borderRadius: 14, border: BORDER,
      padding: '16px 18px', cursor: 'pointer', transition: 'all 0.15s',
      marginBottom: 12, position: 'relative'
    }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(74,143,168,0.1)'; e.currentTarget.style.borderColor = `${ACCENT}50`; }}
      onMouseLeave={e => { e.currentTarget.style.background = CARD; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        {mood && <span style={{ fontSize: 20 }}>{mood.emoji}</span>}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 13, color: '#E8EDF5', fontWeight: 500 }}>
            {entry.title || fmtDate(entry.createdAt)}
          </p>
          <p style={{ margin: 0, fontSize: 11, color: '#4A6A8A' }}>
            {fmtDate(entry.createdAt)} · {fmtTime(entry.createdAt)} · {wordCount(entry.body)} words
          </p>
        </div>
        <button onClick={e => { e.stopPropagation(); onDelete(entry.id); }} style={{
          background: 'transparent', border: 'none', color: '#4A6A8A',
          cursor: 'pointer', fontSize: 14, padding: '2px 6px', borderRadius: 4,
          transition: 'color 0.15s'
        }}
          onMouseEnter={e => e.currentTarget.style.color = '#E05555'}
          onMouseLeave={e => e.currentTarget.style.color = '#4A6A8A'}
        >🗑</button>
      </div>

      {/* Body preview */}
      <p style={{ margin: '0 0 10px', fontSize: 13, color: '#7A9BB5', lineHeight: 1.6 }}>
        {preview || <em style={{ color: '#4A6A8A' }}>No content</em>}
      </p>

      {/* Tags */}
      {entry.tags?.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {entry.tags.map(tag => (
            <span key={tag} style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 10,
              background: `${ACCENT}20`, color: '#A5C8D8',
              border: `1px solid ${ACCENT}30`
            }}>{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Editor ────────────────────────────────────────────────────────────────
const Editor = ({ entry, onSave, onBack }) => {
  const [title, setTitle] = useState(entry?.title || '');
  const [body, setBody] = useState(entry?.body || '');
  const [mood, setMood] = useState(entry?.mood || null);
  const [tags, setTags] = useState(entry?.tags || []);
  const [saved, setSaved] = useState(false);
  const [prompt, setPrompt] = useState(() => PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
  const [showPrompt, setShowPrompt] = useState(!entry?.body);
  const textareaRef = useRef(null);
  const autoSaveRef = useRef(null);

  // Auto-focus
  useEffect(() => {
    setTimeout(() => textareaRef.current?.focus(), 100);
  }, []);

  // Auto-save debounced
  useEffect(() => {
    clearTimeout(autoSaveRef.current);
    if (!body.trim() && !title.trim()) return;
    autoSaveRef.current = setTimeout(() => {
      onSave({ title, body, mood, tags }, false);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }, 1200);
    return () => clearTimeout(autoSaveRef.current);
  }, [title, body, mood, tags]);

  const toggleTag = (tag) =>
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  const newPrompt = () => {
    setPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
    setShowPrompt(true);
  };

  const usePrompt = () => {
    setBody(prev => prev ? prev + '\n\n' + prompt : prompt + '\n\n');
    setShowPrompt(false);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const wc = wordCount(body);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: BG, color: '#E8EDF5' }}>
      {/* Toolbar */}
      <div style={{
        padding: '14px 20px', borderBottom: BORDER,
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'rgba(255,255,255,0.03)', flexShrink: 0
      }}>
        <button onClick={() => { onSave({ title, body, mood, tags }, true); onBack(); }} style={{
          background: 'transparent', border: 'none', color: '#7A9BB5', fontSize: 14, cursor: 'pointer'
        }}>← Back</button>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: saved ? '#7ACCA0' : '#4A6A8A' }}>
          {saved ? '✓ Saved' : `${wc} word${wc !== 1 ? 's' : ''}`}
        </span>
        <button onClick={() => { onSave({ title, body, mood, tags }, true); onBack(); }} style={{
          padding: '7px 18px', background: ACCENT, border: 'none',
          borderRadius: 8, color: '#fff', fontSize: 13, cursor: 'pointer', fontWeight: 500
        }}>Save & Close</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 40px', maxWidth: 700, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>

        {/* Writing prompt */}
        {showPrompt && (
          <div style={{
            background: `${ACCENT}12`, border: `1px solid ${ACCENT}30`,
            borderRadius: 12, padding: '14px 16px', marginBottom: 20
          }}>
            <p style={{ fontSize: 12, color: '#4A6A8A', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Writing Prompt</p>
            <p style={{ fontSize: 14, color: '#A5C8D8', margin: '0 0 12px', lineHeight: 1.6, fontStyle: 'italic' }}>
              "{prompt}"
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={usePrompt} style={{
                padding: '6px 14px', background: ACCENT, border: 'none',
                borderRadius: 8, color: '#fff', fontSize: 12, cursor: 'pointer'
              }}>Use this prompt</button>
              <button onClick={newPrompt} style={{
                padding: '6px 14px', background: CARD, border: BORDER,
                borderRadius: 8, color: '#7A9BB5', fontSize: 12, cursor: 'pointer'
              }}>Try another</button>
              <button onClick={() => setShowPrompt(false)} style={{
                padding: '6px 12px', background: 'transparent', border: 'none',
                color: '#4A6A8A', fontSize: 12, cursor: 'pointer'
              }}>Dismiss</button>
            </div>
          </div>
        )}

        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Title (optional)"
          style={{
            width: '100%', background: 'transparent', border: 'none',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            color: '#E8EDF5', fontSize: 20, fontWeight: 600,
            padding: '0 0 12px', marginBottom: 20, outline: 'none',
            boxSizing: 'border-box'
          }}
        />

        {/* Mood picker */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#4A6A8A', marginRight: 4 }}>Mood:</span>
          {MOODS.map(m => (
            <button key={m.value} onClick={() => setMood(mood === m.value ? null : m.value)}
              title={m.label} style={{
                fontSize: 22, background: 'transparent', border: 'none', cursor: 'pointer',
                opacity: mood === null || mood === m.value ? 1 : 0.3,
                transform: mood === m.value ? 'scale(1.3)' : 'scale(1)',
                transition: 'all 0.15s', padding: '2px'
              }}>{m.emoji}</button>
          ))}
          {!showPrompt && (
            <button onClick={newPrompt} style={{
              marginLeft: 'auto', padding: '5px 12px', background: CARD, border: BORDER,
              borderRadius: 8, color: '#7A9BB5', fontSize: 11, cursor: 'pointer'
            }}>💡 Prompt</button>
          )}
        </div>

        {/* Body */}
        <textarea
          ref={textareaRef}
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Start writing… this is your private space. No AI will read or respond to this."
          style={{
            width: '100%', minHeight: 320, background: 'transparent',
            border: 'none', color: '#E8EDF5', fontSize: 15,
            lineHeight: 1.85, resize: 'none', outline: 'none',
            fontFamily: "'Georgia', serif", boxSizing: 'border-box'
          }}
        />

        {/* Tags */}
        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ fontSize: 11, color: '#4A6A8A', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tags</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {TAGS.map(tag => (
              <button key={tag} onClick={() => toggleTag(tag)} style={{
                padding: '4px 12px', borderRadius: 16, fontSize: 12, cursor: 'pointer',
                border: tags.includes(tag) ? `1px solid ${ACCENT}` : '1px solid rgba(255,255,255,0.1)',
                background: tags.includes(tag) ? `${ACCENT}25` : 'rgba(255,255,255,0.04)',
                color: tags.includes(tag) ? '#A5C8D8' : '#7A9BB5', transition: 'all 0.15s'
              }}>{tag}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Journal page ─────────────────────────────────────────────────────
const Journal = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState(loadEntries);
  const [view, setView] = useState('list'); // 'list' | 'editor'
  const [editingEntry, setEditingEntry] = useState(null);
  const [search, setSearch] = useState('');
  const [filterMood, setFilterMood] = useState(null);
  const [filterTag, setFilterTag] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [sortDesc, setSortDesc] = useState(true);

  const saveEntry = useCallback((fields, final = true) => {
    setEntries(prev => {
      let updated;
      if (editingEntry?.id) {
        updated = prev.map(e => e.id === editingEntry.id
          ? { ...e, ...fields, updatedAt: new Date().toISOString() }
          : e
        );
      } else {
        const newEntry = {
          id: genId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...fields
        };
        setEditingEntry(newEntry);
        updated = [newEntry, ...prev];
      }
      saveEntries(updated);
      return updated;
    });
  }, [editingEntry]);

  const deleteEntry = (id) => {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    saveEntries(updated);
    setDeleteConfirm(null);
    if (editingEntry?.id === id) { setView('list'); setEditingEntry(null); }
  };

  const openNew = () => {
    setEditingEntry(null);
    setView('editor');
  };

  const openEntry = (entry) => {
    setEditingEntry(entry);
    setView('editor');
  };

  const backToList = () => {
    setView('list');
    setEditingEntry(null);
  };

  // Stats
  const totalWords = entries.reduce((s, e) => s + wordCount(e.body), 0);
  const streak = (() => {
    if (!entries.length) return 0;
    const days = new Set(entries.map(e => new Date(e.createdAt).toDateString()));
    let count = 0, d = new Date();
    while (days.has(d.toDateString())) { count++; d.setDate(d.getDate() - 1); }
    return count;
  })();

  // Filtered + sorted entries
  const filtered = entries
    .filter(e => {
      if (filterMood && e.mood !== filterMood) return false;
      if (filterTag && !e.tags?.includes(filterTag)) return false;
      if (search) {
        const q = search.toLowerCase();
        return e.title?.toLowerCase().includes(q) || e.body?.toLowerCase().includes(q) || e.tags?.some(t => t.toLowerCase().includes(q));
      }
      return true;
    })
    .sort((a, b) => sortDesc
      ? new Date(b.createdAt) - new Date(a.createdAt)
      : new Date(a.createdAt) - new Date(b.createdAt)
    );

  if (view === 'editor') return (
    <Editor
      entry={editingEntry}
      onSave={saveEntry}
      onBack={backToList}
    />
  );

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#E8EDF5' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '100px 24px 48px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <button onClick={() => navigate('/chat')} style={{
              background: 'transparent', border: 'none', color: '#7A9BB5',
              fontSize: 14, cursor: 'pointer', marginBottom: 12, display: 'block'
            }}>← Back to Chat</button>
            <h1 style={{
              fontSize: 28, margin: '0 0 4px',
              background: 'linear-gradient(135deg, #E8EDF5, #A5C8D8)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>My Journal</h1>
            <p style={{ fontSize: 13, color: '#7A9BB5', margin: 0 }}>
              Private writing space — no AI reads or responds here
            </p>
          </div>
          <button onClick={openNew} style={{
            padding: '11px 22px', background: ACCENT, border: 'none',
            borderRadius: 10, color: '#fff', fontSize: 14, cursor: 'pointer',
            fontWeight: 500, flexShrink: 0, marginTop: 32
          }}>✏️ New Entry</button>
        </div>

        {/* Stats */}
        {entries.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Entries', value: entries.length, icon: '📓' },
              { label: 'Words Written', value: totalWords.toLocaleString(), icon: '✍️' },
              { label: 'Day Streak', value: `${streak} day${streak !== 1 ? 's' : ''}`, icon: '🔥' },
            ].map(s => (
              <div key={s.label} style={{ background: CARD, borderRadius: 12, border: BORDER, padding: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                <p style={{ fontSize: 18, fontWeight: 600, color: '#E8EDF5', margin: '0 0 2px' }}>{s.value}</p>
                <p style={{ fontSize: 11, color: '#7A9BB5', margin: 0 }}>{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Search & filters */}
        {entries.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search entries…"
              style={{
                width: '100%', padding: '10px 16px', borderRadius: 10, marginBottom: 12,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#E8EDF5', fontSize: 14, outline: 'none', boxSizing: 'border-box'
              }}
            />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#4A6A8A' }}>Filter:</span>
              {MOODS.map(m => (
                <button key={m.value} onClick={() => setFilterMood(filterMood === m.value ? null : m.value)}
                  title={m.label} style={{
                    fontSize: 18, background: 'transparent', border: 'none', cursor: 'pointer',
                    opacity: filterMood === null || filterMood === m.value ? 1 : 0.3,
                    padding: '2px 4px'
                  }}>{m.emoji}</button>
              ))}
              <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
              {TAGS.slice(0, 6).map(tag => (
                <button key={tag} onClick={() => setFilterTag(filterTag === tag ? null : tag)} style={{
                  padding: '3px 10px', borderRadius: 12, fontSize: 11, cursor: 'pointer',
                  border: filterTag === tag ? `1px solid ${ACCENT}` : '1px solid rgba(255,255,255,0.1)',
                  background: filterTag === tag ? `${ACCENT}25` : 'rgba(255,255,255,0.04)',
                  color: filterTag === tag ? '#A5C8D8' : '#7A9BB5'
                }}>{tag}</button>
              ))}
              <button onClick={() => setSortDesc(v => !v)} style={{
                marginLeft: 'auto', padding: '4px 10px', background: CARD, border: BORDER,
                borderRadius: 8, color: '#7A9BB5', fontSize: 11, cursor: 'pointer'
              }}>{sortDesc ? '↓ Newest' : '↑ Oldest'}</button>
            </div>
          </div>
        )}

        {/* Entry list */}
        {entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📓</div>
            <h3 style={{ fontSize: 18, color: '#E8EDF5', margin: '0 0 8px', fontWeight: 400 }}>
              Your journal is empty
            </h3>
            <p style={{ fontSize: 14, color: '#7A9BB5', margin: '0 0 24px', lineHeight: 1.6 }}>
              Writing regularly — even just a few sentences — can reduce stress,
              improve clarity, and help you process difficult emotions.
            </p>
            <button onClick={openNew} style={{
              padding: '12px 28px', background: ACCENT, border: 'none',
              borderRadius: 10, color: '#fff', fontSize: 14, cursor: 'pointer'
            }}>Write your first entry</button>
          </div>
        ) : filtered.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#4A6A8A', fontSize: 14, padding: '40px 0' }}>
            No entries match your search or filters.
          </p>
        ) : (
          filtered.map(entry => (
            <div key={entry.id}>
              {deleteConfirm === entry.id ? (
                <div style={{
                  padding: '14px 18px', background: 'rgba(220,80,80,0.08)',
                  border: '1px solid rgba(220,80,80,0.25)', borderRadius: 14, marginBottom: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12
                }}>
                  <span style={{ fontSize: 13, color: '#E8EDF5' }}>Delete this entry?</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => deleteEntry(entry.id)} style={{
                      padding: '6px 14px', background: '#E05555', border: 'none',
                      borderRadius: 6, color: '#fff', fontSize: 12, cursor: 'pointer'
                    }}>Delete</button>
                    <button onClick={() => setDeleteConfirm(null)} style={{
                      padding: '6px 14px', background: CARD, border: BORDER,
                      borderRadius: 6, color: '#E8EDF5', fontSize: 12, cursor: 'pointer'
                    }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <EntryCard
                  entry={entry}
                  onClick={() => openEntry(entry)}
                  onDelete={(id) => setDeleteConfirm(id)}
                />
              )}
            </div>
          ))
        )}

        {/* Privacy note */}
        <div style={{
          marginTop: 24, padding: '14px 18px', background: CARD,
          borderRadius: 12, border: BORDER, fontSize: 12, color: '#4A6A8A', lineHeight: 1.6
        }}>
          🔒 <strong style={{ color: '#7A9BB5' }}>Your journal is 100% private.</strong> Entries are stored
          only on this device and are never sent to any server or read by the AI.
        </div>
      </div>
    </div>
  );
};

export default Journal;