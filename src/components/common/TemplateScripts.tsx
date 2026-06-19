'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

export default function TemplateScripts() {
  const pathname = usePathname();

  useEffect(() => {
    let pollInterval: ReturnType<typeof setInterval> | null = null;
    let attempts = 0;
    const MAX_ATTEMPTS = 80; // 8 seconds max

    const initAll = () => {
      const $ = (window as any).jQuery;
      if (!$ || !$.fn || !$.fn.owlCarousel) return false;

      // Hide spinner
      $('#spinner').removeClass('show');

      // Initialize WOW.js
      if ((window as any).WOW) {
        try {
          new (window as any).WOW().init();
        } catch (e) {
          console.error('Error initializing WOW:', e);
        }
      }

      // Sticky navbar handler
      $(window).off('scroll.navbar').on('scroll.navbar', () => {
        if ($(window).scrollTop() > 45) {
          $('.nav-bar').addClass('sticky-top shadow-sm');
        } else {
          $('.nav-bar').removeClass('sticky-top shadow-sm');
        }
      });

      // Back to top button
      $(window).off('scroll.backtotop').on('scroll.backtotop', () => {
        if ($(window).scrollTop() > 300) {
          $('.back-to-top').fadeIn('slow');
        } else {
          $('.back-to-top').fadeOut('slow');
        }
      });
      $('.back-to-top').off('click').on('click', function () {
        $('html, body').animate({ scrollTop: 0 }, 1500, 'easeInOutExpo');
        return false;
      });

      // ── Hero / Header Carousel ──────────────────────────────────────
      const $hero = $('.header-carousel');
      if ($hero.length > 0) {
        try {
          if ($hero.data('owl.carousel')) {
            $hero.trigger('destroy.owl.carousel').removeClass('owl-loaded');
            $hero.find('.owl-stage-outer').children().unwrap();
          }
          $hero.owlCarousel({
            items: 1,
            autoplay: true,
            smartSpeed: 1500,
            center: false,
            dots: false,
            loop: true,
            margin: 0,
            nav: true,
            navText: [
              '<i class="bi bi-arrow-left"></i>',
              '<i class="bi bi-arrow-right"></i>',
            ],
          });
        } catch (e) {
          console.error('Error initializing header-carousel:', e);
        }
      }

      // ── Product List Carousel ───────────────────────────────────────
      const $productList = $('.productList-carousel');
      if ($productList.length > 0) {
        try {
          if ($productList.data('owl.carousel')) {
            $productList.trigger('destroy.owl.carousel').removeClass('owl-loaded');
          }
          $productList.owlCarousel({
            autoplay: true,
            smartSpeed: 2000,
            dots: false,
            loop: true,
            margin: 25,
            nav: true,
            navText: [
              '<i class="fas fa-chevron-left"></i>',
              '<i class="fas fa-chevron-right"></i>',
            ],
            responsiveClass: true,
            responsive: {
              0:    { items: 1 },
              576:  { items: 1 },
              768:  { items: 2 },
              992:  { items: 2 },
              1200: { items: 3 },
            },
          });
        } catch (e) {
          console.error('Error initializing productList-carousel:', e);
        }
      }

      // ── Product Image Carousel ──────────────────────────────────────
      const $productImg = $('.productImg-carousel');
      if ($productImg.length > 0) {
        try {
          if ($productImg.data('owl.carousel')) {
            $productImg.trigger('destroy.owl.carousel').removeClass('owl-loaded');
          }
          $productImg.owlCarousel({
            autoplay: true,
            smartSpeed: 1500,
            dots: false,
            loop: true,
            items: 1,
            margin: 25,
            nav: true,
            navText: [
              '<i class="bi bi-arrow-left"></i>',
              '<i class="bi bi-arrow-right"></i>',
            ],
          });
        } catch (e) {
          console.error('Error initializing productImg-carousel:', e);
        }
      }

      // ── Single Product Carousel ─────────────────────────────────────
      const $single = $('.single-carousel');
      if ($single.length > 0) {
        try {
          if ($single.data('owl.carousel')) {
            $single.trigger('destroy.owl.carousel').removeClass('owl-loaded');
          }
          $single.owlCarousel({
            autoplay: true,
            smartSpeed: 1500,
            dots: true,
            dotsData: true,
            loop: true,
            items: 1,
            nav: true,
            navText: [
              '<i class="bi bi-arrow-left"></i>',
              '<i class="bi bi-arrow-right"></i>',
            ],
          });
        } catch (e) {
          console.error('Error initializing single-carousel:', e);
        }
      }

      // ── Related Products Carousel ───────────────────────────────────
      const $related = $('.related-carousel');
      if ($related.length > 0) {
        try {
          if ($related.data('owl.carousel')) {
            $related.trigger('destroy.owl.carousel').removeClass('owl-loaded');
          }
          $related.owlCarousel({
            autoplay: true,
            smartSpeed: 1500,
            dots: false,
            loop: true,
            margin: 25,
            nav: true,
            navText: [
              '<i class="fas fa-chevron-left"></i>',
              '<i class="fas fa-chevron-right"></i>',
            ],
            responsiveClass: true,
            responsive: {
              0:    { items: 1 },
              576:  { items: 1 },
              768:  { items: 2 },
              992:  { items: 3 },
              1200: { items: 4 },
            },
          });
        } catch (e) {
          console.error('Error initializing related-carousel:', e);
        }
      }

      return true; // success
    };

    const startPolling = () => {
      attempts = 0;
      if (pollInterval) clearInterval(pollInterval);

      pollInterval = setInterval(() => {
        attempts++;
        if (initAll()) {
          clearInterval(pollInterval!);
          pollInterval = null;
        } else if (attempts >= MAX_ATTEMPTS) {
          clearInterval(pollInterval!);
          pollInterval = null;
          console.warn('TemplateScripts: timed out waiting for jQuery/owlCarousel');
        }
      }, 100);
    };

    // Small delay to let DOM settle after route change
    const routeTimer = setTimeout(startPolling, 200);

    return () => {
      clearTimeout(routeTimer);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [pathname]);

  return (
    <>
      <Script
        src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.4/jquery.min.js"
        strategy="beforeInteractive"
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/js/bootstrap.bundle.min.js"
        strategy="afterInteractive"
      />
      <Script
        src="/lib/wow/wow.min.js"
        strategy="afterInteractive"
      />
      <Script
        src="/lib/owlcarousel/owl.carousel.min.js"
        strategy="afterInteractive"
      />
    </>
  );
}
