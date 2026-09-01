'use client';

import React from 'react';
import Link from 'next/link';
import { useProductForm, ProductFormHookOptions } from '../../../hooks/useProductForm';
import { ProductGeneralInfo } from './ProductGeneralInfo';
import { ProductImagesManager } from './ProductImagesManager';
import { ProductVariantsBuilder } from './ProductVariantsBuilder';
import { ProductSpecifications } from './ProductSpecifications';
import { ProductSeoDetails } from './ProductSeoDetails';

export interface ProductFormProps extends ProductFormHookOptions {
  pageTitle: string;
}

export function ProductForm({ productId, pageTitle }: ProductFormProps) {
  const {
    isEditMode,
    categories,
    loading,
    fetchingInitial,
    error,
    successMessage,
    name,
    setName,
    description,
    setDescription,
    price,
    setPrice,
    originalPrice,
    setOriginalPrice,
    category,
    setCategory,
    stock,
    setStock,
    heroText,
    setHeroText,
    isFeatured,
    setIsFeatured,
    isNewArrival,
    setIsNewArrival,
    isTopSelling,
    setIsTopSelling,
    image,
    setImage,
    images,
    video,
    setVideo,
    showVideoOnFront,
    setShowVideoOnFront,
    uploading,
    galleryUploading,
    galleryUrlInput,
    setGalleryUrlInput,
    mainImageError,
    setMainImageError,
    galleryImageErrors,
    setGalleryImageErrors,
    variants,
    variantUploading,
    specs,
    seoTitle,
    setSeoTitle,
    seoDescription,
    setSeoDescription,
    seoKeywords,
    setSeoKeywords,
    validationErrors,
    docxParsing,
    docxInputRef,
    handleFileChange,
    handleGalleryFileChange,
    handleAddGalleryUrl,
    handleRemoveGalleryImage,
    handleSetMainImage,
    handleVideoChange,
    handleAddVariant,
    handleRemoveVariant,
    handleVariantChange,
    handleVariantFileChange,
    handleAddSpecRow,
    handleRemoveSpecRow,
    handleSpecChange,
    handleDocxFileChange,
    handleSubmit,
  } = useProductForm({ productId });

  if (fetchingInitial) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5 min-vh-50">
        <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading product...</span>
        </div>
        <p className="text-muted fw-semibold">Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid px-0 px-md-2">
      {/* Top Header Bar */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div className="d-flex align-items-center gap-2">
          <Link href="/admin/products" className="btn btn-sm btn-outline-secondary rounded-pill px-3">
            <i className="fas fa-arrow-left me-1" /> Products
          </Link>
          <h3 className="fw-bold text-dark mb-0" style={{ letterSpacing: '-0.5px' }}>
            {pageTitle}
          </h3>
        </div>

        <div className="d-flex gap-2 w-100 w-sm-auto flex-wrap">
          {!isEditMode && (
            <>
              <input
                type="file"
                ref={docxInputRef}
                accept=".docx"
                style={{ display: 'none' }}
                onChange={handleDocxFileChange}
              />
              <button
                type="button"
                onClick={() => docxInputRef.current?.click()}
                disabled={docxParsing}
                className="btn btn-outline-primary btn-sm rounded-pill px-3 flex-fill flex-sm-grow-0"
              >
                {docxParsing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" /> Parsing DOCX...
                  </>
                ) : (
                  <>
                    <i className="fas fa-file-word me-1" /> Auto-Fill from DOCX
                  </>
                )}
              </button>
            </>
          )}

          <button
            type="submit"
            form="product-form"
            disabled={loading || uploading || galleryUploading}
            className="btn btn-sm rounded-pill px-4 text-white flex-fill flex-sm-grow-0"
            style={{
              background: 'linear-gradient(135deg, #ea580c, #c2410c)',
              fontWeight: 600,
              boxShadow: '0 4px 14px rgba(234,88,12,0.35)',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Saving...
              </>
            ) : (
              <>
                <i className="fas fa-save me-2" />
                {isEditMode ? 'Update Product' : 'Publish Product'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-danger border-0 rounded-3 mb-4 d-flex align-items-center gap-2" role="alert">
          <i className="fas fa-exclamation-circle" />
          <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success border-0 rounded-3 mb-4 d-flex align-items-center gap-2" role="alert">
          <i className="fas fa-check-circle" />
          <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>{successMessage}</span>
        </div>
      )}

      {/* Main Form */}
      <form id="product-form" onSubmit={handleSubmit}>
        <div className="row g-4">
          {/* Left Column: General Info, Variants, Specifications */}
          <div className="col-12 col-xl-7">
            <ProductGeneralInfo
              name={name}
              setName={setName}
              description={description}
              setDescription={setDescription}
              category={category}
              setCategory={setCategory}
              categories={categories}
              price={price}
              setPrice={setPrice}
              originalPrice={originalPrice}
              setOriginalPrice={setOriginalPrice}
              stock={stock}
              setStock={setStock}
              heroText={heroText}
              setHeroText={setHeroText}
              isFeatured={isFeatured}
              setIsFeatured={setIsFeatured}
              isNewArrival={isNewArrival}
              setIsNewArrival={setIsNewArrival}
              isTopSelling={isTopSelling}
              setIsTopSelling={setIsTopSelling}
              validationErrors={validationErrors}
            />

            <ProductVariantsBuilder
              variants={variants}
              variantUploading={variantUploading}
              onAddVariant={handleAddVariant}
              onRemoveVariant={handleRemoveVariant}
              onVariantChange={handleVariantChange}
              onVariantFileChange={handleVariantFileChange}
            />

            <ProductSpecifications
              specs={specs}
              onAddSpecRow={handleAddSpecRow}
              onRemoveSpecRow={handleRemoveSpecRow}
              onSpecChange={handleSpecChange}
            />
          </div>

          {/* Right Column: Media, Gallery & SEO Details */}
          <div className="col-12 col-xl-5">
            <ProductImagesManager
              image={image}
              setImage={setImage}
              images={images}
              uploading={uploading}
              galleryUploading={galleryUploading}
              galleryUrlInput={galleryUrlInput}
              setGalleryUrlInput={setGalleryUrlInput}
              mainImageError={mainImageError}
              setMainImageError={setMainImageError}
              galleryImageErrors={galleryImageErrors}
              setGalleryImageErrors={setGalleryImageErrors}
              video={video}
              setVideo={setVideo}
              showVideoOnFront={showVideoOnFront}
              setShowVideoOnFront={setShowVideoOnFront}
              validationErrors={validationErrors}
              onFileChange={handleFileChange}
              onGalleryFileChange={handleGalleryFileChange}
              onAddGalleryUrl={handleAddGalleryUrl}
              onRemoveGalleryImage={handleRemoveGalleryImage}
              onSetMainImage={handleSetMainImage}
              onVideoChange={handleVideoChange}
            />

            <ProductSeoDetails
              name={name}
              setName={setName}
              description={description}
              setDescription={setDescription}
              price={price}
              originalPrice={originalPrice}
              category={category}
              image={image}
              images={images}
              video={video}
              specs={specs}
              variants={variants}
              seoTitle={seoTitle}
              setSeoTitle={setSeoTitle}
              seoDescription={seoDescription}
              setSeoDescription={setSeoDescription}
              seoKeywords={seoKeywords}
              setSeoKeywords={setSeoKeywords}
            />
          </div>
        </div>
      </form>
    </div>
  );
}
