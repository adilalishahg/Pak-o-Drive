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
    limit,
    updateLimit,
    isUpdatingLimit,
  } = useTrendingIntelligence();

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyScript = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="trends-lab-container">
      {/* Top Header */}
      <div className="trends-lab-header">
        <div>
          <div className="d-flex align-items-center flex-wrap gap-2">
            <span style={{ fontSize: '26px' }}>🔥</span>
            <h1 className="leading-normal py-0.5 font-bold trends-lab-title">
              Viral Ad & Trends Intelligence Lab
            </h1>
            <span className="trends-ai-badge">
              AI Live Suite
            </span>
          </div>
          <p className="leading-normal text-slate-500 mt-1" style={{ fontSize: '13px', margin: 0 }}>
            Real-time competitor ads analysis, TikTok/Meta hooks, video blueprints & daily WhatsApp dispatch.
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="trends-lab-actions">
          {/* Daily Products Limit Selector */}
          <div className="trends-limit-pill">
            <span style={{ fontSize: '13px' }}>📊</span>
            <span>Limit:</span>
            <select
              value={limit}
              onChange={(e) => updateLimit(parseInt(e.target.value, 10))}
              disabled={isUpdatingLimit || isLoading}
              className="trends-limit-select"
            >
              <option value="5">5 Trends</option>
              <option value="10">10 Trends (Default)</option>
              <option value="15">15 Trends</option>
              <option value="20">20 Trends</option>
              <option value="21">21 Trends</option>
              <option value="25">25 Trends</option>
              <option value="30">30 Trends</option>
              <option value="50">50 Trends</option>
            </select>
          </div>

          {/* Refresh AI Analysis */}
          <button
            onClick={() => fetchIntelligence(true)}
            disabled={isRefreshing || isLoading}
            className="trends-action-btn"
          >
            <span style={{ display: 'inline-block', animation: isRefreshing ? 'spin 1s infinite linear' : 'none' }}>
              🔄
            </span>
            <span>{isRefreshing ? 'Analyzing...' : 'Refresh AI'}</span>
          </button>

          {/* Download CSV (Excel) */}
          <button
            onClick={downloadCSV}
            disabled={isLoading || !report}
            className="trends-action-btn text-emerald-700"
          >
            <span>📥</span> <span>Excel CSV</span>
          </button>

          {/* Download Creative Brief */}
          <button
            onClick={downloadCreativeBrief}
            disabled={isLoading || !report}
            className="trends-action-btn text-indigo-700"
          >
            <span>📄</span> <span>Brief (MD)</span>
          </button>

          {/* Send to WhatsApp Now */}
          <button
            onClick={sendToWhatsApp}
            disabled={isSendingWhatsApp || isLoading || !report}
            className="trends-whatsapp-btn"
          >
            <span>📲</span> <span>{isSendingWhatsApp ? 'Sending...' : 'Send to WhatsApp'}</span>
          </button>
        </div>
      </div>

      {/* WhatsApp Status Toast Alert */}
      {whatsappStatusMsg && (
        <div
          className={`trends-alert ${whatsappStatusMsg.startsWith('✅') ? 'trends-alert-success' : 'trends-alert-warning'}`}
        >
          <span>{whatsappStatusMsg}</span>
          <span style={{ fontSize: '11px', opacity: 0.8 }}>⚡ Auto-daily dispatch is also active (10:00 AM PKT)</span>
        </div>
      )}

      {/* Market Insight Banner */}
      {report?.marketSummary && (
        <div className="trends-insight-banner">
          <span style={{ fontSize: '24px', flexShrink: 0 }}>💡</span>
          <div>
            <div className="d-flex align-items-center flex-wrap gap-2 mb-1">
              <h4 className="leading-normal font-bold text-sky-400 m-0" style={{ fontSize: '13.5px' }}>
                Pakistani Market Viral Ad Insight & Algorithm Pulse
              </h4>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                • Updated {new Date(report.generatedAt).toLocaleDateString('en-GB')}
              </span>
            </div>
            <p className="leading-normal text-slate-200 m-0" style={{ fontSize: '13px', lineHeight: 1.5 }}>
              {report.marketSummary}
            </p>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="trends-filters-bar">
        {/* Platform Tabs */}
        <div className="trends-filter-group">
          {(['All', 'TikTok', 'Meta', 'Instagram'] as const).map((plat) => (
            <button
              key={plat}
              onClick={() => setSelectedPlatform(plat)}
              className={`trends-filter-pill ${selectedPlatform === plat ? 'active' : ''}`}
            >
              {plat === 'All' ? '🌐 All Platforms' : plat === 'TikTok' ? '🎵 TikTok Viral' : plat === 'Meta' ? '📘 Meta / FB' : '📸 Reels'}
            </button>
          ))}
        </div>

        {/* Scope Tabs */}
        <div className="trends-filter-group">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'existing', label: '📦 In Store' },
            { id: 'recommended', label: '✨ High-Demand Recs' },
          ].map((scope) => (
            <button
              key={scope.id}
              onClick={() => setFilterType(scope.id as any)}
              className={`trends-scope-pill ${filterType === scope.id ? 'active' : ''}`}
            >
              {scope.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="trends-grid">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="trends-skeleton-card"
            />
          ))}
        </div>
      )}

      {/* Trends Grid */}
      {!isLoading && (
        <div className="trends-grid">
          {filteredTrends.map((trend) => (
            <div
              key={trend.id}
              className="trend-card"
            >
              {/* Card Header: Badges */}
              <div>
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
                  <div className="d-flex align-items-center gap-1.5 flex-wrap">
                    <span className={`trend-store-badge ${trend.isExistingInStore ? 'in-store' : 'opportunity'}`}>
                      {trend.isExistingInStore ? '📦 IN YOUR STORE' : '✨ OPPORTUNITY'}
                    </span>
                    <span className="trend-platform-tag">
                      {trend.platform}
                    </span>
                  </div>

                  {/* Demand Score */}
                  <span className="trend-demand-badge">
                    🔥 {trend.estimatedDemandScore}% Demand
                  </span>
                </div>

                {/* Product Title */}
                <h3 className="leading-normal py-0.5 font-bold trend-product-title">
                  {trend.productName}
                </h3>
                <p className="leading-normal text-slate-500 mb-3" style={{ fontSize: '12px' }}>
                  Category: <strong style={{ color: '#334155' }}>{trend.category}</strong>
                </p>

                {/* Economics Matrix */}
                <div className="trend-economics-matrix">
                  <div className="trend-econ-col">
                    <span className="trend-econ-label">Sourcing Cost</span>
                    <strong className="trend-econ-val text-slate-700">Rs. {trend.estimatedSourcingCostPKR?.toLocaleString()}</strong>
                  </div>
                  <div className="trend-econ-col">
                    <span className="trend-econ-label">Suggested Price</span>
                    <strong className="trend-econ-val text-slate-900">Rs. {trend.suggestedRetailPricePKR?.toLocaleString()}</strong>
                  </div>
                  <div className="trend-econ-col profit-col">
                    <span className="trend-econ-label text-emerald-600 font-bold">Est. Profit</span>
                    <strong className="trend-econ-val text-emerald-700">+Rs. {trend.estimatedProfitMarginPKR?.toLocaleString()}</strong>
                  </div>
                </div>

                {/* Viral 0-3s Hook Preview Box */}
                <div className="trend-viral-hook-box">
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-1 mb-1">
                    <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#b45309', textTransform: 'uppercase' }}>
                      🎯 0-3s Hook ({trend.viralHook?.hookStyle})
                    </span>
                    <span style={{ fontSize: '10px', color: '#92400e', background: 'rgba(255,255,255,0.8)', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>
                      On-Screen Text
                    </span>
                  </div>
                  <p className="leading-normal font-bold text-amber-950 mb-1" style={{ fontSize: '12.5px' }}>
                    "{trend.viralHook?.textOnScreen}"
                  </p>
                  <p className="leading-normal text-amber-900 m-0" style={{ fontSize: '11.5px', fontStyle: 'italic', lineHeight: 1.4 }}>
                    🎙️ Spoken: "{trend.viralHook?.verbalHookUrdu}"
                  </p>
                </div>

                {/* Competitor Strategy Angle */}
                <div className="mb-3">
                  <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                    🧠 Competitor Winning Strategy:
                  </span>
                  <p className="leading-normal text-slate-700 m-0" style={{ fontSize: '12px', lineHeight: 1.4 }}>
                    {trend.competitorAdAngle}
                  </p>
                </div>

                {/* Target Keywords Tags */}
                <div className="d-flex flex-wrap gap-1 mb-3">
                  {(trend.adTargetingKeywords || []).slice(0, 4).map((k, idx) => (
                    <span
                      key={idx}
                      className="trend-keyword-tag"
                    >
                      #{k}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer: Action Buttons */}
              <div className="trend-card-footer">
                <button
                  onClick={() => setSelectedItem(trend)}
                  className="trend-btn-primary"
                >
                  <span>🎬</span> View Shot List & Script
                </button>

                <button
                  onClick={() => handleCopyScript(trend.voiceoverScriptUrdu, trend.id)}
                  title="Copy Full Roman Urdu Voiceover Script"
                  className={`trend-btn-copy ${copiedId === trend.id ? 'copied' : ''}`}
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
          className="trends-modal-backdrop"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="trends-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="d-flex align-items-start justify-content-between gap-2 mb-3">
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span style={{ fontSize: '20px' }}>🎬</span>
                  <h2 className="leading-normal font-bold text-slate-900 m-0" style={{ fontSize: '17px' }}>
                    {selectedItem.productName}
                  </h2>
                </div>
                <p className="leading-normal text-slate-500 m-0" style={{ fontSize: '12.5px' }}>
                  Concept: <strong>{selectedItem.videoProductionGuide?.conceptOverview}</strong>
                </p>
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                className="trends-modal-close-btn"
              >
                ✕
              </button>
            </div>

            {/* Smartphone Camera Setup Guide */}
            <div className="trends-camera-guide-box">
              <div className="d-flex align-items-start gap-1.5">
                <span style={{ fontSize: '15px' }}>📱</span>
                <div>
                  <strong style={{ fontSize: '12px', color: '#0f172a' }}>Camera & Lighting: </strong>
                  <span style={{ fontSize: '12px', color: '#475569' }}>{selectedItem.videoProductionGuide?.cameraSetup}</span>
                </div>
              </div>
              <div className="d-flex align-items-start gap-1.5 mt-1">
                <span style={{ fontSize: '15px' }}>💡</span>
                <div>
                  <strong style={{ fontSize: '12px', color: '#0f172a' }}>Shooting Tips: </strong>
                  <span style={{ fontSize: '12px', color: '#059669' }}>{selectedItem.videoProductionGuide?.shootingTipsUrdu}</span>
                </div>
              </div>
            </div>

            {/* Scene-by-Scene Shot List Table */}
            <h4 className="leading-normal font-bold text-slate-900 mb-2" style={{ fontSize: '14px' }}>
              🎥 Scene-by-Scene Shot List (0:00 - 0:30s Viral Video)
            </h4>
            <div style={{ overflowX: 'auto', marginBottom: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '460px' }}>
                <thead>
                  <tr style={{ background: '#0f172a', color: '#ffffff', textAlign: 'left' }}>
                    <th style={{ padding: '8px 10px' }}>Time</th>
                    <th style={{ padding: '8px 10px' }}>Angle</th>
                    <th style={{ padding: '8px 10px' }}>Visual Action</th>
                    <th style={{ padding: '8px 10px' }}>Voiceover (Urdu)</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedItem.videoProductionGuide?.sceneBreakdown || []).map((scene, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                      <td style={{ padding: '8px 10px', fontWeight: 700, color: '#0284c7', whiteSpace: 'nowrap' }}>
                        {scene.timeSeconds}
                      </td>
                      <td style={{ padding: '8px 10px', color: '#475569', fontWeight: 600 }}>{scene.cameraAngle}</td>
                      <td style={{ padding: '8px 10px', color: '#1e293b' }}>{scene.visualShot}</td>
                      <td style={{ padding: '8px 10px', color: '#059669', fontStyle: 'italic' }}>"{scene.audioVoiceover}"</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Complete Voiceover Script Card */}
            <div style={{ background: '#f1f5f9', borderRadius: '14px', padding: '14px', marginBottom: '16px' }}>
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
                <h4 className="leading-normal font-bold text-slate-900 m-0" style={{ fontSize: '13px' }}>
                  🎙️ Complete Voiceover Script (Roman Urdu)
                </h4>
                <button
                  onClick={() => handleCopyScript(selectedItem.voiceoverScriptUrdu, 'modal_script')}
                  className="trends-btn-copy"
                  style={{ padding: '4px 10px', fontSize: '11.5px' }}
                >
                  {copiedId === 'modal_script' ? '✓ Copied' : '📋 Copy Voiceover'}
                </button>
              </div>
              <p className="leading-normal text-slate-700 m-0" style={{ fontSize: '12.5px', lineHeight: 1.5 }}>
                "{selectedItem.voiceoverScriptUrdu}"
              </p>
            </div>

            {/* Modal Footer */}
            <div className="d-flex justify-content-end">
              <button
                onClick={() => setSelectedItem(null)}
                className="trend-btn-primary"
                style={{ width: 'auto', padding: '8px 18px', fontSize: '12.5px' }}
              >
                Close Blueprint
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Responsive Styles */}
      <style>{`
        .trends-lab-container {
          padding: 24px;
          max-width: 1400px;
          margin: 0 auto;
          font-family: 'Inter', sans-serif;
          width: 100%;
          box-sizing: border-box;
        }
        .trends-lab-header {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 24px;
        }
        .trends-lab-title {
          font-size: 22px;
        }
        .trends-ai-badge {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: #ffffff;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 8px;
          borderRadius: 12px;
          white-space: nowrap;
        }
        .trends-lab-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
        }
        .trends-limit-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          padding: 6px 10px;
          border-radius: 10px;
          font-size: 12.5px;
          font-weight: 600;
          color: #334155;
        }
        .trends-limit-select {
          border: 1px solid #94a3b8;
          border-radius: 6px;
          padding: 2px 6px;
          font-size: 12px;
          font-weight: 700;
          color: #ea580c;
          background: #ffffff;
          cursor: pointer;
          outline: none;
        }
        .trends-action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          padding: 7px 12px;
          border-radius: 10px;
          font-size: 12.5px;
          font-weight: 600;
          color: #334155;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
        }
        .trends-whatsapp-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border: none;
          padding: 7px 14px;
          border-radius: 10px;
          font-size: 12.5px;
          font-weight: 700;
          color: #ffffff;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(16,185,129,0.3);
          transition: all 0.15s ease;
          white-space: nowrap;
        }
        .trends-alert {
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 6px;
        }
        .trends-alert-success {
          background: #ecfdf5;
          border: 1px solid #10b981;
          color: #065f46;
        }
        .trends-alert-warning {
          background: #fffbeb;
          border: 1px solid #f59e0b;
          color: #92400e;
        }
        .trends-insight-banner {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: #ffffff;
          padding: 16px 20px;
          border-radius: 16px;
          margin-bottom: 20px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          box-shadow: 0 8px 24px rgba(15,23,42,0.15);
        }
        .trends-filters-bar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 20px;
          background: #ffffff;
          padding: 12px 16px;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
        }
        .trends-filter-group {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          align-items: center;
        }
        .trends-filter-pill {
          background: #f1f5f9;
          color: #475569;
          border: none;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
        }
        .trends-filter-pill.active {
          background: #0f172a;
          color: #ffffff;
        }
        .trends-scope-pill {
          background: transparent;
          color: #64748b;
          border: 1px solid #cbd5e1;
          padding: 6px 10px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
        }
        .trends-scope-pill.active {
          background: #10b981;
          color: #ffffff;
          border-color: #10b981;
        }
        .trends-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 360px), 1fr));
          gap: 18px;
          width: 100%;
        }
        .trends-skeleton-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 20px;
          border: 1px solid #e2e8f0;
          height: 300px;
          animation: pulse 1.5s infinite ease-in-out;
        }
        .trend-card {
          background: #ffffff;
          border-radius: 18px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 18px rgba(0,0,0,0.04);
          padding: 18px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          width: 100%;
          box-sizing: border-box;
          overflow: hidden;
        }
        .trend-store-badge {
          font-size: 10.5px;
          font-weight: 700;
          padding: 2.5px 7px;
          border-radius: 6px;
          white-space: nowrap;
        }
        .trend-store-badge.in-store {
          background: #ecfdf5;
          color: #059669;
          border: 1px solid #a7f3d0;
        }
        .trend-store-badge.opportunity {
          background: #eff6ff;
          color: #2563eb;
          border: 1px solid #bfdbfe;
        }
        .trend-platform-tag {
          background: #f1f5f9;
          color: #475569;
          font-size: 10.5px;
          font-weight: 600;
          padding: 2.5px 7px;
          border-radius: 6px;
          white-space: nowrap;
        }
        .trend-demand-badge {
          background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
          color: #ffffff;
          font-size: 10.5px;
          font-weight: 800;
          padding: 2.5px 8px;
          border-radius: 10px;
          box-shadow: 0 2px 6px rgba(239,68,68,0.25);
          white-space: nowrap;
        }
        .trend-product-title {
          font-size: 15.5px;
          color: #0f172a;
          margin: 0 0 3px 0;
          word-break: break-word;
        }
        .trend-economics-matrix {
          background: #f8fafc;
          border-radius: 12px;
          padding: 10px 8px;
          border: 1px solid #e2e8f0;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 6px;
          margin-bottom: 14px;
          text-align: center;
          width: 100%;
          box-sizing: border-box;
        }
        .trend-econ-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .trend-econ-col.profit-col {
          background: #ecfdf5;
          border-radius: 8px;
          padding: 3px;
        }
        .trend-econ-label {
          font-size: 10px;
          color: #64748b;
          display: block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 100%;
        }
        .trend-econ-val {
          font-size: 12px;
          display: block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 100%;
        }
        .trend-viral-hook-box {
          background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
          border: 1px solid #fde68a;
          border-radius: 12px;
          padding: 12px 14px;
          margin-bottom: 14px;
        }
        .trend-keyword-tag {
          background: #f1f5f9;
          color: #475569;
          font-size: 10.5px;
          padding: 2px 7px;
          border-radius: 6px;
          white-space: nowrap;
        }
        .trend-card-footer {
          display: flex;
          gap: 8px;
          border-top: 1px solid #f1f5f9;
          padding-top: 14px;
        }
        .trend-btn-primary {
          flex: 1;
          background: #0f172a;
          color: #ffffff;
          border: none;
          border-radius: 10px;
          padding: 9px 12px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: background 0.15s ease;
          white-space: nowrap;
        }
        .trend-btn-copy {
          background: #f8fafc;
          color: #475569;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          padding: 9px 12px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
        }
        .trend-btn-copy.copied {
          background: #ecfdf5;
          color: #059669;
          border-color: #10b981;
        }
        .trends-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15,23,42,0.6);
          backdrop-filter: blur(4px);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 14px;
        }
        .trends-modal-content {
          background: #ffffff;
          border-radius: 20px;
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
          padding: 20px 16px;
          position: relative;
          animation: modalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .trends-modal-close-btn {
          background: #f1f5f9;
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .trends-camera-guide-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 12px 14px;
          margin-bottom: 16px;
        }

        /* Responsive Mobile Breakpoints */
        @media (max-width: 768px) {
          .trends-lab-container {
            padding: 12px 8px;
          }
          .trends-lab-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
            margin-bottom: 16px;
          }
          .trends-lab-title {
            font-size: 18px;
          }
          .trends-lab-actions {
            width: 100%;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 6px;
          }
          .trends-limit-pill {
            grid-column: span 2;
            justify-content: space-between;
          }
          .trends-whatsapp-btn {
            grid-column: span 2;
            justify-content: center;
            padding: 9px 12px;
          }
          .trends-filters-bar {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
            padding: 10px 8px;
          }
          .trends-filter-group {
            width: 100%;
            display: flex;
            overflow-x: auto;
            flex-wrap: nowrap;
            padding-bottom: 4px;
            -webkit-overflow-scrolling: touch;
          }
          .trends-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }
          .trend-card {
            padding: 14px 12px;
            border-radius: 14px;
          }
          .trend-card-footer {
            flex-direction: column;
          }
          .trend-btn-primary, .trend-btn-copy {
            width: 100%;
            justify-content: center;
          }
          .trends-modal-content {
            padding: 16px 12px;
          }
        }

        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
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
