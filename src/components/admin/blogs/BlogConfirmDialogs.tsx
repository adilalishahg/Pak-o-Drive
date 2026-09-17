import React from 'react';
import { AlertCircle, Trash2, Zap, RefreshCw } from 'lucide-react';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  title: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const BlogDeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  isOpen,
  title,
  isDeleting,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
          <Trash2 className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Delete Blog Article</h3>
        <p className="text-sm text-slate-600 mt-2">
          Are you sure you want to delete <span className="font-semibold text-slate-900">"{title}"</span>? This action cannot be undone.
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                Delete Article
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

interface AutoBlogConfirmDialogProps {
  isOpen: boolean;
  isRunning: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const AutoBlogConfirmDialog: React.FC<AutoBlogConfirmDialogProps> = ({
  isOpen,
  isRunning,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
          <Zap className="w-6 h-6 fill-emerald-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Run Autonomous Auto-Blogger</h3>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          This will trigger the multi-model AI pipeline (Gemini / Groq) to autonomously pick a high-reach Pakistani automotive topic, research and compose an authoritative 1,200+ word article, link matching in-store accessories, and publish it live immediately.
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isRunning}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isRunning}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Triggering...
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 fill-current" />
                Confirm & Launch Now
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
