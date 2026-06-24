interface WelcomeEmailParams {
  siteName: string;
  logoText: string;
  supportEmail: string;
  phone: string;
  whatsapp: string;
  website: string;
}

export function getWelcomeEmailHtml({
  siteName,
  logoText,
  supportEmail,
  phone,
  whatsapp,
  website,
}: WelcomeEmailParams): string {
  // Format WhatsApp link correctly (remove non-digits except +)
  const cleanWhatsapp = whatsapp.replace(/[^\d+]/g, '');
  const whatsappUrl = `https://wa.me/${cleanWhatsapp.startsWith('+') ? cleanWhatsapp.substring(1) : cleanWhatsapp}`;
  const storeUrl = website.startsWith('http') ? website : `https://${website}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ${siteName}</title>
  <style>
    /* Reset & Clean styles for email clients */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    table { border-collapse: collapse !important; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f8fafc; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
    
    /* Responsive overrides */
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .feature-col { display: block !important; width: 100% !important; padding-left: 0 !important; padding-right: 0 !important; margin-bottom: 20px; }
      .header-text { font-size: 24px !important; }
      .coupon-box { padding: 15px !important; }
      .coupon-code { font-size: 28px !important; letter-spacing: 2px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc;">
  <!-- Email Wrapper -->
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 40px 10px 40px 10px;">
        
        <!-- Main Email Container -->
        <table border="0" cellpadding="0" cellspacing="0" width="600" class="email-container" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #edf2f7;">
          
          <!-- Header Banner (Premium Slate/Navy Gradient) -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 40px 40px; text-align: center;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 15px;">
                    <!-- Brand Icon Placeholder/Simulation -->
                    <span style="display: inline-block; width: 44px; height: 44px; line-height: 44px; border-radius: 12px; background-color: #3b82f6; color: #ffffff; font-size: 20px; font-weight: 900; text-align: center; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.4);">⚡</span>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <h1 class="header-text" style="color: #ffffff; font-size: 28px; font-weight: 800; margin: 0; letter-spacing: -0.5px; text-transform: uppercase;">${logoText}</h1>
                    <p style="color: #94a3b8; font-size: 14px; margin: 5px 0 0 0; font-weight: 500;">Welcome to the Future of Electronics</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Welcome Hero Section -->
          <tr>
            <td style="padding: 40px 40px 30px 40px; text-align: left;">
              <h2 style="color: #0f172a; font-size: 22px; font-weight: 700; margin-top: 0; margin-bottom: 12px;">Hey there! 👋</h2>
              <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-top: 0; margin-bottom: 20px;">
                Thank you for subscribing to our newsletter! You've just unlocked exclusive access to members-only product drops, flash sales, and early notifications on new arrivals.
              </p>
              <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-top: 0; margin-bottom: 25px;">
                As a token of our appreciation, here is a special welcome discount to use on your first purchase with us:
              </p>
              
              <!-- Coupon Box -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td class="coupon-box" align="center" style="background-color: #f0fdf4; border: 2px dashed #bbf7d0; border-radius: 12px; padding: 25px; text-align: center;">
                    <span style="color: #166534; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px;">Your Welcome Discount Code</span>
                    <div class="coupon-code" style="color: #15803d; font-size: 32px; font-weight: 800; letter-spacing: 4px; font-family: 'Courier New', Courier, monospace; margin-bottom: 5px;">ELECTRO10</div>
                    <span style="color: #166534; font-size: 13px; font-weight: 600;">Get 10% OFF on all premium tech accessories & products</span>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 25px;">
                <tr>
                  <td align="center">
                    <a href="${storeUrl}" target="_blank" style="background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 30px; font-size: 15px; font-weight: 700; border-radius: 10px; display: inline-block; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.25); border: 1px solid #2563eb;">Shop Store Now</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <hr style="border: 0; border-top: 1px solid #edf2f7; margin: 0;">
            </td>
          </tr>
          
          <!-- Key Features Title -->
          <tr>
            <td style="padding: 30px 40px 10px 40px; text-align: center;">
              <h3 style="color: #0f172a; font-size: 16px; font-weight: 700; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Why Shop With Us?</h3>
            </td>
          </tr>
          
          <!-- Features Grid -->
          <tr>
            <td style="padding: 10px 40px 30px 40px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <!-- Feature 1: Free Delivery -->
                  <td width="48%" class="feature-col" valign="top" style="background-color: #f8fafc; border-radius: 12px; padding: 15px 20px; border: 1px solid #f1f5f9;">
                    <div style="font-size: 20px; margin-bottom: 8px;">🚚</div>
                    <h4 style="color: #0f172a; font-size: 14px; font-weight: 700; margin-top: 0; margin-bottom: 6px;">Nationwide Delivery</h4>
                    <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 0;">Fast shipping with Cash on Delivery support across Pakistan.</p>
                  </td>
                  <!-- Spacer -->
                  <td width="4%"></td>
                  <!-- Feature 2: Return Policy -->
                  <td width="48%" class="feature-col" valign="top" style="background-color: #f8fafc; border-radius: 12px; padding: 15px 20px; border: 1px solid #f1f5f9;">
                    <div style="font-size: 20px; margin-bottom: 8px;">🔄</div>
                    <h4 style="color: #0f172a; font-size: 14px; font-weight: 700; margin-top: 0; margin-bottom: 6px;">30-Day Easy Returns</h4>
                    <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 0;">Not happy with the quality? Simply return/replace it hassle-free.</p>
                  </td>
                </tr>
                <tr><td height="16" colspan="3" style="font-size: 1px; line-height: 1px;">&nbsp;</td></tr>
                <tr>
                  <!-- Feature 3: Premium Products -->
                  <td width="48%" class="feature-col" valign="top" style="background-color: #f8fafc; border-radius: 12px; padding: 15px 20px; border: 1px solid #f1f5f9;">
                    <div style="font-size: 20px; margin-bottom: 8px;">💎</div>
                    <h4 style="color: #0f172a; font-size: 14px; font-weight: 700; margin-top: 0; margin-bottom: 6px;">100% Original Products</h4>
                    <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 0;">Only authentic and curated accessories and smart wearables.</p>
                  </td>
                  <!-- Spacer -->
                  <td width="4%"></td>
                  <!-- Feature 4: Live Support -->
                  <td width="48%" class="feature-col" valign="top" style="background-color: #f8fafc; border-radius: 12px; padding: 15px 20px; border: 1px solid #f1f5f9;">
                    <div style="font-size: 20px; margin-bottom: 8px;">💬</div>
                    <h4 style="color: #0f172a; font-size: 14px; font-weight: 700; margin-top: 0; margin-bottom: 6px;">WhatsApp Support</h4>
                    <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 0;">Have a query? Chat with us live on WhatsApp at any time.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <hr style="border: 0; border-top: 1px solid #edf2f7; margin: 0;">
            </td>
          </tr>
          
          <!-- Support & WhatsApp CTA Section -->
          <tr>
            <td style="padding: 30px 40px; text-align: center; background-color: #f8fafc;">
              <p style="color: #475569; font-size: 14px; line-height: 1.5; margin-top: 0; margin-bottom: 15px;">
                Need help with your first order or have any questions?
              </p>
              <table border="0" cellpadding="0" cellspacing="0" align="center">
                <tr>
                  <td align="center" style="border-radius: 8px; background-color: #25d366;">
                    <a href="${whatsappUrl}" target="_blank" style="padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 700; color: #ffffff; text-decoration: none; display: inline-block;">
                      Chat with us on WhatsApp (${phone})
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table> <!-- End Main Email Container -->
        
        <!-- Email Footer -->
        <table border="0" cellpadding="0" cellspacing="0" width="600" class="email-container" style="text-align: center; padding-top: 20px;">
          <tr>
            <td style="padding: 20px 40px; color: #64748b; font-size: 12px; line-height: 1.6;">
              <p style="margin: 0 0 10px 0;">
                You are receiving this email because you subscribed to the newsletter of <strong>${siteName}</strong>.
              </p>
              <p style="margin: 0 0 15px 0;">
                If you wish to stop receiving these updates, you can unsubscribe at any time by contacting our support team at <a href="mailto:${supportEmail}" style="color: #3b82f6; text-decoration: none;">${supportEmail}</a>.
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                &copy; ${new Date().getFullYear()} ${siteName}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
        
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
