'use client';

import React, { useState } from 'react';
import { useAdminTheme } from '../../../hooks/useAdminTheme';
import { ThemeHeader } from '../../../components/admin/theme/ThemeHeader';
import { LayoutThemeSelector } from '../../../components/admin/theme/LayoutThemeSelector';
import { SvgLogoStudio } from '../../../components/admin/theme/SvgLogoStudio';
import { ColorPaletteSection } from '../../../components/admin/theme/ColorPaletteSection';
import { TypographySection } from '../../../components/admin/theme/TypographySection';
import { ShapesEffectsSection } from '../../../components/admin/theme/ShapesEffectsSection';
import { NavbarFooterSection } from '../../../components/admin/theme/NavbarFooterSection';
import { HeroSlidesManager } from '../../../components/admin/theme/HeroSlidesManager';
import { HomepageSectionsConfig } from '../../../components/admin/theme/HomepageSectionsConfig';
import { ThemeLivePreview } from '../../../components/admin/theme/ThemeLivePreview';

type ThemeTabKey = 'hero' | 'logo' | 'colors' | 'shapes' | 'nav' | 'all';

const TABS: { key: ThemeTabKey; label: string; icon: string; badge?: string }[] = [
  { key: 'hero', label: 'Hero Slides & Banners', icon: 'fas fa-images' },
  { key: 'logo', label: 'Logo & Typography', icon: 'fas fa-signature' },
  { key: 'colors', label: 'Colors & Presets', icon: 'fas fa-palette' },
  { key: 'shapes', label: 'Shapes & Effects', icon: 'fas fa-shapes' },
  { key: 'nav', label: 'Navbar & Footer', icon: 'fas fa-bars' },
  { key: 'all', label: 'Show All', icon: 'fas fa-th-list' },
];

export default function ThemeSettingsPage() {
  const [activeTab, setActiveTab] = useState<ThemeTabKey>('hero');

  const {
    form,
    setForm,
    loading,
    saving,
    toast,
    availableProducts,
    set,
    setSvgLogo,
    applyPreset,
    addHeroSlide,
    updateHeroSlide,
    deleteHeroSlide,
    moveHeroSlide,
    selectProductForHeroSlide,
    updateHeroSliderSetting,
    updateHomepageSection,
    handleSave,
    handleReset,
  } = useAdminTheme();

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5 min-vh-50">
        <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading settings...</span>
        </div>
        <p className="text-muted fw-semibold">Loading Theme & Appearance Studio...</p>
      </div>
    );
  }

  const heroSlidesCount = form.homepageSections?.heroSlides?.length || 0;

  return (
    <div className="container-fluid px-0 px-md-2">
      {/* Top Header Bar with Save / Reset & Toasts */}
      <ThemeHeader saving={saving} toast={toast} onSave={handleSave} onReset={handleReset} />

      {/* 🧭 Categorized Navigation Tabs Bar */}
      <div className="bg-white p-2 p-md-3 rounded-4 shadow-sm border mb-4">
        <div className="d-flex align-items-center gap-1.5 gap-md-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`btn btn-sm rounded-pill px-3 py-2 d-flex align-items-center gap-2 flex-shrink-0 transition-all ${
                  isActive
                    ? 'btn-primary text-white shadow-sm fw-bold'
                    : 'btn-light text-secondary hover:bg-light-subtle fw-medium border'
                }`}
                style={{
                  fontSize: '0.82rem',
                  letterSpacing: '-0.2px',
                  background: isActive ? 'linear-gradient(135deg, #ea580c, #c2410c)' : undefined,
                  border: isActive ? 'none' : undefined,
                }}
              >
                <i className={tab.icon} style={{ fontSize: '0.85rem' }} />
                <span>{tab.label}</span>
                {tab.key === 'hero' && heroSlidesCount > 0 && (
                  <span
                    className={`badge rounded-pill ${
                      isActive ? 'bg-white text-primary' : 'bg-primary text-white'
                    }`}
                    style={{ fontSize: '0.65rem' }}
                  >
                    {heroSlidesCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="row g-4">
        {/* ── LEFT COLUMN — Theme Studio Settings ─────────────── */}
        <div className="col-12 col-xl-7">
          {/* TAB 1: Hero Slides & Banners */}
          {(activeTab === 'hero' || activeTab === 'all') && (
            <div className="d-flex flex-column gap-3 mb-4">
              <HeroSlidesManager
                form={form}
                availableProducts={availableProducts}
                onAddSlide={addHeroSlide}
                onUpdateSlide={updateHeroSlide}
                onDeleteSlide={deleteHeroSlide}
                onMoveSlide={moveHeroSlide}
                onSelectProduct={selectProductForHeroSlide}
                onUpdateSliderSetting={updateHeroSliderSetting}
              />
              <HomepageSectionsConfig form={form} onUpdateSection={updateHomepageSection} />
            </div>
          )}

          {/* TAB 2: Logo Studio & Typography */}
          {(activeTab === 'logo' || activeTab === 'all') && (
            <div className="d-flex flex-column gap-3 mb-4">
              <SvgLogoStudio svgLogo={form.svgLogo} onSetSvgLogo={setSvgLogo} />
              <TypographySection fontFamily={form.fontFamily} fontSizeBase={form.fontSizeBase} onSet={set} />
            </div>
          )}

          {/* TAB 3: Colors & Presets */}
          {(activeTab === 'colors' || activeTab === 'all') && (
            <div className="d-flex flex-column gap-3 mb-4">
              <LayoutThemeSelector layoutTheme={form.layoutTheme} onSelectPreset={applyPreset} />
              <ColorPaletteSection form={form} onSet={set} />
            </div>
          )}

          {/* TAB 4: Shapes, Corners & Effects */}
          {(activeTab === 'shapes' || activeTab === 'all') && (
            <div className="d-flex flex-column gap-3 mb-4">
              <ShapesEffectsSection form={form} onSet={set} />
            </div>
          )}

          {/* TAB 5: Navbar & Footer */}
          {(activeTab === 'nav' || activeTab === 'all') && (
            <div className="d-flex flex-column gap-3 mb-4">
              <NavbarFooterSection form={form} onSet={set} />
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN — Live Mockup Preview ──────────────── */}
        <div className="col-12 col-xl-5">
          <ThemeLivePreview theme={form} onSetForm={setForm} />
        </div>
      </div>
    </div>
  );
}
