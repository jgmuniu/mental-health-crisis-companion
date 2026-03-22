import React from 'react';
import { COLORS } from '../../constants/colors';
import { formatDistance } from '../../utils/distance';

export function FacilityCard({ facility, isSelected, onSelect, userLocation }) {
  return (
    <div
      onClick={onSelect}
      style={{
        padding: '14px 16px',
        borderRadius: 12,
        marginBottom: 10,
        cursor: 'pointer',
        background: isSelected
          ? COLORS.accent.primary + '20'
          : 'rgba(255, 255, 255, 0.02)',
        border: `1px solid ${
          isSelected ? COLORS.border.medium : COLORS.border.light
        }`,
        transition: 'all 0.2s'
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 8,
        marginBottom: 6
      }}>
        <h4 style={{
          fontSize: 13,
          color: COLORS.text.primary,
          margin: 0,
          fontWeight: isSelected ? 600 : 400
        }}>
          {facility.name}
        </h4>
        <span style={{
          fontSize: 11,
          color: '#7ACCA0',
          padding: '2px 6px',
          borderRadius: 6,
          background: '#7ACCA020',
          flexShrink: 0
        }}>
          {formatDistance(facility.distance)}
        </span>
      </div>

      {facility.address && facility.address !== 'Address not available' && (
        <p style={{
          fontSize: 11,
          color: COLORS.text.muted,
          margin: '0 0 6px',
          lineHeight: 1.4
        }}>
          {facility.address}
        </p>
      )}

      {facility.phone && (
        <a
          href={`tel:${facility.phone}`}
          onClick={e => e.stopPropagation()}
          style={{
            fontSize: 11,
            color: COLORS.accent.primary,
            textDecoration: 'none',
            display: 'inline-block',
            marginBottom: 8
          }}
        >
          📞 {facility.phone}
        </a>
      )}

      {facility.emergency && (
        <div style={{
          fontSize: 10,
          color: COLORS.risk.high,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          marginBottom: 8
        }}>
          <span style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: COLORS.risk.high,
            display: 'inline-block'
          }} />
          Emergency services available
        </div>
      )}

      <div style={{ display: 'flex', gap: 6 }}>
        <button
          onClick={e => {
            e.stopPropagation();
            window.open(
              `https://www.google.com/maps/dir/?api=1&origin=${userLocation?.lat},${userLocation?.lon}&destination=${facility.lat},${facility.lon}`,
              '_blank'
            );
          }}
          style={{
            flex: 1,
            padding: '6px',
            borderRadius: 6,
            fontSize: 10,
            cursor: 'pointer',
            background: COLORS.accent.primary + '15',
            color: COLORS.text.secondary,
            border: `1px solid ${COLORS.border.light}`,
            transition: 'all 0.2s'
          }}
        >
          🗺️ Directions
        </button>
        <button
          onClick={e => {
            e.stopPropagation();
            window.open(
              `https://www.openstreetmap.org/?mlat=${facility.lat}&mlon=${facility.lon}#map=15/${facility.lat}/${facility.lon}`,
              '_blank'
            );
          }}
          style={{
            flex: 1,
            padding: '6px',
            borderRadius: 6,
            fontSize: 10,
            cursor: 'pointer',
            background: 'transparent',
            color: COLORS.text.muted,
            border: `1px solid ${COLORS.border.light}`,
            transition: 'all 0.2s'
          }}
        >
          OpenStreetMap
        </button>
      </div>
    </div>
  );
}