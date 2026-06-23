'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UploadTask {
  id: string; // temp ID
  productId?: string;
  productName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'failed';
  url?: string;
  error?: string;
}

interface AdminUploadContextType {
  tasks: UploadTask[];
  startVideoUpload: (file: File, productName: string, productId?: string) => string;
  associateProductWithUpload: (tempId: string, productId: string) => void;
}

const AdminUploadContext = createContext<AdminUploadContextType | undefined>(undefined);

export function useAdminUpload() {
  const context = useContext(AdminUploadContext);
  if (!context) {
    throw new Error('useAdminUpload must be used within an AdminUploadProvider');
  }
  return context;
}

export function AdminUploadProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<UploadTask[]>([]);

  // Function to initiate video upload
  const startVideoUpload = (file: File, productName: string, productId?: string) => {
    const tempId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newTask: UploadTask = {
      id: tempId,
      productId,
      productName,
      progress: 0,
      status: 'uploading',
    };

    setTasks((prev) => [...prev, newTask]);

    // Perform upload using XMLHttpRequest to track progress
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload', true);
    xhr.setRequestHeader('authorization', 'Bearer pakodrive_admin_secret_token'); // set admin token

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setTasks((prev) =>
          prev.map((t) => (t.id === tempId ? { ...t, progress: percent } : t))
        );
      }
    };

    xhr.onload = async () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.success && response.url) {
            setTasks((prev) =>
              prev.map((t) =>
                t.id === tempId
                  ? { ...t, status: 'completed', progress: 100, url: response.url }
                  : t
              )
            );
            
            // If the product ID is already associated, trigger DB update immediately
            const currentTask = tasks.find(t => t.id === tempId);
            const targetProductId = productId || currentTask?.productId;
            if (targetProductId) {
              await updateProductVideoInDb(targetProductId, response.url);
            }
          } else {
            throw new Error(response.error || 'Upload response error');
          }
        } catch (err: any) {
          handleFailure(tempId, err.message || 'Error processing response');
        }
      } else {
        handleFailure(tempId, `HTTP error ${xhr.status}`);
      }
    };

    xhr.onerror = () => {
      handleFailure(tempId, 'Network error occurred during upload');
    };

    const formData = new FormData();
    formData.append('file', file);
    xhr.send(formData);

    return tempId;
  };

  const handleFailure = (tempId: string, errorMsg: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === tempId ? { ...t, status: 'failed', error: errorMsg } : t
      )
    );
  };

  // Asynchronously update product video field in DB
  const updateProductVideoInDb = async (productId: string, videoUrl: string) => {
    try {
      console.log(`Background: Updating product ${productId} with video URL: ${videoUrl}`);
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video: videoUrl }),
      });
      const data = await res.json();
      if (!data.success) {
        console.error('Failed to update product video in DB:', data.error);
      } else {
        console.log(`Background: Successfully updated product ${productId} video!`);
      }
    } catch (err) {
      console.error('Network error updating product video in DB:', err);
    }
  };

  // Associate a temporary upload task with a newly created product ID
  const associateProductWithUpload = (tempId: string, productId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === tempId ? { ...t, productId } : t))
    );

    // If the upload has already completed, update the DB now
    const task = tasks.find((t) => t.id === tempId);
    if (task && task.status === 'completed' && task.url) {
      updateProductVideoInDb(productId, task.url);
    }
  };

  // Auto update product video if the task completes and productId is assigned later
  useEffect(() => {
    tasks.forEach((task) => {
      if (task.status === 'completed' && task.productId && task.url) {
        // Run update once and remove productId to prevent loops
        updateProductVideoInDb(task.productId, task.url);
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, productId: undefined } : t))
        );
      }
    });
  }, [tasks]);

  return (
    <AdminUploadContext.Provider value={{ tasks, startVideoUpload, associateProductWithUpload }}>
      {children}

      {/* Floating background upload manager notification badge */}
      {tasks.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            width: '320px',
            maxHeight: '400px',
            overflowY: 'auto',
          }}
          className="d-flex flex-column gap-2"
        >
          {tasks.map((task) => (
            <div
              key={task.id}
              className="card border-0 shadow-lg p-3 rounded-4 bg-white"
              style={{
                borderLeft:
                  task.status === 'completed'
                    ? '4px solid #10b981'
                    : task.status === 'failed'
                    ? '4px solid #ef4444'
                    : '4px solid #f97316',
              }}
            >
              <div className="d-flex align-items-center justify-content-between mb-1">
                <span className="fw-bold text-dark text-truncate" style={{ fontSize: '0.85rem', maxWidth: '180px' }}>
                  {task.productName}
                </span>
                <span
                  className={`badge text-xs px-2 py-0.5 rounded-pill ${
                    task.status === 'completed'
                      ? 'bg-success-subtle text-success'
                      : task.status === 'failed'
                      ? 'bg-danger-subtle text-danger'
                      : 'bg-warning-subtle text-warning'
                  }`}
                  style={{ fontSize: '0.7rem' }}
                >
                  {task.status === 'completed'
                    ? 'Completed'
                    : task.status === 'failed'
                    ? 'Failed'
                    : `${task.progress}%`}
                </span>
              </div>
              <p className="text-muted mb-2" style={{ fontSize: '0.75rem' }}>
                {task.status === 'uploading'
                  ? 'Uploading product video in background...'
                  : task.status === 'failed'
                  ? `Upload failed: ${task.error || 'Unknown error'}`
                  : 'Video uploaded and saved to product details!'}
              </p>
              {task.status === 'uploading' && (
                <div className="progress" style={{ height: '6px' }}>
                  <div
                    className="progress-bar progress-bar-striped progress-bar-animated bg-warning"
                    role="progressbar"
                    style={{ width: `${task.progress}%` }}
                    aria-valuenow={task.progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
              )}
              {task.status !== 'uploading' && (
                <button
                  onClick={() => setTasks((prev) => prev.filter((t) => t.id !== task.id))}
                  className="btn btn-link text-muted p-0 text-decoration-none text-end w-100"
                  style={{ fontSize: '0.7rem' }}
                >
                  Dismiss
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminUploadContext.Provider>
  );
}
