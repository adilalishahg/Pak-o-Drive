'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function BulkImportProductsPage() {
  const router = useRouter();
  const [jsonText, setJsonText] = useState('');
  const [parsedPreview, setParsedPreview] = useState<any[]>([]);
  const [parseError, setParseError] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  // Sample template generator covering all 5 core verticals with parent & subcategories
  const sampleTemplate = [
    // 🚗 1. CAR ACCESSORIES
    {
      name: "Solar Powered Helicopter Dashboard Car Perfume & Rotating Freshener",
      category: "Car Accessories",
      subcategory: "Car Perfumes & Fresheners",
      price: 1999,
      originalPrice: 2899,
      image: "/img/product-8.png",
      images: ["/img/product-8.png", "/img/product-13.png"],
      description: "Aviation-grade solar aroma diffuser with auto-rotating propeller blades when sunlight hits. Emits continuous natural essential fragrance without batteries.",
      stock: 45,
      isFeatured: true,
      isTopSelling: true,
      specifications: {
        "Material": "Zinc Alloy + Solar Panel",
        "Fragrance Duration": "Up to 90 Days",
        "Mount Type": "Non-Slip Dashboard Adhesive"
      }
    },
    {
      name: "64-Color Symphony DreamColor Car Interior LED Ambient Lighting Kit",
      category: "Car Accessories",
      subcategory: "Interior Styling & Ambient Lights",
      price: 3499,
      originalPrice: 4999,
      image: "/img/product-13.png",
      images: ["/img/product-13.png", "/img/product-8.png"],
      description: "Universal acrylic fiber optic RGB ambient strip with wireless smartphone Bluetooth App control and sound-activated music sync mode.",
      stock: 35,
      isFeatured: true,
      isTopSelling: true,
      specifications: {
        "Strip Length": "110cm + 75cm + Footwell LEDs",
        "Control": "Bluetooth App + Wireless Remote",
        "Voltage": "12V USB / Cigarette Lighter"
      }
    },
    {
      name: "120W Super Fast Retractable Dual Port 3-in-1 Car Charger",
      category: "Car Accessories",
      subcategory: "Dash Cams & Car Electronics",
      price: 2799,
      originalPrice: 3899,
      image: "/img/product-12.png",
      images: ["/img/product-12.png", "/img/product-4.png"],
      description: "Auto-retractable 80cm cables for Type-C and Lightning plus dual USB ports. Fast charges up to 4 devices simultaneously with digital voltage monitor.",
      stock: 60,
      isFeatured: false,
      isTopSelling: true,
      specifications: {
        "Max Output": "120W Super Fast Charging",
        "Cable Length": "80cm Auto-Retractable",
        "Display": "Real-time LED Battery Voltage"
      }
    },

    // 📱 2. MOBILE & SMART TECH
    {
      name: "T900 Ultra 2 Max Smartwatch with NFC, Compass & BT Calling",
      category: "Mobile & Smart Tech",
      subcategory: "Smartwatches & Bands",
      price: 3899,
      originalPrice: 5500,
      image: "/img/product-2.png",
      images: ["/img/product-2.png", "/img/product-3.png"],
      description: "Large 2.19-inch HD Infinite Display smartwatch with real screw back, strap locks, wireless magnetic charging, blood oxygen & heart rate tracking.",
      stock: 50,
      isFeatured: true,
      isTopSelling: true,
      specifications: {
        "Screen": "2.19 inch IPS HD Touchscreen",
        "Battery Life": "3-5 Days Active Usage",
        "Compatibility": "Android 5.0+ & iOS 9.0+"
      }
    },
    {
      name: "ANC Pro Wireless Bluetooth Earbuds with Spatial Audio & Touch Control",
      category: "Mobile & Smart Tech",
      subcategory: "Wireless Earbuds & Audio",
      price: 2499,
      originalPrice: 3999,
      image: "/img/product-3.png",
      images: ["/img/product-3.png", "/img/product-5.png"],
      description: "True wireless stereo earbuds with active noise reduction, transparency mode, deep bass drivers, and IPX5 sweat-resistant coating.",
      stock: 75,
      isFeatured: true,
      isTopSelling: true,
      specifications: {
        "Bluetooth": "V5.3 EDR Instant Pair",
        "Playtime": "Up to 28 Hours with Case",
        "Latency": "45ms Ultra Low Latency for Gaming"
      }
    },
    {
      name: "65W GaN III Fast Wall Charger Dual USB-C + USB-A",
      category: "Mobile & Smart Tech",
      subcategory: "Fast Chargers & Cables",
      price: 2999,
      originalPrice: 4200,
      image: "/img/product-4.png",
      images: ["/img/product-4.png", "/img/product-12.png"],
      description: "Ultra-compact Gallium Nitride (GaN) fast charger capable of charging laptops, tablets, and smartphones at maximum rated speeds.",
      stock: 40,
      isFeatured: false,
      isTopSelling: true,
      specifications: {
        "Max Power": "65W Power Delivery 3.0",
        "Ports": "2x Type-C + 1x USB-A",
        "Technology": "GaN III High Efficiency"
      }
    },

    // 🏠 3. HOME & KITCHEN GADGETS
    {
      name: "Rechargeable Motion Sensor LED Magnetic Under-Cabinet Wardrobe Light",
      category: "Home & Kitchen Smart Gadgets",
      subcategory: "Smart Home Lighting",
      price: 1499,
      originalPrice: 2200,
      image: "/img/product-10.png",
      images: ["/img/product-10.png"],
      description: "Ultra-slim wireless LED bar with PIR infrared human motion detector. Snaps magnetically to any surface with 3 color light modes (Warm, White, Mixed).",
      stock: 55,
      isFeatured: true,
      isTopSelling: true,
      specifications: {
        "Sensor Range": "120 Degree / 3-5 Meters",
        "Battery": "USB-C Rechargeable Lithium Battery",
        "Mounting": "Magnetic 3M Adhesive Plates Included"
      }
    },
    {
      name: "Wireless Portable Electric USB Blender Smoothie & Fresh Juice Bottle (350ml)",
      category: "Home & Kitchen Smart Gadgets",
      subcategory: "Kitchen Mini Appliances",
      price: 2899,
      originalPrice: 4100,
      image: "/img/product-1.png",
      images: ["/img/product-1.png"],
      description: "Heavy duty 4-blade stainless steel personal juicer cup. Blend protein shakes, fresh fruits, and baby food anywhere on the go.",
      stock: 30,
      isFeatured: true,
      isTopSelling: false,
      specifications: {
        "Blade Material": "304 Food Grade Stainless Steel",
        "Capacity": "350ml BPA Free Bottle",
        "Motor Speed": "20,000 RPM Powerful Pulse"
      }
    },
    {
      name: "9000Pa High Power Cordless Portable Handheld Vacuum Cleaner 2-in-1",
      category: "Home & Kitchen Smart Gadgets",
      subcategory: "Cleaning & Vacuum Gadgets",
      price: 3299,
      originalPrice: 4600,
      image: "/img/product-10.png",
      images: ["/img/product-10.png"],
      description: "Dual function vacuum suction and air duster blower. Ideal for cleaning sofas, computer keyboards, drawers, and car seat crevices.",
      stock: 40,
      isFeatured: false,
      isTopSelling: true,
      specifications: {
        "Suction Power": "9000Pa Cyclone Suction",
        "Filter": "Washable HEPA Filter",
        "Runtime": "30 Minutes Continuous"
      }
    },

    // 🏍️ 4. BIKES & MOTORCYCLING
    {
      name: "Anti-Shake Shock Absorption Vibration Dampener Motorcycle Phone Mount",
      category: "Bikes & Motorcycling Essentials",
      subcategory: "Bike Phone Holders",
      price: 2199,
      originalPrice: 3200,
      image: "/img/product-7.png",
      images: ["/img/product-7.png"],
      description: "Heavy duty alloy motorcycle handlebar holder with 4-corner silicone cushions that protect optical image stabilization (OIS) phone cameras.",
      stock: 65,
      isFeatured: true,
      isTopSelling: true,
      specifications: {
        "Handlebar Diameter": "22mm - 32mm Universal",
        "Phone Size": "4.7 inch to 7.2 inch",
        "Locking Mechanism": "One-Touch Mechanical Lock"
      }
    },
    {
      name: "Heavy Duty 110dB Siren Alarm Disc Brake Lock for Motorbikes & Scooters",
      category: "Bikes & Motorcycling Essentials",
      subcategory: "Safety & Security Locks",
      price: 2599,
      originalPrice: 3600,
      image: "/img/product-9.png",
      images: ["/img/product-9.png"],
      description: "Waterproof forged alloy disc lock with built-in vibration sensor alarm. Rings loud 110dB warning siren against bike theft attempts.",
      stock: 45,
      isFeatured: false,
      isTopSelling: true,
      specifications: {
        "Alarm Loudness": "110 Decibels",
        "Pin Diameter": "7mm Hardened Steel",
        "Waterproof": "IP67 Weatherproof Sealed"
      }
    },

    // ✨ 5. PERSONAL CARE & LIFESTYLE
    {
      name: "Vintage T9 Metal Cordless Hair & Beard Precision Trimmer",
      category: "Personal Care & Daily Lifestyle",
      subcategory: "Hair & Beard Care",
      price: 1799,
      originalPrice: 2500,
      image: "/img/product-6.png",
      images: ["/img/product-6.png"],
      description: "Zero gapped titanium T-blade professional hair clipper with engraved bronze dragon body, high speed motor, and 4 guide combs (1.5mm - 4mm).",
      stock: 80,
      isFeatured: true,
      isTopSelling: true,
      specifications: {
        "Blade Type": "Zero-Gapped T-Blade",
        "Battery": "1200mAh USB Rechargeable",
        "Run Time": "120 Minutes Non-Stop"
      }
    },
    {
      name: "Deep Tissue Percussion Muscle Massage Gun with 4 Interchangeable Heads",
      category: "Personal Care & Daily Lifestyle",
      subcategory: "Massagers & Wellness",
      price: 3999,
      originalPrice: 5800,
      image: "/img/product-11.png",
      images: ["/img/product-11.png"],
      description: "Multi-speed handheld cordless vibration massager for muscle soreness, post-workout recovery, neck, and shoulder stiffness relief.",
      stock: 25,
      isFeatured: false,
      isTopSelling: true,
      specifications: {
        "Speed Levels": "6 Adjustable Vibration Levels",
        "Massage Heads": "Ball, Fork, Bullet, Flat Heads",
        "Noise Level": "Below 45dB Whisper Quiet"
      }
    }
  ];


  const handleJsonChange = (val: string) => {
    setJsonText(val);
    setParseError('');
    setImportResult(null);

    if (!val.trim()) {
      setParsedPreview([]);
      return;
    }

    try {
      const parsed = JSON.parse(val);
      const items = Array.isArray(parsed) ? parsed : parsed.products ? parsed.products : [parsed];
      setParsedPreview(items);
    } catch (e: any) {
      setParseError('Invalid JSON format: ' + e.message);
      setParsedPreview([]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleJsonChange(content);
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    handleJsonChange(JSON.stringify(sampleTemplate, null, 2));
  };

  const handleExecuteImport = async () => {
    if (parsedPreview.length === 0) return;

    try {
      setImporting(true);
      setImportResult(null);

      const res = await fetch('/api/products/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedPreview),
      });

      const data = await res.json();
      if (data.success) {
        setImportResult({
          success: true,
          message: data.message,
          count: data.count,
        });
      } else {
        setImportResult({
          success: false,
          error: data.error || 'Failed to import products.',
        });
      }
    } catch (err: any) {
      setImportResult({
        success: false,
        error: err.message || 'An unexpected error occurred during import.',
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="container-fluid py-4" style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <div className="container">
        
        {/* Header */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div>
            <Link href="/admin/products" className="text-decoration-none text-muted small d-inline-flex align-items-center gap-1 mb-2">
              <i className="fas fa-arrow-left" /> Back to Products
            </Link>
            <h1 className="h3 fw-bold text-dark m-0">📥 Bulk Import Products (AI & JSON)</h1>
            <p className="text-muted small m-0 mt-1">
              Import dozens of products generated by Gemini in 1-Click with automatic categories and gallery resolution.
            </p>
          </div>

          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleLoadSample}
              className="btn btn-success btn-sm px-3 fw-bold text-white shadow-sm"
            >
              <i className="fas fa-sparkles me-1" /> 🌱 Load 15+ Multi-Niche Sample Products
            </button>
            <Link href="/admin/products" className="btn btn-outline-dark btn-sm px-3">
              View Catalog
            </Link>
          </div>
        </div>

        {/* Workflow Info Box */}
        <div className="card border-0 shadow-sm rounded-3 mb-4" style={{ background: '#f0fdf4', borderLeft: '4px solid #16a34a' }}>
          <div className="card-body py-3">
            <div className="d-flex align-items-start gap-3">
              <div className="p-2 bg-success text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                <i className="fas fa-magic" />
              </div>
              <div className="small text-dark">
                <strong>⚡ Universal Multi-Niche & Auto-Category Creation:</strong>
                <p className="m-0 mt-1 text-secondary">
                  Aap JSON me koi bhi <code>category</code> aur <code>subcategory</code> likh kar import kar sakte hain. Agar category database me mojood nahi hogi, tou system khud ba khud <strong>Parent Category</strong> aur uski <strong>Child Subcategory</strong> create karke uske andar product link kar dega!
                </p>
              </div>
            </div>
          </div>
        </div>


        <div className="row g-4">
          
          {/* Left Column: JSON Input & File Upload */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm rounded-3 h-100">
              <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
                <span className="fw-bold text-dark small">Paste or Upload Product JSON</span>
                <label className="btn btn-sm btn-outline-primary m-0 cursor-pointer">
                  <i className="fas fa-upload me-1" /> Upload .JSON File
                  <input type="file" accept=".json" onChange={handleFileUpload} style={{ display: 'none' }} />
                </label>
              </div>
              <div className="card-body p-3">
                <textarea
                  className="form-control font-monospace"
                  rows={16}
                  placeholder={`[\n  {\n    "name": "Product Title",\n    "category": "Car Accessories",\n    "price": 2499,\n    "image": "photo1.webp",\n    "images": ["photo1.webp", "photo2.webp"],\n    "description": "Product details..."\n  }\n]`}
                  value={jsonText}
                  onChange={(e) => handleJsonChange(e.target.value)}
                  style={{ fontSize: '0.82rem', background: '#0f172a', color: '#38bdf8', border: '1px solid #334155' }}
                />

                {parseError && (
                  <div className="alert alert-danger small mt-3 mb-0 py-2 d-flex align-items-center gap-2">
                    <i className="fas fa-exclamation-triangle" /> {parseError}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Live Parsed Preview & Actions */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm rounded-3 h-100 d-flex flex-column">
              <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
                <span className="fw-bold text-dark small">
                  Live Preview ({parsedPreview.length} Products Detected)
                </span>
                {parsedPreview.length > 0 && (
                  <span className="badge bg-success small px-2 py-1">Ready to Import</span>
                )}
              </div>

              <div className="card-body p-3 flex-grow-1" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                {parsedPreview.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <i className="fas fa-boxes fa-3x mb-3 text-secondary opacity-50" />
                    <p className="small m-0">Paste JSON on the left to see the live product preview.</p>
                  </div>
                ) : (
                  <div className="list-group list-group-flush">
                    {parsedPreview.map((item, idx) => (
                      <div key={idx} className="list-group-item px-0 py-2.5 border-bottom">
                        <div className="d-flex justify-content-between align-items-start gap-2">
                          <div>
                            <span className="badge bg-secondary text-light small me-2">#{idx + 1}</span>
                            <strong className="text-dark small">{item.name || 'Untitled Product'}</strong>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                              Category: <span className="text-primary">{item.category || 'General'}</span> | Stock: {item.stock || 25}
                            </div>
                            <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                              Main Image: <code className="text-dark">{item.image || 'none'}</code> ({item.images?.length || 0} gallery photos)
                            </div>
                          </div>
                          <div className="text-end flex-shrink-0">
                            <span className="fw-bold text-success d-block" style={{ fontSize: '0.9rem' }}>
                              Rs. {Number(item.price || 0).toLocaleString()}
                            </span>
                            {item.originalPrice && (
                              <del className="text-muted" style={{ fontSize: '0.75rem' }}>
                                Rs. {Number(item.originalPrice).toLocaleString()}
                              </del>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Message */}
              {importResult && (
                <div className={`p-3 border-top ${importResult.success ? 'bg-success text-white' : 'bg-danger text-white'}`}>
                  <div className="d-flex align-items-center justify-content-between">
                    <span className="small fw-bold">
                      {importResult.success ? `🎉 ${importResult.message}` : `❌ ${importResult.error}`}
                    </span>
                    {importResult.success && (
                      <button
                        onClick={() => router.push('/admin/products')}
                        className="btn btn-light btn-sm fw-bold px-3"
                      >
                        View All in Admin ➔
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Footer CTA */}
              <div className="card-footer bg-white p-3 border-top">
                <button
                  type="button"
                  onClick={handleExecuteImport}
                  disabled={parsedPreview.length === 0 || importing || !!parseError}
                  className="btn btn-success w-100 py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                  style={{ background: '#16a34a', border: 'none' }}
                >
                  {importing ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                      Importing Products to Database...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-cloud-upload-alt" />
                      Import {parsedPreview.length} Products to Store
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
