import React, { useState } from 'react';
import { COLORS } from '../../constants/colors';

const MOODS = [
  { emoji: '😊', label: 'Happy',       category: 'positive', message: 'feeling happy and positive today' },
  { emoji: '🙏', label: 'Grateful',    category: 'positive', message: 'feeling grateful and appreciative' },
  { emoji: '🎉', label: 'Excited',     category: 'positive', message: 'feeling excited and energized' },
  { emoji: '😌', label: 'Calm',        category: 'positive', message: 'feeling calm and peaceful' },
  { emoji: '😐', label: 'Okay',        category: 'neutral',  message: 'feeling okay, nothing special' },
  { emoji: '🤔', label: 'Thoughtful',  category: 'neutral',  message: 'feeling thoughtful and reflective' },
  { emoji: '😶', label: 'Neutral',     category: 'neutral',  message: 'feeling neutral right now' },
  { emoji: '😔', label: 'Sad',         category: 'negative', message: 'feeling sad and down' },
  { emoji: '😰', label: 'Anxious',     category: 'negative', message: 'feeling anxious and worried' },
  { emoji: '😤', label: 'Frustrated',  category: 'negative', message: 'feeling frustrated and stuck' },
  { emoji: '😴', label: 'Tired',       category: 'negative', message: 'feeling exhausted and drained' },
  { emoji: '😡', label: 'Angry',       category: 'negative', message: 'feeling angry and upset' },
  { emoji: '😨', label: 'Scared',      category: 'negative', message: 'feeling scared and fearful' },
  { emoji: '🫂', label: 'Lonely',      category: 'negative', message: 'feeling lonely and isolated' },
  { emoji: '😫', label: 'Overwhelmed', category: 'negative', message: 'feeling overwhelmed by everything' },
];

export const MoodSelector = ({
  onMoodSelect,
  onClose,
  variant = 'inline',
  showCategories = true,
  autoClose = true,
  title = "How are you feeling right now?",
  subtitle = "Select a mood to help me understand better"
}) => {
  const [open, setOpen] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hoveredMood, setHoveredMood] = useState(null);

  const filteredMoods = selectedCategory === 'all'
    ? MOODS
    : MOODS.filter(m => m.category === selectedCategory);

  const handleMoodClick = (mood) => {
    onMoodSelect(mood.message);
    if (autoClose && onClose) onClose();
  };

  const toggle = () => setOpen(prev => !prev);

  return (
    <div style={{
      padding: '0 18px',
      borderBottom: open ? `1px solid rgba(255,255,255,0.08)` : 'none',
      background: 'rgba(255,255,255,0.02)',
      flexShrink: 0
    }}>
      {/* Collapse toggle bar */}
      <button
        onClick={toggle}
        style={{
          width: '100%', background: 'transparent', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 0', cursor: 'pointer', color: '#A5C8D8'
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 500 }}>
          {open ? title : '💭 How are you feeling? (tap to expand)'}
        </span>
        <span style={{
          fontSize: 12, color: '#4A6A8A',
          transform: open ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.25s'
        }}>▼</span>
      </button>

      {/* Collapsible body */}
      <div style={{
        overflow: 'hidden',
        maxHeight: open ? '400px' : '0',
        opacity: open ? 1 : 0,
        transition: 'max-height 0.3s ease, opacity 0.2s ease',
        paddingBottom: open ? 12 : 0
      }}>
        {subtitle && (
          <p style={{ margin: '0 0 10px', color: '#7A9BB5', fontSize: 12 }}>{subtitle}</p>
        )}

        {/* Category filter pills */}
        {showCategories && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
            {['all', 'positive', 'neutral', 'negative'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '3px 12px', borderRadius: 16, fontSize: 11,
                  textTransform: 'capitalize', cursor: 'pointer', transition: 'all 0.15s',
                  background: selectedCategory === cat ? 'rgba(74,143,168,0.3)' : 'rgba(255,255,255,0.05)',
                  color: selectedCategory === cat ? '#E8EDF5' : '#7A9BB5',
                  border: selectedCategory === cat ? '1px solid #4A8FA8' : '1px solid rgba(255,255,255,0.1)'
                }}
              >{cat}</button>
            ))}
          </div>
        )}

        {/* Mood grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 8
        }}>
          {filteredMoods.map(mood => (
            <button
              key={mood.label}
              onClick={() => handleMoodClick(mood)}
              onMouseEnter={() => setHoveredMood(mood.label)}
              onMouseLeave={() => setHoveredMood(null)}
              title={mood.label}
              style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 5, padding: '10px 6px', borderRadius: 12,
                cursor: 'pointer', transition: 'all 0.15s',
                background: hoveredMood === mood.label
                  ? 'rgba(74,143,168,0.2)'
                  : 'rgba(255,255,255,0.04)',
                border: hoveredMood === mood.label
                  ? '1px solid rgba(74,143,168,0.6)'
                  : '1px solid rgba(255,255,255,0.08)',
                transform: hoveredMood === mood.label ? 'translateY(-2px)' : 'none',
              }}
            >
              <span style={{ fontSize: 22 }}>{mood.emoji}</span>
              <span style={{ fontSize: 10, color: '#7A9BB5' }}>{mood.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export const QuickMoodSelector = ({ onMoodSelect }) => {
  const quick = MOODS.filter(m => ['Happy', 'Sad', 'Anxious', 'Okay'].includes(m.label));
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', padding: '8px 12px' }}>
      {quick.map(mood => (
        <button key={mood.label} onClick={() => onMoodSelect(mood.message)} style={{
          padding: '8px 16px', borderRadius: 30,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#E8EDF5', fontSize: 14, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8
        }}>
          <span>{mood.emoji}</span>
          <span>{mood.label}</span>
        </button>
      ))}
    </div>
  );
};

MoodSelector.defaultProps = {
  variant: 'inline',
  showCategories: true,
  autoClose: true,
  title: "How are you feeling right now?",
  subtitle: "Select a mood to help me understand better"
};

export default MoodSelector;