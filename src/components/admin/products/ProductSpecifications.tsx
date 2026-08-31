'use client';

import React from 'react';
import { SpecInput } from '../../../hooks/useProductForm';

interface ProductSpecificationsProps {
  specs: SpecInput[];
  onAddSpecRow: () => void;
  onRemoveSpecRow: (index: number) => void;
  onSpecChange: (index: number, field: 'key' | 'value', value: string) => void;
}

export function ProductSpecifications({
  specs,
  onAddSpecRow,
  onRemoveSpecRow,
  onSpecChange,
}: ProductSpecificationsProps) {
  return (
    <div className="card border-0 shadow-sm rounded-4 mb-4">
      <div className="card-header bg-transparent border-0 py-3 px-4 d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div>
          <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
            <i className="fas fa-list-ul text-primary" /> Technical Specifications
          </h6>
          <span className="text-muted small" style={{ fontSize: '0.78rem' }}>
            Add key technical attributes (e.g. Battery Life, Connectivity, Material, Warranty).
          </span>
        </div>
        <button
          type="button"
          onClick={onAddSpecRow}
          className="btn btn-outline-primary btn-sm rounded-pill px-3"
        >
          <i className="fas fa-plus me-1" /> Add Spec
        </button>
      </div>

      <div className="card-body p-4 pt-0">
        <div className="d-flex flex-column gap-2">
          {specs.map((s, idx) => (
            <div key={idx} className="d-flex align-items-center gap-2">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Attribute (e.g. Battery)"
                value={s.key}
                onChange={(e) => onSpecChange(idx, 'key', e.target.value)}
                style={{ maxWidth: '200px' }}
              />
              <input
                type="text"
                className="form-control form-control-sm flex-grow-1"
                placeholder="Value (e.g. 40 Hours Playtime with ANC)"
                value={s.value}
                onChange={(e) => onSpecChange(idx, 'value', e.target.value)}
              />
              <button
                type="button"
                onClick={() => onRemoveSpecRow(idx)}
                disabled={specs.length === 1}
                className="btn btn-outline-danger btn-sm px-2"
                title="Remove Row"
              >
                <i className="fas fa-trash-alt" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
