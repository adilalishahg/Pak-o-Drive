'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTrendingIntelligence } from '@/hooks/useTrendingIntelligence';
import { TrendingAdIntelligence } from '@/lib/intelligenceEngine';

export default function TrendingIntelligencePage() {
  const {
    report,
    isLoading,
    isRefreshing,
    isSendingWhatsApp,
    whatsappStatusMsg,
    selectedPlatform,
    setSelectedPlatform,
    filterType,
    setFilterType,
    selectedItem,
    setSelectedItem,
    fetchIntelligence,
    sendToWhatsApp,
    downloadCSV,
    downloadCreativeBrief,
    filteredTrends,
  } = useTrendingIntelligence();

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyScript = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>🔥</span>
            <h1 className="leading-normal py-0.5 font-bold" style={{ fontSize: '24px', color: '#0f172a', margin: 0 }}>
              Viral Ad & Trends Intelligence Lab
            </h1>
            <span
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '12px',
              }}
            >
              AI Live Suite
            </span>
          </div>
          <p className="leading-normal text-slate-500" style={{ fontSize: '13.5px', marginTop: '4px', margin: 0 }}>
            Real-time competitor ads analysis, TikTok/Meta hooks, scene-by-scene video shooting blueprints, and daily WhatsApp dispatch.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          {/* Refresh AI Analysis */}
          <button
            onClick={() => fetchIntelligence(true)}
            disabled={isRefreshing || isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              padding: '8px 14px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#334155',
              cursor: isRefreshing ? 'default' : 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <span style={{ display: 'inline-block', animation: isRefreshing ? 'spin 1s infinite linear' : 'none' }}>
              🔄
            </span>
            {isRefreshing ? 'Analyzing...' : 'Refresh AI Analysis'}
          </button>

          {/* Download CSV (Excel) */}
          <button
            onClick={downloadCSV}
            disabled={isLoading || !report}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              padding: '8px 14px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#047857',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <span>📥</span> Download Excel (CSV)
          </button>

          {/* Download Creative Brief */}
          <button
            onClick={downloadCreativeBrief}
            disabled={isLoading || !report}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              padding: '8px 14px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#4338ca',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <span>📄</span> Download Creative Brief (MD)
          </button>

          {/* Send to WhatsApp Now */}
          <button
            onClick={sendToWhatsApp}
            disabled={isSendingWhatsApp || isLoading || !report}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 700,
              color: '#ffffff',
              cursor: isSendingWhatsApp ? 'default' : 'pointer',
              boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
              transition: 'all 0.15s ease',
            }}
          >
            <span>📲</span> {isSendingWhatsApp ? 'Sending...' : 'Send to My WhatsApp'}
          </button>
        </div>
      </div>

      {/* WhatsApp Status Toast Alert */}
      {whatsappStatusMsg && (
        <div
          style={{
            background: whatsappStatusMsg.startsWith('✅') ? '#ecfdf5' : '#fffbeb',
            border: `1px solid ${whatsappStatusMsg.startsWith('✅') ? '#10b981' : '#f59e0b'}`,
            color: whatsappStatusMsg.startsWith('✅') ? '#065f46' : '#92400e',
            padding: '12px 18px',
            borderRadius: '12px',
            fontSize: '13.5px',
            fontWeight: 600,
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          }}
        >
          <span>{whatsappStatusMsg}</span>
          <span style={{ fontSize: '11px', opacity: 0.8 }}>⚡ Auto-daily dispatch is also active (10:00 AM PKT)</span>
        </div>
      )}

      {/* Market Insight Banner */}
      {report?.marketSummary && (
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff',
            padding: '18px 22px',
            borderRadius: '16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
            boxShadow: '0 8px 24px rgba(15,23,42,0.15)',
          }}
        >
          <span style={{ fontSize: '24px' }}>💡</span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <h4 className="leading-normal font-bold" style={{ fontSize: '14px', color: '#38bdf8', margin: 0 }}>
                Pakistani Market Viral Ad Insight & Algorithm Pulse
              </h4>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                • Updated {new Date(report.generatedAt).toLocaleDateString('en-GB')}
              </span>
            </div>
            <p className="leading-normal" style={{ fontSize: '13.5px', color: '#e2e8f0', margin: 0 }}>
              {report.marketSummary}
            </p>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '20px',
          background: '#ffffff',
          padding: '12px 16px',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Platform Tabs */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {(['All', 'TikTok', 'Meta', 'Instagram'] as const).map((plat) => (
            <button
              key={plat}
              onClick={() => setSelectedPlatform(plat)}
              style={{
                background: selectedPlatform === plat ? '#0f172a' : '#f1f5f9',
                color: selectedPlatform === plat ? '#ffffff' : '#475569',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {plat === 'All' ? '🌐 All Platforms' : plat === 'TikTok' ? '🎵 TikTok Viral' : plat === 'Meta' ? '📘 Meta / FB Ads' : '📸 Instagram Reels'}
            </button>
          ))}
        </div>

        {/* Scope Tabs */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { id: 'all', label: 'All Items' },
            { id: 'existing', label: '📦 Store Products' },
            { id: 'recommended', label: '✨ High-Demand Recommendations' },
          ].map((scope) => (
            <button
              key={scope.id}
              onClick={() => setFilterType(scope.id as any)}
              style={{
                background: filterType === scope.id ? '#10b981' : 'transparent',
                color: filterType === scope.id ? '#ffffff' : '#64748b',
                border: filterType === scope.id ? 'none' : '1px solid #cbd5e1',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {scope.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px' }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #e2e8f0',
                height: '320px',
                animation: 'pulse 1.5s infinite ease-in-out',
              }}
            />
          ))}
        </div>
      )}

      {/* Trends Grid */}
      {!isLoading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '22px' }}>
          {filteredTrends.map((trend) => (
            <div
              key={trend.id}
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              {/* Card Header: Badges */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        background: trend.isExistingInStore ? '#ecfdf5' : '#eff6ff',
                        color: trend.isExistingInStore ? '#059669' : '#2563eb',
                        border: `1px solid ${trend.isExistingInStore ? '#a7f3d0' : '#bfdbfe'}`,
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '8px',
                      }}
                    >
                      {trend.isExistingInStore ? '📦 IN YOUR STORE' : '✨ NEW OPPORTUNITY'}
                    </span>
                    <span
                      style={{
                        background: '#f1f5f9',
                        color: '#475569',
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: '8px',
                      }}
                    >
                      {trend.platform}
                    </span>
                  </div>

                  {/* Demand Score */}
                  <span
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '3px 9px',
                      borderRadius: '12px',
                      boxShadow: '0 2px 6px rgba(239,68,68,0.25)',
                    }}
                  >
                    🔥 {trend.estimatedDemandScore}% Demand
                  </span>
                </div>

                {/* Product Title */}
                <h3 className="leading-normal py-0.5 font-bold" style={{ fontSize: '17px', color: '#0f172a', margin: '0 0 4px 0' }}>
                  {trend.productName}
                </h3>
                <p className="leading-normal" style={{ fontSize: '12.5px', color: '#64748b', margin: '0 0 16px 0' }}>
                  Category: <strong style={{ color: '#334155' }}>{trend.category}</strong>
                </p>

                {/* Economics Matrix */}
                <div
                  style={{
                    background: '#f8fafc',
                    borderRadius: '14px',
                    padding: '12px 14px',
                    border: '1px solid #e2e8f0',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '8px',
                    marginBottom: '16px',
                    textAlign: 'center',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '10.5px', color: '#64748b', display: 'block' }}>Sourcing Cost</span>
                    <strong style={{ fontSize: '13px', color: '#334155' }}>Rs. {trend.estimatedSourcingCostPKR?.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '10.5px', color: '#64748b', display: 'block' }}>Suggested Price</span>
                    <strong style={{ fontSize: '13px', color: '#0f172a' }}>Rs. {trend.suggestedRetailPricePKR?.toLocaleString()}</strong>
                  </div>
                  <div style={{ background: '#ecfdf5', borderRadius: '8px', padding: '4px' }}>
                    <span style={{ fontSize: '10.5px', color: '#059669', display: 'block', fontWeight: 700 }}>Est. Profit</span>
                    <strong style={{ fontSize: '13px', color: '#047857' }}>+Rs. {trend.estimatedProfitMarginPKR?.toLocaleString()}</strong>
                  </div>
                </div>

                {/* Viral 0-3s Hook Preview Box */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                    border: '1px solid #fde68a',
                    borderRadius: '14px',
                    padding: '14px',
                    marginBottom: '16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#b45309', textTransform: 'uppercase' }}>
                      🎯 0-3s Viral Hook ({trend.viralHook?.hookStyle})
                    </span>
                    <span style={{ fontSize: '10.5px', color: '#92400e', background: 'rgba(255,255,255,0.7)', padding: '1px 6px', borderRadius: '6px' }}>
                      On-Screen Text
                    </span>
                  </div>
                  <p className="leading-normal font-bold" style={{ fontSize: '13px', color: '#78350f', margin: '0 0 6px 0' }}>
                    "{trend.viralHook?.textOnScreen}"
                  </p>
                  <p className="leading-normal" style={{ fontSize: '12px', color: '#92400e', margin: 0, fontStyle: 'italic' }}>
                    🎙️ Spoken: "{trend.viralHook?.verbalHookUrdu}"
                  </p>
                </div>

                {/* Competitor Strategy Angle */}
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '3px' }}>
                    🧠 Competitor Winning Strategy Angle:
                  </span>
                  <p className="leading-normal" style={{ fontSize: '12.5px', color: '#334155', margin: 0 }}>
                    {trend.competitorAdAngle}
                  </p>
                </div>

                {/* Target Keywords Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '18px' }}>
                  {(trend.adTargetingKeywords || []).slice(0, 4).map((k, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: '#f1f5f9',
                        color: '#475569',
                        fontSize: '10.5px',
                        padding: '2px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      #{k}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer: Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <button
                  onClick={() => setSelectedItem(trend)}
                  style={{
                    flex: 1,
                    background: '#0f172a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'background 0.15s ease',
                  }}
                >
                  <span>🎬</span> View Video Shot List & Script
                </button>

                <button
                  onClick={() => handleCopyScript(trend.voiceoverScriptUrdu, trend.id)}
                  title="Copy Full Roman Urdu Voiceover Script"
                  style={{
                    background: copiedId === trend.id ? '#ecfdf5' : '#f8fafc',
                    color: copiedId === trend.id ? '#059669' : '#475569',
                    border: `1px solid ${copiedId === trend.id ? '#10b981' : '#cbd5e1'}`,
                    borderRadius: '10px',
                    padding: '10px 14px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {copiedId === trend.id ? '✓ Copied' : '📋 Copy Script'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Production Guide & Shot List Modal */}
      {selectedItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setSelectedItem(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              padding: '28px',
              position: 'relative',
              animation: 'modalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '20px' }}>🎬</span>
                  <h2 className="leading-normal font-bold" style={{ fontSize: '20px', color: '#0f172a', margin: 0 }}>
                    {selectedItem.productName}
                  </h2>
                </div>
                <p className="leading-normal" style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                  Concept: <strong>{selectedItem.videoProductionGuide?.conceptOverview}</strong>
                </p>
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ✕
              </button>
            </div>

            {/* Smartphone Camera Setup Guide */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '14px 18px',
                marginBottom: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '16px' }}>📱</span>
                <strong style={{ fontSize: '13px', color: '#0f172a' }}>Camera & Lighting Setup:</strong>
                <span style={{ fontSize: '13px', color: '#475569' }}>{selectedItem.videoProductionGuide?.cameraSetup}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '16px' }}>💡</span>
                <strong style={{ fontSize: '13px', color: '#0f172a' }}>Shooting Tips (Car / Studio):</strong>
                <span style={{ fontSize: '13px', color: '#059669' }}>{selectedItem.videoProductionGuide?.shootingTipsUrdu}</span>
              </div>
            </div>

            {/* Scene-by-Scene Shot List Table */}
            <h4 className="leading-normal font-bold" style={{ fontSize: '15px', color: '#0f172a', marginBottom: '12px' }}>
              🎥 Scene-by-Scene Shot List (0:00 - 0:30s Viral Video)
            </h4>
            <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ background: '#0f172a', color: '#ffffff', textAlign: 'left' }}>
                    <th style={{ padding: '10px 12px', borderRadius: '8px 0 0 0' }}>Timing</th>
                    <th style={{ padding: '10px 12px' }}>Camera Angle</th>
                    <th style={{ padding: '10px 12px' }}>Visual Action</th>
                    <th style={{ padding: '10px 12px', borderRadius: '0 8px 0 0' }}>Voiceover (Urdu)</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedItem.videoProductionGuide?.sceneBreakdown || []).map((scene, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0284c7', whiteSpace: 'nowrap' }}>
                        {scene.timeSeconds}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#475569', fontWeight: 600 }}>{scene.cameraAngle}</td>
                      <td style={{ padding: '10px 12px', color: '#1e293b' }}>{scene.visualShot}</td>
                      <td style={{ padding: '10px 12px', color: '#059669', fontStyle: 'italic' }}>"{scene.audioVoiceover}"</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Complete Voiceover Script Card */}
            <div style={{ background: '#f1f5f9', borderRadius: '16px', padding: '18px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <h4 className="leading-normal font-bold" style={{ fontSize: '14px', color: '#0f172a', margin: 0 }}>
                  🎙️ Complete Voiceover Script (Roman Urdu)
                </h4>
                <button
                  onClick={() => handleCopyScript(selectedItem.voiceoverScriptUrdu, 'modal_script')}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '4px 10px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: '#059669',
                  }}
                >
                  {copiedId === 'modal_script' ? '✓ Copied' : '📋 Copy Voiceover'}
                </button>
              </div>
              <p className="leading-normal" style={{ fontSize: '13.5px', color: '#334155', margin: 0, lineHeight: 1.6 }}>
                "{selectedItem.voiceoverScriptUrdu}"
              </p>
            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setSelectedItem(null)}
                style={{
                  background: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 20px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Close Blueprint
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global CSS animations */}
      <style>{`
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
