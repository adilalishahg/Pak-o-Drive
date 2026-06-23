'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSiteInfo } from '../../components/common/SiteInfoProvider';
import { useSiteTheme } from '../../components/common/DynamicThemeProvider';

/* ── Inline SVG icons ─────────────────────────────────────── */
const SvgLocation = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const SvgMail = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
  </svg>
);
const SvgPhone = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.34a2 2 0 0 1 2-2.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const SvgWhatsapp = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.59 1.977 14.113.953 11.98.953c-5.437 0-9.865 4.371-9.87 9.8a9.697 9.697 0 0 0 1.493 5.048l-.98 3.578 3.704-.962zm11.233-6.195c-.3-.15-1.771-.865-2.046-.964-.274-.1-.474-.15-.674.15-.2.3-.772.964-.947 1.162-.175.2-.35.226-.65.076-.3-.15-1.263-.46-2.405-1.466-.89-.785-1.49-1.754-1.665-2.053-.175-.3-.018-.462.13-.61.135-.133.3-.349.45-.523.15-.174.2-.3.3-.5.1-.2.05-.375-.025-.524-.075-.15-.674-1.609-.924-2.203-.244-.579-.493-.5-.674-.51-.175-.007-.375-.008-.574-.008-.2 0-.524.075-.798.374-.275.3-1.047 1.012-1.047 2.47 0 1.458 1.073 2.865 1.222 3.064.15.2 2.112 3.187 5.116 4.466.714.304 1.272.486 1.707.623.718.226 1.37.194 1.885.118.574-.085 1.771-.715 2.021-1.408.25-.694.25-1.288.175-1.408-.075-.12-.274-.195-.574-.346z" />
  </svg>
);

export default function ContactPage() {
  const { info } = useSiteInfo();
  const { theme } = useSiteTheme();
  const isCleanWhite = theme.layoutTheme === 'theme1';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('general');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const whatsappNumber = info.whatsapp || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+923185205667';

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSubmitted(true);
        // Reset form fields
        setName('');
        setEmail('');
        setPhone('');
        setSubject('');
        setMessage('');
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        throw new Error(json.error || 'Failed to submit form.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error occurred while sending your message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppChat = () => {
    const text = encodeURIComponent('Hi Pakodrive, I have an inquiry about products/support.');
    window.open(`https://wa.me/${whatsappNumber.replace('+', '')}?text=${text}`, '_blank');
  };

  if (isCleanWhite) {
    return (
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 bg-[#fafafa]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left side: Contact info */}
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block">Connect With Us</span>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">Get in Touch!</h1>
              <p className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-lg">
                We are here to help you accelerate your digital transformation. Whether you have a question about our products, need technical assistance, or want to explore collaboration opportunities, our team is ready to assist you.
              </p>
            </div>

            <div className="space-y-4 text-sm sm:text-base">
              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Address</h4>
                  <p className="text-slate-700 font-semibold mt-0.5 text-sm">{info.address || '786 Commercial Plaza, Karachi, Pakistan'}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.502-5.184-3.864-6.687-6.687l1.293-.97c.362-.272.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone</h4>
                  <p className="text-slate-700 font-semibold mt-0.5 text-sm">{info.phone || '+92-300-1234567'}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</h4>
                  <p className="text-slate-700 font-semibold mt-0.5 text-sm">{info.email || 'info@alpha-demo.co'}</p>
                </div>
              </div>

              {/* Support Hours */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Support Hours</h4>
                  <p className="text-slate-700 font-semibold mt-0.5 text-sm">24/7 Available Services</p>
                </div>
              </div>
            </div>

            {/* Social Icons */}
            <div className="border-t border-slate-100 pt-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Follow us online</h4>
              <div className="flex items-center gap-3">
                {['facebook', 'instagram', 'youtube', 'twitter', 'linkedin'].map((social, sIdx) => (
                  <a key={sIdx} href="#" className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors text-slate-500 text-xs font-bold text-decoration-none">
                    {social[0].toUpperCase()}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right side: Form */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-10 shadow-sm">
            {submitted && (
              <div className="alert alert-success rounded mb-4 py-3 px-4 text-xs font-semibold animate-fade-in" role="alert">
                ✓ Your message has been sent successfully. We will get back to you soon!
              </div>
            )}

            {error && (
              <div className="alert alert-danger rounded mb-4 py-3 px-4 text-xs font-semibold animate-fade-in" role="alert">
                ✗ {error}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleContactSubmit}>
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full bg-[#fafafa] border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-[#fafafa] border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800"
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full bg-[#fafafa] border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800"
                />
              </div>

              {/* Category Subject */}
              <div>
                <label htmlFor="subject" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category Subject</label>
                <select
                  id="subject"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full bg-[#fafafa] border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-600 font-medium"
                >
                  <option value="general">General Support</option>
                  <option value="order">Order Tracking & Status</option>
                  <option value="defect">Product Return or Defect</option>
                  <option value="partnership">Business Partnership</option>
                </select>
              </div>

              {/* Comment/Message */}
              <div>
                <label htmlFor="message" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Comment/Message *</label>
                <textarea
                  id="message"
                  rows={5}
                  required
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Write your message here..."
                  className="w-full bg-[#fafafa] border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-slate-900 hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-all shadow-md uppercase tracking-wider flex items-center justify-center border-0"
              >
                {loading ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="bg-white">
      {/* Single Page Header start */}
      <div className="container-fluid page-header py-5">
        <h1 className="text-center text-white display-6 wow fadeInUp" data-wow-delay="0.1s">
          Contact Us
        </h1>
        <ol className="breadcrumb justify-content-center mb-0 wow fadeInUp" data-wow-delay="0.3s">
          <li className="breadcrumb-item">
            <Link href="/" className="text-white text-decoration-none">
              Home
            </Link>
          </li>
          <li className="breadcrumb-item active text-white">Contact</li>
        </ol>
      </div>
      {/* Single Page Header End */}

      {/* Contact Start */}
      <div className="container-fluid contact py-5">
        <div className="container py-5">
          <div className="p-5 bg-light rounded">
            <div className="row g-4">
              <div className="col-12">
                <div className="text-center mx-auto wow fadeInUp" data-wow-delay="0.1s" style={{ maxWidth: '900px' }}>
                  <h4 className="text-primary border-bottom border-primary border-2 d-inline-block pb-2">
                    Get in touch
                  </h4>
                  <p className="mb-5 fs-5 text-dark">
                    Have any questions? We are here for you! Send us a message or contact us on WhatsApp.
                  </p>
                </div>
              </div>

              <div className="col-lg-7">
                <h5 className="text-primary wow fadeInUp" data-wow-delay="0.1s">Let’s Connect</h5>
                <h1 className="display-5 mb-4 wow fadeInUp" data-wow-delay="0.3s">Send Your Message</h1>

                {submitted && (
                  <div className="alert alert-success rounded mb-4 py-3 px-4" role="alert">
                    ✓ Your message has been sent successfully. We will get back to you soon!
                  </div>
                )}

                {error && (
                  <div className="alert alert-danger rounded mb-4 py-3 px-4" role="alert">
                    ✗ {error}
                  </div>
                )}

                <form onSubmit={handleContactSubmit}>
                  <div className="row g-4 wow fadeInUp" data-wow-delay="0.1s">
                    <div className="col-lg-12 col-xl-6">
                      <div className="form-floating">
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="form-control"
                          id="name"
                          placeholder="Your Name"
                        />
                        <label htmlFor="name">Your Name *</label>
                      </div>
                    </div>
                    <div className="col-lg-12 col-xl-6">
                      <div className="form-floating">
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="form-control"
                          id="email"
                          placeholder="Your Email"
                        />
                        <label htmlFor="email">Your Email *</label>
                      </div>
                    </div>
                    <div className="col-lg-12 col-xl-6">
                      <div className="form-floating">
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="form-control"
                          id="phone"
                          placeholder="Phone"
                        />
                        <label htmlFor="phone">Your Phone *</label>
                      </div>
                    </div>
                    <div className="col-lg-12 col-xl-6">
                      <div className="form-floating">
                        <input
                          type="text"
                          required
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="form-control"
                          id="subject"
                          placeholder="Subject"
                        />
                        <label htmlFor="subject">Subject *</label>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-floating">
                        <textarea
                          required
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="form-control"
                          placeholder="Leave a message here"
                          id="message"
                          style={{ height: '160px' }}
                        ></textarea>
                        <label htmlFor="message">Message *</label>
                      </div>
                    </div>
                    <div className="col-12">
                      <button type="submit" disabled={loading} className="btn btn-primary w-100 py-3 border-0">
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                            Sending...
                          </>
                        ) : (
                          'Send Message'
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              <div className="col-lg-5 wow fadeInUp" data-wow-delay="0.2s">
                <div className="h-100 rounded overflow-hidden shadow-sm" style={{ minHeight: '350px' }}>
                  <iframe
                    className="rounded w-100 h-100"
                    style={{ border: 0 }}
                    src={info.mapEmbedUrl}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>

              <div className="col-lg-12">
                <div className="row g-4 align-items-center justify-content-center text-center">
                  {[
                    { Icon: SvgLocation, label: 'Address', value: info.address, bg: 'linear-gradient(135deg,#7c3aed,#5b21b6)' },
                    { Icon: SvgMail, label: 'Mail Us', value: info.email, bg: 'linear-gradient(135deg,#0891b2,#0e7490)' },
                    { Icon: SvgPhone, label: 'Telephone', value: info.phone, bg: 'linear-gradient(135deg,#059669,#047857)' },
                    { Icon: SvgWhatsapp, label: 'WhatsApp', value: 'Chat with Support', bg: 'linear-gradient(135deg,#25D366,#1ebe57)', onClick: handleWhatsAppChat },
                  ].map(({ Icon, label, value, bg, onClick }) => (
                    <div key={label} className="col-md-6 col-lg-6 col-xl-3 wow fadeInUp">
                      <div
                        className="rounded bg-white p-4 h-100 shadow-sm"
                        style={{ cursor: onClick ? 'pointer' : 'default', transition: 'transform 0.2s, box-shadow 0.2s' }}
                        onClick={onClick}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 30px rgba(0,0,0,0.1)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
                      >
                        <div className="d-flex align-items-center justify-content-center mb-3 mx-auto rounded-circle" style={{ width: '64px', height: '64px', background: bg, boxShadow: '0 6px 18px rgba(0,0,0,0.15)' }}>
                          <span style={{ color: '#fff' }}><Icon /></span>
                        </div>
                        <h5 className="fw-bold mb-1" style={{ fontSize: '0.95rem' }}>{label}</h5>
                        <p className="mb-0 text-muted" style={{ fontSize: '0.85rem' }}>{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Contact End */}
    </div>
  );
}
