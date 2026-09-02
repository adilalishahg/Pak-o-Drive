'use client';

import React from 'react';
import { IProduct } from '../../types';
import { useHomePage } from '@/hooks/useHomePage';
import { HomeCleanWhiteLayout } from './HomeCleanWhiteLayout';
import { HomeModernLayout } from './HomeModernLayout';

export interface HomePageClientProps {
  initialProducts: IProduct[];
  initialCategories: any[];
}

export function HomePageClient({ initialProducts, initialCategories }: HomePageClientProps) {
  const {
    products,
    cats,
    activeTab,
    setActiveTab,
    filteredProducts,
    tabs,
    theme,
    isModernGreen,
    isCleanWhite,
    hs,
    heroBig,
    heroSmall,
    trending,
    cols,
    deal,
    moreDeals,
    valProps,
    featSec,
    dynamicHeroSlides,
    dynamicOffers,
    sliderConfig,
    categorySections,
  } = useHomePage({ initialProducts, initialCategories });

  if (isCleanWhite) {
    return (
      <HomeCleanWhiteLayout
        theme={theme}
        products={products}
        cats={cats}
        heroBig={heroBig}
        heroSmall={heroSmall}
        trending={trending}
        cols={cols}
        deal={deal}
        moreDeals={moreDeals}
        featSec={featSec}
        valProps={valProps}
        dynamicHeroSlides={dynamicHeroSlides}
        sliderConfig={sliderConfig}
        categorySections={categorySections}
      />
    );
  }

  return (
    <HomeModernLayout
      theme={theme}
      isModernGreen={isModernGreen}
      isCleanWhite={isCleanWhite}
      hs={hs}
      dynamicHeroSlides={dynamicHeroSlides}
      dynamicOffers={dynamicOffers}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      filteredProducts={filteredProducts}
      tabs={tabs}
      sliderConfig={sliderConfig}
      categorySections={categorySections}
    />
  );
}
