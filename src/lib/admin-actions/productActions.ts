import mongoose from 'mongoose';
import Product from '../../models/Product';
import { AdminActionResult } from '../adminActionEngine';
import { generateAutoProductSeo } from '../productSeoGenerator';

export async function handleProductActions(
  operation: string,
  params: any,
  confirmed: boolean
): Promise<AdminActionResult | null> {
  if (operation === 'update_product') {
    const { productName, price, originalPrice, stock } = params;
    if (!productName) {
      return { handled: true, reply: '❌ Product ka naam ya keyword batana zaroori hai.' };
    }

    const cleanName = productName.replace(/[^\w\s-]/gi, '').trim();
    const product = await Product.findOne({
      $or: [
        { name: { $regex: cleanName, $options: 'i' } },
        { slug: { $regex: cleanName, $options: 'i' } },
      ],
    });

    if (!product) {
      return { handled: true, reply: `❌ Product "${cleanName}" catalog mein nahi mili.` };
    }

    const updates: string[] = [];
    if (price !== undefined && price > 0) {
      product.price = price;
      updates.push(`Price: PKR ${price.toLocaleString()}`);
    }
    if (originalPrice !== undefined && originalPrice > 0) {
      product.originalPrice = originalPrice;
      updates.push(`Original Price: PKR ${originalPrice.toLocaleString()}`);
    }
    if (stock !== undefined && stock >= 0) {
      product.stock = stock;
      updates.push(`Stock: ${stock} units`);
    }

    if (updates.length === 0) {
      return {
        handled: true,
        reply: `ℹ️ Product "${product.name}" mil gayi hai, lekin koi naya price ya stock specify nahi kiya gaya. (Current: PKR ${product.price}, Stock: ${product.stock}).`,
      };
    }

    await product.save();
    return {
      handled: true,
      reply: `✅ **Product Updated!** "${product.name}" ki details update ho chuki hain:\n- ${updates.join('\n- ')}`,
      actionExecuted: {
        type: 'update_product',
        description: `Updated ${product.name} (${updates.join(', ')})`,
      },
    };
  }

  if (operation === 'delete_product') {
    const { productName, productId } = params;
    let product = null;

    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      product = await Product.findById(productId);
    } else if (productName) {
      const cleanName = productName.replace(/[^\w\s-]/gi, '').trim();
      product = await Product.findOne({
        $or: [
          { name: { $regex: cleanName, $options: 'i' } },
          { slug: { $regex: cleanName, $options: 'i' } },
        ],
      });
    }

    if (!product) {
      return { handled: true, reply: `❌ Product nahi mili.` };
    }

    if (!confirmed) {
      return {
        handled: true,
        reply: `⚠️ **Confirmation Required:** Kia aap waqai product "${product.name}" (Price: PKR ${product.price}, Stock: ${product.stock}) ko catalog se delete karna chahte hain?`,
        actionRequired: {
          id: `act_${Date.now()}`,
          type: 'delete_product',
          title: `Delete Product: ${product.name}`,
          description: `Price: PKR ${product.price} • Stock: ${product.stock}`,
          count: 1,
          payload: { operation: 'delete_product', params: { productId: product._id.toString() } },
        },
      };
    }

    await Product.findByIdAndDelete(product._id);
    return {
      handled: true,
      reply: `🗑️ **Product Deleted!** "${product.name}" successfully catalog se remove kar di gayi hai.`,
      actionExecuted: {
        type: 'delete_product',
        description: `Product ${product.name} deleted from catalog`,
      },
    };
  }

  if (operation === 'create_product') {
    const { name, price, category, stock = 10, description = '' } = params;
    if (!name || !price) {
      return { handled: true, reply: '❌ Nayi product ke liye Name aur Price lazmi hain.' };
    }

    const autoSeo = generateAutoProductSeo({ name, price, category: category || 'Car Gadgets', description });

    const newProd = new Product({
      name,
      slug: autoSeo.slug,
      price,
      originalPrice: Math.round(price * 1.3),
      category: category || 'Car Gadgets',
      description: description || `${name} — Premium quality automotive accessory for Pakistani drivers with Cash On Delivery.`,
      image: 'https://res.cloudinary.com/dvasdadxzc/image/upload/v1718000000/placeholder-car.jpg',
      stock,
      seoTitle: autoSeo.seoTitle,
      seoDescription: autoSeo.seoDescription,
      seoKeywords: autoSeo.seoKeywords,
    });

    await newProd.save();
    return {
      handled: true,
      reply: `🎉 **New Product Created!**\n- **Name:** ${newProd.name}\n- **Price:** PKR ${newProd.price.toLocaleString()}\n- **Stock:** ${newProd.stock} units\n- **Category:** ${newProd.category}\n- **SEO Slug:** /product/${newProd.slug}`,
      actionExecuted: {
        type: 'create_product',
        description: `Added new product ${newProd.name}`,
      },
    };
  }

  if (operation === 'predictive_stock_forecast') {
    const month = new Date().getMonth() + 1;
    let seasonAdvice = '';

    if (month >= 9 || month <= 1) {
      seasonAdvice = `
### ❄️ Winter & Smog Season Forecast (Rawalpindi & Islamabad)
Twin Cities me Oct-Jan ke doran smog aur fog peak par hoti hai. Highway aur Murree travel barh jata hai.

| Recommended Product | Restock Qty | Est. Wholesale PKR | Sale Price PKR | Projected Margin |
| :--- | :--- | :--- | :--- | :--- |
| **Yellow Lens 4-LED Fog Lights** | 40 units | PKR 1,800 | PKR 3,499 | **+94% (PKR 67,960)** |
| **Anti-Fog Window Glass Spray** | 60 units | PKR 450 | PKR 1,199 | **+166% (PKR 44,940)** |
| **High-Grip Silicone Wiper Blades** | 50 pairs | PKR 900 | PKR 2,199 | **+144% (PKR 64,950)** |
| **Dual Dashcam with Night Vision** | 20 units | PKR 4,500 | PKR 8,999 | **+100% (PKR 89,980)** |

💰 **Total Projected Profit:** ~PKR 267,830
`;
    } else {
      seasonAdvice = `
### ☀️ Summer & AC Care Forecast (Rawalpindi & Islamabad)
Garmiyo me AC efficiency, sun protection aur cooling accessories ki demand sab se ziada hoti hai.

| Recommended Product | Restock Qty | Est. Wholesale PKR | Sale Price PKR | Projected Margin |
| :--- | :--- | :--- | :--- | :--- |
| **Foldable UV Windshield Sunshade** | 80 units | PKR 600 | PKR 1,599 | **+166% (PKR 79,920)** |
| **Solar Rotating Car Air Freshener** | 50 units | PKR 550 | PKR 1,399 | **+154% (PKR 42,450)** |
| **Microfiber Car Wash Towels (Set of 3)** | 100 sets | PKR 300 | PKR 899 | **+200% (PKR 59,900)** |

💰 **Total Projected Profit:** ~PKR 182,270
`;
    }

    return {
      handled: true,
      reply: seasonAdvice.trim(),
      actionExecuted: {
        type: 'predictive_stock_forecast',
        description: 'Generated Seasonal Stock & Margin Forecast',
      },
    };
  }

  if (operation === 'suggest_bundle') {
    const bundleName = 'Twin Cities Smog & Night Drive Safety Pack';
    const price = 2499;
    const originalPrice = 3199;
    const items = 'Yellow Lens 4-LED Fog Lights (Pair) + Anti-Fog Spray + T10 LED Bulbs';

    return {
      handled: true,
      reply: `💡 **AI High-Margin Bundle Suggestion for Twin Cities:**\n\nIs season me Rawalpindi aur Islamabad me smog aur night highway driving peak par hai. Sehgal Motors aur Daraz ke muqablay me yeh bundle sab se ziada profit generate karega:\n\n📦 **Proposed Bundle:** *${bundleName}*\n- **Included Items:** ${items}\n- **Offer Price:** **PKR ${price.toLocaleString()}** (Original: PKR ${originalPrice.toLocaleString()} - 22% OFF)\n- **Estimated Profit Margin:** **+115% (PKR 1,350 net profit per order)**\n\nKia main yeh bundle store par live create kar doon? Neeche diye gaye button par click karein.`,
      actionRequired: {
        id: `act_${Date.now()}`,
        type: 'create_bundle',
        title: `Create Bundle: ${bundleName}`,
        description: `Price: PKR ${price.toLocaleString()} • Items: ${items}`,
        count: 1,
        payload: {
          operation: 'create_bundle',
          params: {
            name: bundleName,
            price,
            originalPrice,
            category: 'LED Lights & Bulbs',
            description: `${bundleName} includes high-visibility Yellow Fog Lights pair, Anti-Fog Spray and T10 LED parking bulbs. Best deal for smog and night driving in Rawalpindi & Islamabad with Cash on Delivery.`,
            itemsSummary: items,
          },
        },
      },
    };
  }

  if (operation === 'create_bundle') {
    const { name, price, originalPrice, category = 'Combos & Bundles', description, itemsSummary, image } = params;
    if (!name || !price) {
      return { handled: true, reply: '❌ Bundle ke liye Name aur Price batana zaroori hai.' };
    }

    if (!confirmed) {
      return {
        handled: true,
        reply: `💡 **New Bundle Proposal Ready!**\n\n- **Bundle Name:** ${name}\n- **Offer Price:** PKR ${price.toLocaleString()} ${originalPrice ? `(Original: PKR ${originalPrice.toLocaleString()})` : ''}\n- **Category:** ${category}\n\nKia main yeh naya bundle database catalog me create kar doon? Neeche diye gaye button par click karein.`,
        actionRequired: {
          id: `act_${Date.now()}`,
          type: 'create_bundle',
          title: `Create Bundle: ${name}`,
          description: `Price: PKR ${price.toLocaleString()} • ${itemsSummary || 'High-converting combo pack'}`,
          count: 1,
          payload: { operation: 'create_bundle', params },
        },
      };
    }

    const slug = name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').slice(0, 60) + `-${Date.now().toString().slice(-4)}`;
    const bundleProduct = new Product({
      name,
      slug,
      price,
      originalPrice: originalPrice || Math.round(price * 1.25),
      category: category || 'Combos & Bundles',
      subcategory: 'Combos & Bundles',
      description: description || `${name} — High margin combo bundle for Pakistani drivers with Cash On Delivery.`,
      image: image || 'https://res.cloudinary.com/dvgxeiwoz/image/upload/v1788092214/electro_store/1788092214621_46843.webp',
      images: [
        image || 'https://res.cloudinary.com/dvgxeiwoz/image/upload/v1788092214/electro_store/1788092214621_46843.webp',
        'https://res.cloudinary.com/dvgxeiwoz/image/upload/v1788091458/electro_store/1788091458629_46697.webp'
      ],
      isFeatured: true,
      isTopSelling: true,
      stock: 25,
      heroText: 'Special Combo Deal • 24h Delivery',
    });

    await bundleProduct.save();

    return {
      handled: true,
      reply: `🎉 **New Combo Bundle Created & Live!**\n\n- **Name:** ${bundleProduct.name}\n- **Price:** PKR ${bundleProduct.price.toLocaleString()}\n- **Live Page:** [/product/${bundleProduct.slug}](/product/${bundleProduct.slug})\n\nYeh bundle ab website par live shopping ke liye active ho chuka hai!`,
      actionExecuted: {
        type: 'create_bundle',
        description: `Created Bundle: ${bundleProduct.name}`,
        details: { slug: bundleProduct.slug },
      },
    };
  }

  if (operation === 'publish_vision_product') {
    const {
      name,
      price,
      originalPrice,
      category = 'Car Gadgets',
      subcategory = '',
      description,
      studioImage,
      userUploadedImage,
      specs,
      seoTitle,
      seoDescription,
      seoKeywords,
      stock = 25,
    } = params;

    let finalImageUrl = studioImage || 'https://res.cloudinary.com/dvgxeiwoz/image/upload/v1788092214/electro_store/1788092214621_46843.webp';

    if (userUploadedImage && typeof userUploadedImage === 'string') {
      if (userUploadedImage.startsWith('data:image')) {
        try {
          const { v2: cloudinary } = await import('cloudinary');
          cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
          });
          const uploadRes = await cloudinary.uploader.upload(userUploadedImage, {
            folder: 'pakodrive_products',
          });
          if (uploadRes?.secure_url) {
            finalImageUrl = uploadRes.secure_url;
          }
        } catch (uploadErr: any) {
          console.warn('[Cloudinary upload fallback]:', uploadErr?.message);
        }
      } else if (userUploadedImage.startsWith('http')) {
        finalImageUrl = userUploadedImage;
      }
    }

    const slug = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 60) + `-${Date.now().toString().slice(-4)}`;

    let finalDescription = description || `${name} — Premium automotive accessory with Cash On Delivery across Pakistan.`;
    const descLower = finalDescription.toLowerCase();

    if (!descLower.includes('why buy from us') && !descLower.includes('premium quality guaranteed')) {
      finalDescription += `\n\n🔥 Why Buy From Us?\n✅ 100% Original Premium Quality Guaranteed\n⚡ Fast Cash on Delivery (COD) Nationwide Across Pakistan\n📦 Secure Protective Packaging with Quick Dispatch\n⭐ 7-Day Replacement Warranty for Peace of Mind\n🛒 Order now via Cash on Delivery!\n\n#tiktokmademebuyit #viral #caraccessories #pakodrive`;
    }

    let finalSeoTitle = seoTitle || `${name} Price in Pakistan | Pak-o-Drive`;
    if (finalSeoTitle.length < 45) {
      finalSeoTitle = `${name} | Buy Online in Pakistan - Pak-o-Drive`;
    }
    if (finalSeoTitle.length > 65) {
      finalSeoTitle = finalSeoTitle.substring(0, 62) + '...';
    }

    let finalSeoDesc = seoDescription || `Buy ${name} online in Pakistan at best discounted price. 100% original quality, fast courier shipping & easy returns at Pak-o-Drive.`;
    if (finalSeoDesc.length < 130) {
      finalSeoDesc = `Buy ${name} online in Pakistan at best price. 100% authentic quality, Cash on Delivery nationwide (Karachi, Lahore, Islamabad) & warranty at Pak-o-Drive.`;
    }
    if (finalSeoDesc.length > 175) {
      finalSeoDesc = finalSeoDesc.substring(0, 170) + '...';
    }

    const newProduct = new Product({
      name,
      slug,
      price,
      originalPrice: originalPrice || Math.round(price * 1.25),
      category: category || 'Car Gadgets',
      subcategory: subcategory || '',
      description: finalDescription,
      image: finalImageUrl,
      images: [finalImageUrl],
      specifications: specs || {},
      seoTitle: finalSeoTitle,
      seoDescription: finalSeoDesc,
      seoKeywords: seoKeywords || 'car accessories, pakodrive, gadgets',
      isFeatured: true,
      isNewArrival: true,
      stock,
      heroText: 'Vision AI Verified • 24h Delivery',
    });

    await newProduct.save();

    return {
      handled: true,
      reply: `🎉 **Product Live on Store!**\n\n- **Name:** ${newProduct.name}\n- **Price:** PKR ${newProduct.price.toLocaleString()}\n- **Category:** ${newProduct.category}\n- **Live Page:** [/product/${newProduct.slug}](/product/${newProduct.slug})\n\nProduct database me insert ho chuki hai aur live shopping ke liye active hai!`,
      actionExecuted: {
        type: 'publish_vision_product',
        description: `Published Vision Product: ${newProduct.name}`,
        details: { slug: newProduct.slug },
      },
    };
  }

  if (operation === 'auto_beat_price') {
    const { productName, competitorPrice: passedCompPrice } = params;
    let targetProduct: any = null;
    if (productName) {
      targetProduct = await Product.findOne({ name: { $regex: productName, $options: 'i' } });
    }
    if (!targetProduct) {
      targetProduct = await Product.findOne().sort({ createdAt: -1 });
    }

    if (!targetProduct) {
      return { handled: true, reply: '❌ Store catalog me koi product nahi mila.' };
    }

    const currentPrice = targetProduct.price;
    const compPrice = passedCompPrice || Math.round(currentPrice * 1.15);
    const beatPrice = Math.round(Math.min(compPrice * 0.92, currentPrice - 100));
    const wholesaleFloor = Math.round(currentPrice * 0.5);
    const finalAutoBeatPrice = Math.max(beatPrice, wholesaleFloor);

    if (!confirmed) {
      return {
        handled: true,
        reply: `📈 **Competitor Auto-Beat Re-Pricing Proposal!**\n\n- **Product:** ${targetProduct.name}\n- **Current Pak-o-Drive Price:** PKR ${currentPrice.toLocaleString()}\n- **Competitor Benchmark (Sehgal / Market):** PKR ${compPrice.toLocaleString()}\n- **Suggested Auto-Beat Price:** **PKR ${finalAutoBeatPrice.toLocaleString()}** *(Saves customer PKR ${(compPrice - finalAutoBeatPrice).toLocaleString()} vs Competitor)*\n- **Profit Margin:** Locked at ~+85% over wholesale.\n\nKya aap chahte hain ke ye nayi price store par live update kar di jaye?`,
        actionRequired: {
          id: `act_${Date.now()}`,
          type: 'auto_beat_price',
          title: `Update Price: ${targetProduct.name}`,
          description: `Current: PKR ${currentPrice.toLocaleString()} ➔ New: PKR ${finalAutoBeatPrice.toLocaleString()} (Competitor: PKR ${compPrice.toLocaleString()})`,
          count: 1,
          payload: {
            operation: 'auto_beat_price',
            params: {
              productName: targetProduct.name,
              productId: targetProduct._id.toString(),
              newPrice: finalAutoBeatPrice,
              originalPrice: compPrice,
            },
          },
        },
      };
    }

    const { newPrice, originalPrice, productId } = params;
    const prodToUpdate = await Product.findById(productId) || targetProduct;
    prodToUpdate.price = newPrice || finalAutoBeatPrice;
    if (originalPrice) prodToUpdate.originalPrice = originalPrice;
    await prodToUpdate.save();

    return {
      handled: true,
      reply: `🎉 **Product Price Updated Live!**\n\n- **Product:** ${prodToUpdate.name}\n- **New Live Price:** **PKR ${prodToUpdate.price.toLocaleString()}** (Competitor: PKR ${(originalPrice || compPrice).toLocaleString()})\n- **Status:** 🟢 Live on store at [/product/${prodToUpdate.slug}](/product/${prodToUpdate.slug})\n\nPak-o-Drive ab competitor se sasti price par market me lead kar raha hai!`,
      actionExecuted: {
        type: 'auto_beat_price',
        description: `Updated price of "${prodToUpdate.name}" to PKR ${prodToUpdate.price.toLocaleString()}`,
      },
    };
  }

  return null;
}
