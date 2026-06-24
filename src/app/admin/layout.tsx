'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { AdminUploadProvider } from '../../context/AdminUploadContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (pathname === '/admin/login') {
      setAuthorized(true);
      return;
    }
    const token = localStorage.getItem('admin_token');
    if (token !== 'pakodrive_admin_secret_token') {
      router.push('/admin/login');
    } else {
      setAuthorized(true);
    }
  }, [router, pathname]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    document.cookie = "admin_token=; path=/; max-age=0";
    router.push('/admin/login');
  };

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!authorized) {
    return (
      <div
        className="d-flex align-items-center justify-content-center min-vh-100"
        style={{ background: '#0f172a', color: '#ffffff' }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: 'fas fa-chart-line' },
    { name: 'Products', path: '/admin/products', icon: 'fas fa-box' },
    { name: 'Categories', path: '/admin/categories', icon: 'fas fa-tags' },
    { name: 'Orders & Sales', path: '/admin/orders', icon: 'fas fa-shopping-cart' },
    { name: 'Promotions', path: '/admin/promotions', icon: 'fas fa-percentage' },
    { name: 'Inbox Messages', path: '/admin/contacts', icon: 'fas fa-envelope' },
    { name: 'Newsletter Subscribers', path: '/admin/subscribers', icon: 'fas fa-users' },
    { name: 'Analytics Deep-Dive', path: '/admin/analytics', icon: 'fas fa-chart-bar' },
    { name: 'Theme & Appearance', path: '/admin/theme', icon: 'fas fa-palette' },
    { name: 'Site Info & Policies', path: '/admin/site-info', icon: 'fas fa-info-circle' },
  ];

  return (
    <AdminUploadProvider>
      <div
        className="d-flex min-vh-100"
        style={{
          background: '#f8fafc',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <style dangerouslySetInnerHTML={{ __html: `
          @media (max-width: 768px) {
            .admin-sidebar {
              position: fixed !important;
              top: 0 !important;
              left: 0 !important;
              width: 100% !important;
              height: 100vh !important;
              z-index: 2000 !important;
              transform: ${sidebarOpen ? 'translateY(0)' : 'translateY(-100%)'} !important;
              opacity: ${sidebarOpen ? '1' : '0'} !important;
              visibility: ${sidebarOpen ? 'visible' : 'hidden'} !important;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
              max-width: 100% !important;
            }
            .admin-sidebar-nav-container {
              display: flex !important;
              flex-direction: column !important;
              justify-content: center !important;
              align-items: center !important;
            }
            .admin-sidebar-nav {
              align-items: center !important;
              justify-content: center !important;
              text-align: center !important;
              width: 100% !important;
              gap: 1.25rem !important;
            }
            .admin-sidebar-link {
              justify-content: center !important;
              width: 100% !important;
              font-size: 1.15rem !important;
              padding: 12px 20px !important;
            }
            .admin-header-title {
              font-size: 1.1rem !important;
              max-width: 240px !important;
              white-space: nowrap !important;
              overflow: hidden !important;
              text-overflow: ellipsis !important;
            }
          }
        `}} />

        {/* Sidebar */}
        <div
          style={{
            width: sidebarOpen ? '260px' : '0px',
            overflow: 'hidden',
            background: '#0f172a',
            color: '#e2e8f0',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '4px 0 20px rgba(0,0,0,0.08)',
            zIndex: 1000,
            position: 'sticky',
            top: 0,
            height: '100vh',
          }}
          className="d-flex flex-column admin-sidebar"
        >
          {/* Brand */}
          <div className="p-4 border-bottom border-secondary d-flex align-items-center justify-content-between">
            <Link href="/admin" className="text-decoration-none d-flex align-items-center gap-2">
              <div
                className="d-flex align-items-center justify-content-center rounded"
                style={{
                  width: '36px',
                  height: '36px',
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                }}
              >
                <i className="fas fa-shopping-bag text-white" />
              </div>
              <span className="fw-bold text-white fs-5" style={{ letterSpacing: '-0.5px' }}>
                PAKODRIVE
              </span>
            </Link>
            <span className="badge bg-secondary px-2 py-1 text-xs uppercase d-none d-md-inline-block" style={{ fontSize: '0.65rem' }}>
              Admin
            </span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="btn btn-link text-white p-0 d-md-none border-0"
              style={{ textDecoration: 'none' }}
              aria-label="Close sidebar"
            >
              <i className="fas fa-times fs-4" />
            </button>
          </div>

          {/* Navigation links */}
          <div className="flex-grow-1 p-3 overflow-y-auto admin-sidebar-nav-container">
            <ul className="nav flex-column gap-2 admin-sidebar-nav">
              {menuItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <li key={item.path} className="nav-item">
                    <Link
                      href={item.path}
                      onClick={() => {
                        if (window.innerWidth <= 768) {
                          setSidebarOpen(false);
                        }
                      }}
                      className="nav-link d-flex align-items-center gap-3 px-3 py-2.5 rounded-3 text-decoration-none transition-all admin-sidebar-link"
                      style={{
                        color: isActive ? '#ffffff' : '#94a3b8',
                        background: isActive ? 'linear-gradient(to right, #ea580c, #f97316)' : 'transparent',
                        fontWeight: isActive ? 600 : 500,
                        boxShadow: isActive ? '0 4px 12px rgba(249, 115, 22, 0.2)' : 'none',
                      }}
                    >
                      <i className={`${item.icon} fs-5`} style={{ width: '20px' }} />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Footer info & logout */}
          <div className="p-3 border-top border-secondary bg-black bg-opacity-25">
            <button
              onClick={handleLogout}
              className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 border-0"
              style={{ fontWeight: 500 }}
            >
              <i className="fas fa-sign-out-alt" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Main Workspace Area */}
        <div className="flex-grow-1 d-flex flex-column min-w-0" style={{ height: '100vh', overflowY: 'auto' }}>
          {/* Top Navbar Header */}
          <header
            className="bg-white border-bottom px-4 py-3 d-flex align-items-center justify-content-between sticky-top"
            style={{ height: '70px', zIndex: 99 }}
          >
            <div className="d-flex align-items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="btn btn-light rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: '40px', height: '40px' }}
                aria-label="Toggle sidebar"
              >
                <i className="fas fa-bars text-dark" />
              </button>
              <h4 className="fw-bold mb-0 text-secondary admin-header-title" style={{ letterSpacing: '-0.3px' }}>
                {menuItems.find((item) => item.path === pathname)?.name || 'Admin Panel'}
              </h4>
            </div>

            <div className="d-flex align-items-center gap-3">
              <Link
                href="/"
                target="_blank"
                className="btn btn-outline-secondary btn-sm rounded-pill px-3 d-flex align-items-center gap-1.5"
                style={{ fontWeight: 500 }}
              >
                <i className="fas fa-external-link-alt" />
                <span className="d-none d-sm-inline">View Storefront</span>
              </Link>
              <div className="vr text-muted my-2" />
              <div className="d-flex align-items-center gap-2">
                <div
                  className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white fw-bold"
                  style={{ width: '38px', height: '38px', fontSize: '0.9rem' }}
                >
                  AD
                </div>
                <div className="d-none d-md-block text-start">
                  <p className="mb-0 fw-bold text-dark lh-1" style={{ fontSize: '0.85rem' }}>
                    Adil Admin
                  </p>
                  <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                    Superuser
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Content Body */}
          <main className="p-4 flex-grow-1" style={{ maxWidth: '1600px', width: '100%', margin: '0 auto' }}>
            {children}
          </main>
        </div>
      </div>
    </AdminUploadProvider>
  );
}
