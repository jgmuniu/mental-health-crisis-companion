import React, { useState, useEffect } from 'react';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useFacilitySearch } from '../../hooks/useFacilitySearch';
import { FacilityCard } from './FacilityCard';
import { CRISIS_RESOURCES } from '../../constants/crisisResources';
import { COLORS } from '../../constants/colors';
import { formatDistance } from '../../utils/distance';

export function CrisisMap({ onClose, riskLevel = 2 }) {
  const { location, isLoading: locationLoading, error: locationError } = useGeolocation();
  const { facilities, isLoading: facilitiesLoading, searchNearbyFacilities } = useFacilitySearch();
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [mapUrl, setMapUrl] = useState('');

  useEffect(() => {
    if (location) {
      searchNearbyFacilities(location.lat, location.lon);

      const url = `https://www.openstreetmap.org/export/embed.html?bbox=${
        location.lon - 0.05
      },${
        location.lat - 0.05
      },${
        location.lon + 0.05
      },${
        location.lat + 0.05
      }&layer=mapnik&marker=${location.lat},${location.lon}`;

      setMapUrl(url);
    }
  }, [location]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 300,
      background: 'rgba(5, 8, 18, 0.98)',
      backdropFilter: 'blur(14px)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Georgia', 'Times New Roman', serif",
      animation: 'fadeIn 0.3s ease'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 24px',
        background: riskLevel === 3 ? COLORS.risk.high + '30' : COLORS.risk.elevated + '30',
        borderBottom: `1px solid ${riskLevel === 3 ? COLORS.risk.high : COLORS.risk.elevated}60`,
        display: 'flex',
        alignItems: 'center',
        gap: 16
      }}>
        <span style={{ fontSize: 28 }}>🏥</span>

        <div style={{ flex: 1 }}>
          <h2 style={{
            fontSize: 18,
            color: COLORS.text.primary,
            margin: '0 0 4px',
            fontWeight: 400
          }}>
            {riskLevel === 3 ? '🚨 Emergency - ' : ''}Mental Health Facilities Near You
          </h2>
          <p style={{
            fontSize: 12,
            color: COLORS.text.muted,
            margin: 0
          }}>
            Using your location to find nearby support services
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <a
            href="tel:988"
            style={{
              padding: '8px 16px',
              borderRadius: 20,
              fontSize: 12,
              background: COLORS.risk.high + '40',
              color: COLORS.text.primary,
              border: `1px solid ${COLORS.risk.high}80`,
              textDecoration: 'none',
              fontWeight: 600
            }}
          >
            📞 Call 988 Now
          </a>
          <button
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: `1px solid ${COLORS.border.medium}`,
              background: 'transparent',
              color: COLORS.text.muted,
              cursor: 'pointer',
              fontSize: 16
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Crisis Resources Strip */}
      <div style={{
        padding: '10px 24px',
        background: 'rgba(0, 0, 0, 0.3)',
        borderBottom: `1px solid ${COLORS.border.light}`,
        display: 'flex',
        gap: 16,
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: 12, color: COLORS.text.secondary }}>
          Immediate Crisis Lines:
        </span>
        {CRISIS_RESOURCES.slice(0, 3).map(resource => (
          <a
            key={resource.name}
            href={resource.type === 'call' ? `tel:${resource.contact}` : `sms:741741?body=HOME`}
            style={{
              fontSize: 11,
              color: COLORS.text.primary,
              textDecoration: 'none',
              padding: '4px 12px',
              borderRadius: 16,
              background: 'rgba(170, 200, 220, 0.1)',
              border: `1px solid ${COLORS.border.light}`
            }}
          >
            {resource.name}: {resource.contact}
          </a>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Facility List */}
        <div style={{
          width: 350,
          flexShrink: 0,
          overflowY: 'auto',
          padding: '16px',
          borderRight: `1px solid ${COLORS.border.light}`
        }}>
          {locationLoading && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: COLORS.text.muted }}>
              <div style={{ fontSize: 30, marginBottom: 10 }}>📍</div>
              <div>Getting your location...</div>
            </div>
          )}

          {facilitiesLoading && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: COLORS.text.muted }}>
              <div style={{ fontSize: 30, marginBottom: 10 }}>🔍</div>
              <div>Searching for nearby facilities...</div>
            </div>
          )}

          {locationError && (
            <div style={{
              padding: '16px',
              background: COLORS.risk.high + '20',
              border: `1px solid ${COLORS.risk.high}40`,
              borderRadius: 12,
              marginBottom: 16
            }}>
              <p style={{ fontSize: 13, color: COLORS.risk.high, marginBottom: 12 }}>
                ⚠ Could not access your location. Please use these resources:
              </p>
              <a
                href="https://findtreatment.gov"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block', padding: '10px', borderRadius: 8,
                  background: COLORS.accent.primary + '20',
                  color: COLORS.text.primary, textDecoration: 'none',
                  textAlign: 'center', marginBottom: 8
                }}
              >
                SAMHSA Treatment Locator
              </a>
              <a
                href="tel:988"
                style={{
                  display: 'block', padding: '10px', borderRadius: 8,
                  background: COLORS.risk.high + '20',
                  color: COLORS.risk.high, textDecoration: 'none', textAlign: 'center'
                }}
              >
                Call 988 Suicide & Crisis Lifeline
              </a>
            </div>
          )}

          {facilities.map(facility => (
            <FacilityCard
              key={facility.id}
              facility={facility}
              isSelected={selectedFacility?.id === facility.id}
              onSelect={() => setSelectedFacility(facility)}
              userLocation={location}
            />
          ))}

          {/* Static Resources */}
          <div style={{
            marginTop: 16, padding: '16px',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: 12, border: `1px solid ${COLORS.border.light}`
          }}>
            <h3 style={{ fontSize: 13, color: COLORS.text.primary, margin: '0 0 12px', fontWeight: 400 }}>
              National Resources
            </h3>
            {CRISIS_RESOURCES.map(resource => (
              <div key={resource.name} style={{ padding: '8px 0', borderBottom: `1px solid ${COLORS.border.light}` }}>
                <div style={{ fontSize: 12, color: COLORS.text.primary }}>
                  {resource.name}
                  {resource.free && (
                    <span style={{ marginLeft: 6, fontSize: 10, color: '#7ACCA0', padding: '1px 4px', borderRadius: 4, background: '#7ACCA020' }}>
                      FREE
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: COLORS.text.muted }}>{resource.description}</div>
                <a
                  href={resource.type === 'call' ? `tel:${resource.contact}` : `sms:741741?body=HOME`}
                  style={{ fontSize: 11, color: COLORS.accent.primary, textDecoration: 'none' }}
                >
                  {resource.contact}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Map */}
        <div style={{ flex: 1, position: 'relative', background: '#0A1520' }}>
          {mapUrl ? (
            <iframe
              src={mapUrl}
              title="Nearby mental health facilities"
              style={{
                width: '100%', height: '100%', border: 'none',
                filter: 'invert(0.9) hue-rotate(180deg) brightness(0.85) saturate(0.8)'
              }}
              allowFullScreen
            />
          ) : (
            <div style={{
              width: '100%', height: '100%', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: COLORS.text.muted
            }}>
              {locationLoading ? 'Locating you...' : 'Loading map...'}
            </div>
          )}

          {selectedFacility && (
            <div style={{
              position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(10, 20, 30, 0.95)', backdropFilter: 'blur(10px)',
              borderRadius: 16, padding: '16px 20px',
              border: `1px solid ${COLORS.border.medium}`, width: 320,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
            }}>
              <h4 style={{ fontSize: 14, color: COLORS.text.primary, margin: '0 0 8px' }}>
                {selectedFacility.name}
              </h4>
              <p style={{ fontSize: 11, color: COLORS.text.muted, margin: '0 0 8px' }}>
                {formatDistance(selectedFacility.distance)} from your location
              </p>
              {selectedFacility.phone && (
                <a
                  href={`tel:${selectedFacility.phone}`}
                  style={{ display: 'inline-block', fontSize: 11, color: COLORS.accent.primary, textDecoration: 'none', marginBottom: 12 }}
                >
                  📞 {selectedFacility.phone}
                </a>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&origin=${location?.lat},${location?.lon}&destination=${selectedFacility.lat},${selectedFacility.lon}`, '_blank')}
                  style={{
                    flex: 1, padding: '8px', borderRadius: 8, fontSize: 11, cursor: 'pointer',
                    background: COLORS.accent.primary + '20', color: COLORS.text.primary,
                    border: `1px solid ${COLORS.border.medium}`
                  }}
                >
                  🗺️ Directions
                </button>
                <button
                  onClick={() => window.open(`https://www.openstreetmap.org/?mlat=${selectedFacility.lat}&mlon=${selectedFacility.lon}#map=15/${selectedFacility.lat}/${selectedFacility.lon}`, '_blank')}
                  style={{
                    flex: 1, padding: '8px', borderRadius: 8, fontSize: 11, cursor: 'pointer',
                    background: 'transparent', color: COLORS.text.secondary,
                    border: `1px solid ${COLORS.border.light}`
                  }}
                >
                  OpenStreetMap
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CrisisMap; // ✅ Fixed: added default export — App.jsx imports this as default