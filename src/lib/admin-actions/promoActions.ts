import Promotion from '../../models/Promotion';
import Category from '../../models/Category';
import CampaignOffer from '../../models/CampaignOffer';
import Product from '../../models/Product';
import { AdminActionResult } from '../adminActionEngine';

export async function handlePromoActions(
  operation: string,
  params: any,
  confirmed: boolean
): Promise<AdminActionResult | null> {
  if (operation === 'create_promotion') {
    const { code, discountPercent = 15, expiryDays = 30 } = params;
    const cleanCode = (code || 'SAVE15').toUpperCase().replace(/[^\w]/g, '');

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + (expiryDays || 30));

    await Promotion.findOneAndUpdate(
      { code: cleanCode },
      { code: cleanCode, discountPercent, isActive: true, expiryDate },
      { upsert: true, new: true }
    );

    return {
      handled: true,
      reply: `🎟️ **Coupon Code Created!**\n- Code: **${cleanCode}**\n- Discount: **${discountPercent}% OFF**\n- Valid for: **${expiryDays} Days** (Expires: ${expiryDate.toLocaleDateString()})`,
      actionExecuted: {
        type: 'create_promotion',
        description: `Created coupon ${cleanCode} with ${discountPercent}% discount`,
      },
    };
  }

  if (operation === 'create_category') {
    const { name, parentCategory = '' } = params;
    if (!name) return { handled: true, reply: '❌ Category ka naam likhna zaroori hai.' };

    const slug = name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    await Category.findOneAndUpdate(
      { slug },
      { name, slug, parentCategory, icon: 'fas fa-car' },
      { upsert: true, new: true }
    );

    return {
      handled: true,
      reply: `📁 **Category Created!** "${name}" (Slug: ${slug}) successfully add ho chuki hai.`,
      actionExecuted: {
        type: 'create_category',
        description: `Category ${name} created`,
      },
    };
  }

  if (operation === 'create_flash_sale') {
    const { theme = 'Weekend Mega Flash Sale', discountPercent = 20, durationHours = 48 } = params;

    const topProducts = await Product.find({ isFeatured: true }).limit(4).lean()
      || await Product.find().limit(4).lean();

    const campaignProducts = topProducts.map((p: any) => ({
      productId: p._id.toString(),
      name: p.name,
      slug: p.slug || '',
      image: p.image || '',
      originalPrice: p.price,
      offerPrice: Math.round(p.price * (1 - discountPercent / 100)),
      discountPercent,
    }));

    const cleanCode = (theme.replace(/[^\w]/g, '').slice(0, 6) + `${discountPercent}`).toUpperCase();

    if (!confirmed) {
      return {
        handled: true,
        reply: `⚡ **New Flash Sale Campaign Proposal!**\n\n- **Campaign Title:** ${theme}\n- **Discount:** **${discountPercent}% OFF**\n- **Duration:** **${durationHours} Hours** Countdown\n- **Synchronized Coupon Code:** **${cleanCode}**\n- **Products Included (${campaignProducts.length}):**\n${campaignProducts.map((cp: any) => `  • ${cp.name}: PKR ${cp.originalPrice.toLocaleString()} ➔ **PKR ${cp.offerPrice.toLocaleString()}**`).join('\n')}\n\nKia main yeh Flash Sale store homepage par live activate kar doon?`,
        actionRequired: {
          id: `act_${Date.now()}`,
          type: 'create_flash_sale',
          title: `Launch Flash Sale: ${theme}`,
          description: `${discountPercent}% OFF on ${campaignProducts.length} items • Coupon: ${cleanCode}`,
          count: campaignProducts.length,
          payload: {
            operation: 'create_flash_sale',
            params: {
              theme,
              discountPercent,
              durationHours,
              cleanCode,
              campaignProducts,
            },
          },
        },
      };
    }

    const { cleanCode: codeToCreate, campaignProducts: savedProducts } = params;
    const expiryDate = new Date(Date.now() + durationHours * 3600 * 1000);

    await CampaignOffer.findOneAndUpdate(
      { title: theme },
      {
        title: theme,
        badge: '⚡ FLASH SALE • LIMITED TIME',
        subtitle: `Save up to ${discountPercent}% on Twin Cities top trending car accessories.`,
        offerType: 'flash_sale',
        products: savedProducts || campaignProducts,
        expiryDate,
        isActive: true,
        bgTheme: 'sunset_orange',
        placement: 'below_slider',
        showCountdownTimer: true,
        showSavingsBadge: true,
      },
      { upsert: true, new: true }
    );

    await Promotion.findOneAndUpdate(
      { code: codeToCreate || cleanCode },
      {
        code: codeToCreate || cleanCode,
        discountPercent,
        expiryDate,
        isActive: true,
      },
      { upsert: true, new: true }
    );

    return {
      handled: true,
      reply: `🎉 **Flash Sale Live on Homepage!**\n\n- **Campaign:** ${theme}\n- **Discount:** ${discountPercent}% OFF\n- **Coupon Active:** \`${codeToCreate || cleanCode}\`\n- **Expiry:** ${expiryDate.toLocaleString()}\n- **Homepage Placement:** Below hero slider with live countdown timer.\n\nAapka flash sale campaign homepage par active ho chuka hai!`,
      actionExecuted: {
        type: 'create_flash_sale',
        description: `Launched Flash Sale "${theme}" with coupon ${codeToCreate || cleanCode}`,
      },
    };
  }

  return null;
}
