'use client';

import React, { useState } from 'react';
import { Camera, Check, X, Sparkles, Tag, Package, DollarSign } from 'lucide-react';
import { AdminActionRequired } from '@/lib/adminActionEngine';

interface VisionProductProposalCardProps {
  action: AdminActionRequired;
  isThinking: boolean;
  onConfirm: (action: AdminActionRequired) => void;
  onCancel: () => void;
}

const CATEGORIES = [
  'Car Care & Detailing',
  'LED Lights & Bulbs',
  'Car Gadgets',
  'Interior Accessories',
  'Exterior Accessories',
];

export const VisionProductProposalCard: React.FC<VisionProductProposalCardProps> = ({
  action,
  isThinking,
  onConfirm,
  onCancel,
}) => {
  const params = action.payload?.params || {};

  const [name, setName] = useState<string>(params.name || '');
  const [price, setPrice] = useState<number>(Number(params.price) || 950);
  const [competitorPrice, setCompetitorPrice] = useState<number>(Number(params.competitorPrice) || 1250);
  const [category, setCategory] = useState<string>(params.category || 'Car Care & Detailing');
  const [stock, setStock] = useState<number>(Number(params.stock) || 25);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const wholesale = params.wholesaleCost || Math.round(price * 0.45);
  const marginPercent = price > 0 ? Math.round(((price - wholesale) / price) * 100) : 70;

  const displayImage = params.images?.[0] || params.userUploadedImage || params.studioImage;

  const handleConfirm = () => {
    const updatedAction: AdminActionRequired = {
      ...action,
      title: `Publish: ${name}`,
      payload: {
        ...action.payload,
        params: {
          ...params,
          name,
          price: Number(price),
          competitorPrice: Number(competitorPrice),
          category,
          stock: Number(stock),
          profitMarginPercentage: marginPercent,
        },
      },
    };
    onConfirm(updatedAction);
  };

  return (
    <div className="mt-3 p-3.5 bg-slate-950/95 border border-emerald-500/40 rounded-xl text-slate-100 shadow-2xl">
      {/* Header Badge */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
          <Camera className="w-4 h-4 flex-shrink-0" />
          <span className="leading-normal py-0.5">Vision AI Auto-List Proposal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="text-[10px] font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded border border-slate-700 transition-colors"
          >
            {isEditing ? 'View Summary' : '✏️ Edit Details'}
          </button>
          <span className="text-[10px] font-bold bg-emerald-600/30 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 flex-shrink-0">
            Auto-Detected
          </span>
        </div>
      </div>

      {/* Dual layer uncropped image preview (Rule 3) */}
      {displayImage && (
        <div className="relative rounded-lg overflow-hidden mb-3 border border-slate-800 bg-slate-900 h-36">
          <img
            src={displayImage}
            alt="Product preview"
            className="w-full h-full absolute inset-0 blur-xl opacity-40 object-cover"
          />
          <img
            src={displayImage}
            alt="Product preview"
            className="w-full h-full relative z-10 object-contain p-2"
          />
        </div>
      )}

      {/* Editable or Summary Fields */}
      {isEditing ? (
        <div className="space-y-2 mb-3 text-xs">
          {/* Product Title */}
          <div>
            <label className="block text-slate-400 text-[10px] font-semibold mb-1">
              Product Title / Name:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
              placeholder="e.g. Cosmic Original Car Paste Wax"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-slate-400 text-[10px] font-semibold mb-1">
              Category:
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Pricing & Stock Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-slate-400 text-[10px] font-semibold mb-1">
                Selling Price (PKR):
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-emerald-400 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-[10px] font-semibold mb-1">
                Competitor (PKR):
              </label>
              <input
                type="number"
                value={competitorPrice}
                onChange={(e) => setCompetitorPrice(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-rose-400 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-[10px] font-semibold mb-1">
                Initial Stock:
              </label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-3">
          <div className="mb-2">
            <span className="text-[10px] text-slate-400 font-semibold block">Identified Product:</span>
            <p className="font-bold text-white text-xs leading-snug">{name}</p>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px]">
            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 text-[9px] block">Selling Price</span>
              <span className="font-bold text-emerald-400 text-xs">
                PKR {price.toLocaleString()}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 text-[9px] block">Competitor Rate</span>
              <span className="line-through text-rose-400 text-[11px]">
                PKR {competitorPrice.toLocaleString()}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-slate-400 text-[9px] block">Category & Stock</span>
              <span className="font-semibold text-amber-300 text-[10px] block truncate leading-normal py-0.5">
                {category} • {stock} pcs
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
        <button
          type="button"
          disabled={isThinking || !name.trim()}
          onClick={handleConfirm}
          className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 flex-1 transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          <Check className="w-3.5 h-3.5" />
          <span>✅ Approve & Publish Live</span>
        </button>
        <button
          type="button"
          disabled={isThinking}
          onClick={onCancel}
          className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all active:scale-95 disabled:opacity-50"
        >
          <span>Cancel</span>
        </button>
      </div>
    </div>
  );
};
