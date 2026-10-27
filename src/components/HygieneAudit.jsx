import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Upload,
  Camera,
  RefreshCw,
  Flame,
  ClipboardList,
  Video,
  Star
} from 'lucide-react';
import { auditHygiene } from '../api';

const INDIAN_FACILITIES = [
  {
    id: 'street_food',
    name: 'Sharma Sweets & Chaat Corner (Street Stall)',
    type: 'Street Food Stall',
    location: 'Chandni Chowk, Delhi',
    sampleVideoLabel: 'Street Chaat Counter & Pani Puri Station',
    thumbnail: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'dhaba',
    name: 'Sher-e-Punjab Highway Dhaba (Tandoor & Gravy Station)',
    type: 'Highway Dhaba',
    location: 'NH 44, Murthal',
    sampleVideoLabel: 'Kadai Frying & Tandoor Roti Counter',
    thumbnail: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'canteen',
    name: 'Annapurna Mithai & College Canteen',
    type: 'Canteen & Sweet Shop',
    location: 'FC Road, Pune',
    sampleVideoLabel: 'Sweet Display Counter & Dishwashing Line',
    thumbnail: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'restaurant',
    name: 'Grand Spice Commercial Cloud Kitchen',
    type: 'Urban Commercial Kitchen',
    location: 'Indiranagar, Bengaluru',
    sampleVideoLabel: 'Stainless Prep Table & Cookline',
    thumbnail: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'
  }
];

function GradeIcon({ grade }) {
  const isA = grade?.includes('A');
  const isB = grade?.includes('B');
  const letter = grade ? grade.charAt(0) : 'B';
  const color = isA ? '#15803d' : isB ? '#92400e' : '#9f1239';
  const bg = isA ? 'rgba(34,197,94,0.12)' : isB ? 'rgba(245,158,11,0.14)' : 'rgba(244,63,94,0.12)';
  const border = isA ? 'rgba(34,197,94,0.35)' : isB ? 'rgba(245,158,11,0.40)' : 'rgba(244,63,94,0.35)';
  return (
    <div style={{
      width: '64px', height: '64px', borderRadius: '18px',
      background: bg, border: `2px solid ${border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '2rem', fontWeight: 900, color,
      boxShadow: `0 4px 16px ${bg}`,
      flexShrink: 0
    }}>
      {letter}
    </div>
  );
}

export default function HygieneAudit() {
  const [selectedFacility, setSelectedFacility] = useState(INDIAN_FACILITIES[0]);
  const [loading, setLoading] = useState(false);
  const [audit, setAudit] = useState(null);
  const [error, setError] = useState(null);
  const [resolvedActions, setResolvedActions] = useState({});
  const [activeTimestamp, setActiveTimestamp] = useState('00:14');
  const [uploadedMedia, setUploadedMedia] = useState(null);
  const [mediaType, setMediaType] = useState('image');
  const videoRef = useRef(null);

  const runAudit = async (facility, file) => {
    setLoading(true);
    setError(null);
    try {
      const data = await auditHygiene(facility.id, facility.name, file || null);
      if (data && (data.fssai_grade || data.overall_cleanliness_score)) {
        setAudit(data);
      } else {
        throw new Error('Empty audit response');
      }
    } catch (e) {
      console.error('Audit error:', e);
      setError('Analysis failed. Using demonstration data.');
      // Provide fallback data directly
      const isStreet = facility.id.includes('street') || facility.id.includes('chaat');
      setAudit({
        inspection_id: `FSSAI-AUDIT-${Math.floor(Math.random() * 90000) + 10000}`,
        facility_name: facility.name,
        facility_type: facility.type,
        audit_timestamp: new Date().toLocaleTimeString(),
        overall_cleanliness_score: isStreet ? 81.5 : 93.0,
        fssai_grade: isStreet ? 'B (Compliant with Advisory)' : 'A (Exemplary FSSAI Compliance)',
        observable_hygiene_matrix: {
          ready_to_eat_food_covered: !isStreet,
          potable_water_source_verified: true,
          gloves_and_hairnets_detected: !isStreet,
          clean_aprons_in_use: true,
          cross_contamination_separated: true,
          oil_tpc_safe_threshold: true
        },
        violations: isStreet ? [
          {
            severity: 'HIGH',
            category: 'Food Protection (FSSAI Schedule 4)',
            description: 'Ready-to-eat street food (sev and chopped coriander) observed uncovered without sneeze guards, exposed to ambient road dust.',
            timestamp: '00:14',
            fssai_rule: 'Clause 4.1.2 - Street food display units must be covered with food-grade protective covers.'
          },
          {
            severity: 'MEDIUM',
            category: 'Personal Hygiene',
            description: 'Food handler dispensing pani puri without food-grade nitrile gloves or dedicated stainless steel ladle.',
            timestamp: '00:42',
            fssai_rule: 'Clause 5.2 - Bare-hand contact with ready-to-eat food is strictly prohibited.'
          }
        ] : [],
        practical_recommendations: [
          'Install transparent acrylic sneeze shields over ready-to-eat condiment bowls and sev counters.',
          'Mandate food-grade disposable gloves or stainless ladles for pani puri water service.',
          'Discard frying oil when darkened or smoke point drops (keep TPC under 25%).',
          'Ensure washing of serving bowls only under running potable tap water, not stagnant buckets.'
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAudit(selectedFacility, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFacility]);

  const handleMediaUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVid = file.type.startsWith('video');
    setMediaType(isVid ? 'video' : 'image');
    const url = URL.createObjectURL(file);
    setUploadedMedia(url);
    runAudit(selectedFacility, file);
  };

  const toggleAction = (idx) => {
    setResolvedActions(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const jumpToTimestamp = (timestamp) => {
    setActiveTimestamp(timestamp);
    if (videoRef.current && mediaType === 'video') {
      const [m, s] = timestamp.split(':').map(Number);
      videoRef.current.currentTime = m * 60 + s;
      videoRef.current.play();
    }
  };

  const matrix = audit?.observable_hygiene_matrix || {
    ready_to_eat_food_covered: false,
    potable_water_source_verified: true,
    gloves_and_hairnets_detected: false,
    clean_aprons_in_use: true,
    cross_contamination_separated: true,
    oil_tpc_safe_threshold: true
  };

  const score = audit?.overall_cleanliness_score || 82;
  const grade = audit?.fssai_grade || 'B (Compliant with Advisory)';
  const isGradeA = grade.includes('A');
  const scoreColor = score >= 90 ? '#15803d' : score >= 80 ? '#92400e' : '#9f1239';
  const scoreBg = score >= 90 ? 'rgba(34,197,94,0.10)' : score >= 80 ? 'rgba(245,158,11,0.10)' : 'rgba(244,63,94,0.10)';

  return (
    <div className="section-page">
      {/* ── Banner ── */}
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span className="badge badge-saffron">🇮🇳 FSSAI Schedule 4 Standards</span>
            <span className="badge badge-amber">Street Food & Dhaba Safety</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', margin: 0, color: '#2d1a00' }}>
            Indian Restaurant & Street Food Hygiene Monitor
          </h2>
          <p style={{ color: '#7c5832', fontSize: '0.88rem', marginTop: '0.25rem' }}>
            Video and photo auditing for uncovered food, bare-hand contact, stagnant dishwashing water, and frying oil degradation.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            className="select-field"
            value={selectedFacility.id}
            onChange={(e) => {
              const fac = INDIAN_FACILITIES.find(f => f.id === e.target.value) || INDIAN_FACILITIES[0];
              setSelectedFacility(fac);
              setUploadedMedia(null);
            }}
            style={{ minWidth: '280px', width: 'auto' }}
          >
            {INDIAN_FACILITIES.map((st) => (
              <option key={st.id} value={st.id}>{st.name}</option>
            ))}
          </select>

          <button
            onClick={() => runAudit(selectedFacility, null)}
            disabled={loading}
            className="btn btn-primary"
            style={{ padding: '0.65rem 1.1rem', gap: '0.45rem' }}
          >
            <RefreshCw size={15} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
            <span>{loading ? 'Analyzing...' : 'Audit Kitchen'}</span>
          </button>
        </div>
      </div>

      {/* ── Legal Disclaimer ── */}
      <div style={{
        background: 'rgba(254, 243, 199, 0.65)',
        border: '1px solid rgba(245, 158, 11, 0.32)',
        borderRadius: 'var(--radius-md)',
        padding: '0.85rem 1.1rem',
        display: 'flex', alignItems: 'flex-start', gap: '0.75rem'
      }}>
        <Info size={19} color="#92400e" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.82rem', color: '#7c5832', lineHeight: 1.5 }}>
          <strong style={{ color: '#92400e' }}>Statutory Legal Disclaimer:</strong>{' '}
          This automated hygiene dashboard is an observational educational tool based on visible camera indicators.
          It <em>does not constitute an official statutory inspection</em> by the Food Safety and Standards Authority of India (FSSAI).
          Microbiological culture counts, chemical adulteration, and pesticide residues require formal laboratory sampling.
        </div>
      </div>

      {/* ── Error notice (non-blocking) ── */}
      {error && (
        <div style={{
          background: 'rgba(254, 215, 170, 0.5)',
          border: '1px solid rgba(249,115,22,0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '0.65rem 1rem',
          fontSize: '0.82rem', color: '#9a3412',
          display: 'flex', alignItems: 'center', gap: '0.5rem'
        }}>
          <AlertTriangle size={15} />
          <span>{error}</span>
        </div>
      )}

      {/* ── Overview Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.1rem' }}>
        {/* FSSAI Grade */}
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <GradeIcon grade={grade} />
          <div>
            <div style={{ fontSize: '0.73rem', color: '#7c5832', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>FSSAI Observational Grade</div>
            <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#2d1a00' }}>{grade}</div>
            <span style={{ fontSize: '0.7rem', color: '#a87c52' }}>ID: {audit?.inspection_id || 'FSSAI-AUDIT-92810'}</span>
          </div>
        </div>

        {/* Visual Cleanliness Score */}
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '18px',
            background: scoreBg,
            border: `2px solid ${scoreColor}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.35rem', fontWeight: 900, color: scoreColor,
            flexShrink: 0
          }}>
            {score}%
          </div>
          <div>
            <div style={{ fontSize: '0.73rem', color: '#7c5832', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>Visual Cleanliness</div>
            <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#2d1a00' }}>Prep Counter & Kadai</div>
            <span style={{ fontSize: '0.7rem', color: '#a87c52' }}>Stainless Surface Hygiene</span>
          </div>
        </div>

        {/* Oil TPC */}
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '18px',
            background: matrix.oil_tpc_safe_threshold !== false ? 'rgba(34,197,94,0.12)' : 'rgba(244,63,94,0.12)',
            border: `2px solid ${matrix.oil_tpc_safe_threshold !== false ? 'rgba(34,197,94,0.35)' : 'rgba(244,63,94,0.35)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
          }}>
            <Flame size={28} color={matrix.oil_tpc_safe_threshold !== false ? '#16a34a' : '#f43f5e'} />
          </div>
          <div>
            <div style={{ fontSize: '0.73rem', color: '#7c5832', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>Cooking Oil TPC Level</div>
            <div style={{ fontSize: '0.98rem', fontWeight: 800, color: matrix.oil_tpc_safe_threshold !== false ? '#15803d' : '#9f1239' }}>
              {matrix.oil_tpc_safe_threshold !== false ? 'TPC < 25% (Safe)' : 'TPC > 25% (Degraded)'}
            </div>
            <span style={{ fontSize: '0.7rem', color: '#a87c52' }}>FSSAI RUCO Regulation</span>
          </div>
        </div>
      </div>

      {/* ── Main Two-Column Panel ── */}
      <div className="responsive-grid-2">
        {/* Left: Video/Media Inspection */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', margin: 0, color: '#2d1a00', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Video size={18} color="#f97316" />
              <span>Food Prep Video & Camera Analysis</span>
            </h3>
            <span className="badge badge-saffron">{selectedFacility.type}</span>
          </div>

          {/* Image/Video frame */}
          <div style={{
            position: 'relative', width: '100%', height: '260px',
            borderRadius: 'var(--radius-md)', overflow: 'hidden',
            backgroundColor: '#fef3c7',
            border: '1.5px solid rgba(249,115,22,0.20)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {uploadedMedia && mediaType === 'video' ? (
              <video
                ref={videoRef}
                src={uploadedMedia}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                controls autoPlay loop
              />
            ) : (
              <img
                src={uploadedMedia || selectedFacility.thumbnail}
                alt="Kitchen inspection"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.target.src = selectedFacility.thumbnail; }}
              />
            )}

            {/* Scanning overlay */}
            {loading && <div className="scan-line" />}

            {/* AI Bounding Box */}
            {!loading && (
              <div style={{
                position: 'absolute', top: '22%', left: '18%',
                width: '160px', height: '110px',
                border: '2px dashed #f97316',
                borderRadius: '8px',
                backgroundColor: 'rgba(249, 115, 22, 0.12)',
                display: 'flex', flexDirection: 'column',
                justifyContent: 'space-between', padding: '6px',
                pointerEvents: 'none'
              }}>
                <span style={{
                  fontSize: '0.67rem', fontWeight: 800, color: '#ffffff',
                  background: '#ea580c', padding: '1px 6px',
                  borderRadius: '4px', width: 'fit-content'
                }}>
                  {activeTimestamp} • Concern Flagged
                </span>
                <span style={{
                  fontSize: '0.64rem', color: '#ffffff',
                  background: 'rgba(0,0,0,0.55)', padding: '2px 4px', borderRadius: '3px'
                }}>
                  FSSAI AI Bounding Box
                </span>
              </div>
            )}

            {/* Bottom Label */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              padding: '0.5rem 0.85rem',
              background: 'linear-gradient(transparent, rgba(255, 243, 199, 0.95))',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: '0.77rem', color: '#7c2d12', fontWeight: 700 }}>
                {selectedFacility.sampleVideoLabel}
              </span>
              <span className="badge badge-saffron" style={{ fontSize: '0.68rem' }}>
                Scrubber: {activeTimestamp}
              </span>
            </div>
          </div>

          {/* Upload Controls */}
          <div style={{ display: 'flex', gap: '0.55rem' }}>
            <label className="btn btn-secondary" style={{ flex: 1, cursor: 'pointer', margin: 0, fontSize: '0.84rem' }}>
              <Upload size={15} />
              <span>Upload Video / Photo</span>
              <input type="file" accept="video/*,image/*" onChange={handleMediaUpload} style={{ display: 'none' }} />
            </label>
            <button
              onClick={() => runAudit(selectedFacility, null)}
              disabled={loading}
              className="btn btn-primary"
              style={{ flex: 1, fontSize: '0.84rem' }}
            >
              <Camera size={15} />
              <span>{loading ? 'Auditing...' : 'Analyze Media'}</span>
            </button>
          </div>

          {/* 4-Checkpoint Matrix */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
            {[
              {
                ok: matrix.ready_to_eat_food_covered,
                label: 'Food Covered',
                pass: 'Sneeze Shields In Use',
                fail: 'Exposed to Dust / Flies'
              },
              {
                ok: matrix.gloves_and_hairnets_detected,
                label: 'Gloves & Utensils',
                pass: 'Food-grade Gloves On',
                fail: 'Bare-Hand Contact'
              },
              {
                ok: matrix.potable_water_source_verified,
                label: 'Water Source',
                pass: 'Running Tap / RO Unit',
                fail: 'Unverified Source'
              },
              {
                ok: matrix.oil_tpc_safe_threshold !== false,
                label: 'Kadai Oil Clarity',
                pass: 'Golden Clarity',
                fail: 'Dark Sediment (>25% TPC)'
              }
            ].map((item, i) => (
              <div key={i} style={{
                background: item.ok ? 'rgba(34,197,94,0.07)' : 'rgba(244,63,94,0.07)',
                border: `1px solid ${item.ok ? 'rgba(34,197,94,0.28)' : 'rgba(244,63,94,0.28)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '0.7rem 0.85rem',
                display: 'flex', alignItems: 'center', gap: '0.55rem'
              }}>
                {item.ok
                  ? <CheckCircle2 size={19} color="#16a34a" />
                  : <XCircle size={19} color="#f43f5e" />
                }
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2d1a00' }}>{item.label}</div>
                  <div style={{ fontSize: '0.70rem', color: item.ok ? '#15803d' : '#9f1239' }}>
                    {item.ok ? item.pass : item.fail}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Violations & Recommendations */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Violations Timeline */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <h4 style={{ fontSize: '0.88rem', color: '#7c5832', textTransform: 'uppercase', margin: 0, fontWeight: 700 }}>
                Observed Video Concerns & Timestamps
              </h4>
              <span style={{ fontSize: '0.72rem', color: '#a87c52' }}>Tap to scrub video</span>
            </div>

            {audit?.violations?.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                {audit.violations.map((v, i) => {
                  const isActive = activeTimestamp === v.timestamp;
                  const isCritical = v.severity === 'CRITICAL' || v.severity === 'HIGH';
                  return (
                    <div
                      key={i}
                      onClick={() => jumpToTimestamp(v.timestamp)}
                      style={{
                        background: isActive
                          ? (isCritical ? 'rgba(249,115,22,0.14)' : 'rgba(245,158,11,0.12)')
                          : (isCritical ? 'rgba(249,115,22,0.06)' : 'rgba(245,158,11,0.06)'),
                        border: `1px solid ${isActive
                          ? (isCritical ? '#f97316' : '#f59e0b')
                          : (isCritical ? 'rgba(249,115,22,0.28)' : 'rgba(245,158,11,0.25)')}`,
                        borderRadius: 'var(--radius-md)',
                        padding: '0.85rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <span className={isCritical ? 'badge badge-saffron' : 'badge badge-amber'} style={{ fontSize: '0.68rem' }}>
                          {v.severity} RISK
                        </span>
                        <span style={{
                          fontSize: '0.77rem', color: '#92400e', fontWeight: 800,
                          fontFamily: 'monospace',
                          background: 'rgba(245,158,11,0.15)',
                          padding: '2px 8px', borderRadius: '4px'
                        }}>
                          ⏱ {v.timestamp}
                        </span>
                      </div>
                      <p style={{ margin: '0 0 0.2rem', fontSize: '0.84rem', color: '#2d1a00', lineHeight: 1.45 }}>
                        {v.description}
                      </p>
                      {v.fssai_rule && (
                        <span style={{ fontSize: '0.70rem', color: '#7c5832', display: 'block' }}>
                          <strong>FSSAI Rule:</strong> {v.fssai_rule}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{
                background: 'rgba(34,197,94,0.07)',
                border: '1px solid rgba(34,197,94,0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
                fontSize: '0.84rem', color: '#15803d',
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}>
                <CheckCircle2 size={16} />
                <span>Zero observable hygiene non-conformances identified in this scan window. 🎉</span>
              </div>
            )}
          </div>

          {/* Practical FSSAI Recommendations */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <h4 style={{ fontSize: '0.88rem', color: '#7c5832', textTransform: 'uppercase', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ClipboardList size={16} color="#f97316" />
                <span>Practical FSSAI Corrective Directives</span>
              </h4>
              <span className="badge badge-amber" style={{ fontSize: '0.68rem' }}>Action Plan</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(audit?.practical_recommendations || [
                'Install transparent acrylic sneeze shields over ready-to-eat condiment bowls and sev counters.',
                'Mandate food-grade disposable gloves or stainless ladles for pani puri water service.',
                'Discard frying oil when darkened or smoke point drops (keep TPC under 25%).',
                'Ensure washing of serving bowls only under running potable tap water, avoiding stagnant bucket dipping.'
              ]).map((action, idx) => {
                const isResolved = resolvedActions[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleAction(idx)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: '0.7rem',
                      padding: '0.75rem 0.9rem',
                      borderRadius: 'var(--radius-md)',
                      background: isResolved ? 'rgba(34,197,94,0.09)' : 'rgba(255,248,238,0.7)',
                      border: `1px solid ${isResolved ? 'rgba(34,197,94,0.30)' : 'rgba(220,140,40,0.15)'}`,
                      cursor: 'pointer', transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ marginTop: '2px' }}>
                      {isResolved
                        ? <CheckCircle2 size={18} color="#16a34a" />
                        : <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid #d4a06a' }} />
                      }
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '0.85rem',
                        color: isResolved ? '#15803d' : '#2d1a00',
                        textDecoration: isResolved ? 'line-through' : 'none',
                        lineHeight: 1.4
                      }}>
                        {action}
                      </div>
                      <span style={{ fontSize: '0.70rem', color: '#a87c52' }}>
                        {isResolved ? '✓ Marked Implemented' : 'Tap to mark implemented'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Clean Street Food Standard Note */}
          <div style={{
            background: 'rgba(34,197,94,0.07)',
            border: '1px solid rgba(34,197,94,0.22)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            display: 'flex', alignItems: 'center', gap: '0.6rem'
          }}>
            <ShieldCheck size={20} color="#16a34a" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.80rem', color: '#7c5832', lineHeight: 1.4 }}>
              <strong style={{ color: '#15803d' }}>FSSAI Clean Street Food Hub Standard:</strong>{' '}
              Display FSDB boards, maintain potable water quality, and avoid mixing used frying oil with fresh oil.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
