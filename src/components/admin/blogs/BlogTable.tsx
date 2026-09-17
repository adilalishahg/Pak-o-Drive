import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  FileText,
  ShoppingBag,
  ExternalLink,
  Edit,
  Trash2,
  BookOpen,
  RefreshCw,
} from 'lucide-react';
import { BlogPostItem } from '@/hooks/useAdminBlogs';

interface BlogTableProps {
  posts: BlogPostItem[];
  loading: boolean;
  onTogglePublish: (post: BlogPostItem) => void;
  onEdit: (post: BlogPostItem) => void;
  onDeletePrompt: (id: string, title: string) => void;
}

export const BlogTable: React.FC<BlogTableProps> = ({
  posts,
  loading,
  onTogglePublish,
  onEdit,
  onDeletePrompt,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-orange-500" />
          <p className="text-sm">Loading articles...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="py-16 text-center text-slate-500">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <h3 className="text-base font-bold text-slate-800">No blog articles found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Use the AI Blog Writer above to automatically generate 1,200+ word guides tailored for Pakistani motorists.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-xs">
              <tr>
                <th className="py-3 px-4">Article</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Linked Gear</th>
                <th className="py-3 px-4">Read Time</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {posts.map((post) => (
                <tr key={post._id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Article Info */}
                  <td className="py-3.5 px-4 max-w-md">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden relative shrink-0 border border-slate-200">
                        {post.coverImage ? (
                          <Image
                            src={post.coverImage}
                            alt={post.title}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : (
                          <FileText className="w-6 h-6 text-slate-400 absolute inset-0 m-auto" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 line-clamp-1 hover:text-orange-600 transition-colors">
                          {post.title}
                        </h4>
                        <span className="text-xs text-slate-400 block font-mono mt-0.5">
                          /blog/{post.slug}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                      {post.category || 'Maintenance'}
                    </span>
                  </td>

                  {/* Status Toggle */}
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => onTogglePublish(post)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                        post.isPublished
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          post.isPublished ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                      />
                      {post.isPublished ? 'Live on Site' : 'Draft'}
                    </button>
                  </td>

                  {/* Featured Products Count */}
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-xs text-slate-600 font-medium">
                      <ShoppingBag className="w-3.5 h-3.5 text-orange-500" />
                      {post.featuredProducts?.length || 0} items
                    </span>
                  </td>

                  {/* Read Time */}
                  <td className="py-3.5 px-4 text-slate-500 text-xs">
                    {post.readTimeMinutes || 5} mins
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {post.isPublished && (
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="View published article"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      )}
                      <button
                        onClick={() => onEdit(post)}
                        className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit article"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeletePrompt(post._id, post.title)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete article"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
