import mongoose from 'mongoose';
import Order from '../../models/Order';
import Product from '../../models/Product';
import { AdminActionResult, VALID_ORDER_STATUSES, normalizeOrderStatus } from '../adminActionEngine';

export async function handleOrderActions(
  operation: string,
  params: any,
  confirmed: boolean
): Promise<AdminActionResult | null> {
  if (operation === 'update_order_status') {
    const { identifier, newStatus, orderId } = params;
    const targetStatus = normalizeOrderStatus(newStatus);
    if (!targetStatus) {
      return {
        handled: true,
        reply: `⚠️ Invalid status value. Status sirf yeh ho saktay hain: ${VALID_ORDER_STATUSES.join(', ')}.`,
      };
    }

    const trimmedId = typeof identifier === 'string' ? identifier.trim() : String(identifier || '').trim();
    const isBulk = /^(all|all_pending|all_cancelled|tamam|sab|saray|sary)/i.test(trimmedId);

    if (isBulk) {
      let bulkFilter: any = { status: 'Pending' };
      if (trimmedId.toLowerCase().includes('cancelled')) {
        bulkFilter = { status: 'Cancelled' };
      }
      const matchedOrders = await Order.find(bulkFilter).limit(20).lean();
      if (matchedOrders.length === 0) {
        return {
          handled: true,
          reply: `ℹ️ Diye gaye bulk criteria ke mutabiq koi order nahi mila.`,
        };
      }

      if (!confirmed) {
        const previewList = matchedOrders
          .slice(0, 5)
          .map((o: any) => `#${o._id.toString().slice(-6).toUpperCase()} (${o.customerDetails?.name || 'Customer'} - PKR ${(o.totalAmount || 0).toLocaleString()})`)
          .join(', ');
        const extraText = matchedOrders.length > 5 ? ` aur ${matchedOrders.length - 5} mazeed...` : '';

        return {
          handled: true,
          reply: `⚠️ **Bulk Order Verification Zaroori Hai!**\n\nAap **${matchedOrders.length} orders** ka status badal kar **"${targetStatus}"** karne lage hain.\n\n- **Preview Orders:** ${previewList}${extraText}\n\nKia aap waqai in tamam ${matchedOrders.length} orders ko update karna chahte hain? Tasdeeq ke liye neeche **"✅ Yes, Update Status"** button dabayein ya chat mein **"Yes"** likhein.`,
          actionRequired: {
            id: `act_${Date.now()}`,
            type: 'update_order_status',
            title: `Bulk Update: ${matchedOrders.length} Orders to ${targetStatus}`,
            description: `Tamam ${matchedOrders.length} matching orders ko ${targetStatus} mark karna`,
            count: matchedOrders.length,
            payload: {
              operation: 'update_order_status',
              params: {
                identifier: trimmedId,
                newStatus: targetStatus,
              },
            },
          },
        };
      }

      const ids = matchedOrders.map((o: any) => o._id);
      await Order.updateMany(
        { _id: { $in: ids } },
        {
          $set: { status: targetStatus },
          $push: {
            statusHistory: {
              status: targetStatus,
              changedAt: new Date(),
              note: `Bulk updated to ${targetStatus} via AI Executive Copilot`,
            },
          },
        }
      );

      return {
        handled: true,
        reply: `✅ **Bulk Status Updated!** ${matchedOrders.length} order(s) ka status successfully **"${targetStatus}"** kar diya gaya hai.\n\n- Updated IDs: ${matchedOrders.map((o: any) => `#${o._id.toString().slice(-6).toUpperCase()}`).join(', ')}`,
        actionExecuted: {
          type: 'update_order_status',
          description: `${matchedOrders.length} order(s) marked as ${targetStatus}`,
          count: matchedOrders.length,
        },
      };
    }

    let targetOrder: any = null;

    if (orderId && mongoose.Types.ObjectId.isValid(orderId)) {
      targetOrder = await Order.findById(orderId).lean();
    }

    if (!targetOrder) {
      const indexMatch = trimmedId.match(/^(?:order\s*)?(?:#|id\s*)?(\d{1,2})$/i);
      if (indexMatch) {
        const idxNum = parseInt(indexMatch[1], 10);
        if (idxNum >= 1 && idxNum <= 30) {
          const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(idxNum).lean();
          if (recentOrders.length >= idxNum) {
            targetOrder = recentOrders[idxNum - 1];
          }
        }
      }
    }

    const cleanHex = trimmedId.replace(/^#/, '');
    if (!targetOrder && mongoose.Types.ObjectId.isValid(cleanHex) && cleanHex.length === 24) {
      targetOrder = await Order.findById(cleanHex).lean();
    }

    if (!targetOrder && /^[a-f0-9]{4,12}$/i.test(cleanHex)) {
      const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(100).lean();
      targetOrder = recentOrders.find((o: any) =>
        o._id.toString().toLowerCase().endsWith(cleanHex.toLowerCase())
      ) || null;

      if (!targetOrder) {
        targetOrder = await Order.findOne({
          $expr: {
            $regexMatch: {
              input: { $toString: '$_id' },
              regex: `${cleanHex}$`,
              options: 'i',
            },
          },
        }).lean();
      }
    }

    if (!targetOrder && /^\+?\d{7,13}$/.test(trimmedId)) {
      const purePhone = trimmedId.replace(/^\+/, '');
      targetOrder = await Order.findOne({
        'customerDetails.phone': { $regex: purePhone },
      }).sort({ createdAt: -1 }).lean();
    }

    if (!targetOrder && trimmedId.length >= 2 && !/^\d+$/.test(trimmedId) && trimmedId !== 'latest') {
      targetOrder = await Order.findOne({
        $or: [
          { trackingNumber: trimmedId },
          { 'customerDetails.name': { $regex: trimmedId, $options: 'i' } },
          { 'customerDetails.city': { $regex: trimmedId, $options: 'i' } },
        ],
      }).sort({ createdAt: -1 }).lean();
    }

    if (!targetOrder && (!trimmedId || /latest|last|recent|pehla|newest/i.test(trimmedId))) {
      targetOrder = await Order.findOne({ status: 'Pending' }).sort({ createdAt: -1 }).lean()
        || await Order.findOne().sort({ createdAt: -1 }).lean();
    }

    if (!targetOrder) {
      return {
        handled: true,
        reply: `❌ Diye gaye query ("${trimmedId || 'None'}") ke mutabiq koi order nahi mila. Baraye meherbani sahi Order sequence (maslan: "Order 1"), Short ID (maslan: "#774526"), ya customer ka naam likhein.`,
      };
    }

    const shortId = targetOrder._id.toString().slice(-6).toUpperCase();
    const custName = targetOrder.customerDetails?.name || 'Customer';
    const custPhone = targetOrder.customerDetails?.phone || 'N/A';
    const custCity = targetOrder.customerDetails?.city || 'Pakistan';
    const amountStr = (targetOrder.totalAmount || 0).toLocaleString();
    const currentStatus = targetOrder.status || 'Pending';
    const itemsCount = targetOrder.items?.length || 1;
    const firstItemTitle = targetOrder.items?.[0]?.title || 'Auto Accessory';

    if (currentStatus === targetStatus) {
      return {
        handled: true,
        reply: `ℹ️ Order **#${shortId}** (${custName} - ${custCity}) ka status pehle se hi **"${targetStatus}"** hai. Koi tabdeeli ki zaroorat nahi thi.`,
      };
    }

    if (!confirmed) {
      return {
        handled: true,
        reply: `⚠️ **Verification Zaroori Hai!**\n\nAap ne order status update karne ki hidayat di hai. Baraye meherbani tasdeeq karein ke details durust hain:\n\n- 🧾 **Order ID:** #${shortId} *(Mongo: ${targetOrder._id})*\n- 👤 **Customer:** ${custName} (${custCity})\n- 📞 **Phone:** ${custPhone}\n- 📦 **Products:** ${itemsCount} item(s) (${firstItemTitle})\n- 💰 **Total Amount:** PKR ${amountStr}\n- 🔄 **Status Change:** \`${currentStatus}\` ➔ **\`${targetStatus}\`**\n\nKia aap waqai is order ka status **"${targetStatus}"** karna chahte hain? Tasdeeq ke liye neeche **"✅ Yes, Update Status"** dabayein ya chat mein **"Yes"** likhein.`,
        actionRequired: {
          id: `act_${Date.now()}`,
          type: 'update_order_status',
          title: `Update Order #${shortId} to ${targetStatus}`,
          description: `${custName} (${custCity}) • PKR ${amountStr} • ${currentStatus} ➔ ${targetStatus}`,
          count: 1,
          payload: {
            operation: 'update_order_status',
            params: {
              orderId: targetOrder._id.toString(),
              identifier: targetOrder._id.toString(),
              newStatus: targetStatus,
            },
          },
        },
      };
    }

    await Order.updateOne(
      { _id: targetOrder._id },
      {
        $set: { status: targetStatus },
        $push: {
          statusHistory: {
            status: targetStatus,
            changedAt: new Date(),
            note: `Updated to ${targetStatus} via AI Executive Copilot (${trimmedId || 'Single Order'})`,
          },
        },
      }
    );

    return {
      handled: true,
      reply: `✅ **Status Updated!** Order **#${shortId}** (${custName} - ${custCity}, PKR ${amountStr}) ka status successfully **"${targetStatus}"** kar diya gaya hai.`,
      actionExecuted: {
        type: 'update_order_status',
        description: `Order #${shortId} (${custName}) marked as ${targetStatus}`,
        count: 1,
        details: {
          orderId: targetOrder._id.toString(),
          shortId,
          customer: custName,
          city: custCity,
          amount: targetOrder.totalAmount,
          newStatus: targetStatus,
        },
      },
    };
  }

  if (operation === 'update_order_details') {
    const { identifier, address, phone, trackingNumber, courierName } = params;
    if (!identifier) {
      return { handled: true, reply: '❌ Order ID ya customer phone number likhna zaroori hai.' };
    }

    let filter: any = {};
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      filter._id = new mongoose.Types.ObjectId(identifier);
    } else {
      filter.$or = [
        { 'customerDetails.phone': { $regex: identifier } },
        { 'customerDetails.name': { $regex: identifier, $options: 'i' } },
      ];
    }

    const order = await Order.findOne(filter);
    if (!order) {
      return { handled: true, reply: `❌ Order "${identifier}" nahi mila.` };
    }

    if (address) order.customerDetails.address = address;
    if (phone) order.customerDetails.phone = phone;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (courierName) order.courierName = courierName;

    await order.save();
    return {
      handled: true,
      reply: `✅ **Order Details Updated!** Order #${order._id.toString().slice(-6)} (${order.customerDetails.name}) ki details update ho chuki hain:\n- Address: ${order.customerDetails.address}\n- Tracking: ${order.trackingNumber || 'N/A'}\n- Courier: ${order.courierName || 'N/A'}`,
      actionExecuted: {
        type: 'update_order_details',
        description: `Updated details for Order #${order._id.toString().slice(-6)}`,
      },
    };
  }

  if (operation === 'delete_orders_bulk') {
    const { status, dateBefore, dateAfter, deleteAll, filter: passedFilter } = params;
    const filter: any = passedFilter ? { ...passedFilter } : {};

    if (!passedFilter) {
      if (status) filter.status = status;
      if (dateBefore) filter.createdAt = { ...filter.createdAt, $lte: new Date(dateBefore) };
      if (dateAfter) filter.createdAt = { ...filter.createdAt, $gte: new Date(dateAfter) };
    }

    const matchingCount = await Order.countDocuments(filter);
    if (matchingCount === 0) {
      return {
        handled: true,
        reply: `ℹ️ Diye gaye filter ke mutabiq koi order nahi mila (Matching orders: 0).`,
      };
    }

    if (!confirmed) {
      const desc = deleteAll
        ? `Store ke TAMAM (${matchingCount}) orders permanent delete karna`
        : `${matchingCount} orders ${status ? `(${status})` : ''} delete karna`;

      return {
        handled: true,
        reply: `⚠️ **Caution: Confirmation Zaroori Hai!**\n\nAap **${matchingCount} orders** database se hamesha ke liye delete karne lage hain.\n\nKia aap waqai inhay delete karna chahte hain? Neeche diye gaye button par click karein.`,
        actionRequired: {
          id: `act_${Date.now()}`,
          type: 'delete_orders_bulk',
          title: 'Confirm Orders Bulk Deletion',
          description: desc,
          count: matchingCount,
          payload: { operation: 'delete_orders_bulk', params: { filter } },
        },
      };
    }

    const deleteRes = await Order.deleteMany(filter);
    return {
      handled: true,
      reply: `🗑️ **Orders Deleted!** ${deleteRes.deletedCount} orders successfully database se delete kar diye gaye hain.`,
      actionExecuted: {
        type: 'delete_orders_bulk',
        description: `${deleteRes.deletedCount} orders permanently deleted`,
        count: deleteRes.deletedCount,
      },
    };
  }

  if (operation === 'delete_order') {
    const { identifier, orderId } = params;
    let filter: any = {};
    if (orderId && mongoose.Types.ObjectId.isValid(orderId)) {
      filter._id = new mongoose.Types.ObjectId(orderId);
    } else if (identifier && mongoose.Types.ObjectId.isValid(identifier)) {
      filter._id = new mongoose.Types.ObjectId(identifier);
    } else if (identifier) {
      filter.$or = [
        { 'customerDetails.phone': { $regex: identifier } },
        { 'customerDetails.name': { $regex: identifier, $options: 'i' } },
      ];
    } else {
      return { handled: true, reply: '❌ Order ID batana zaroori hai.' };
    }

    const order = await Order.findOne(filter);
    if (!order) {
      return { handled: true, reply: `❌ Order nahi mila.` };
    }

    if (!confirmed) {
      return {
        handled: true,
        reply: `⚠️ **Confirmation Required:** Order #${order._id.toString().slice(-6)} (Customer: ${order.customerDetails.name}, Total: PKR ${order.totalAmount}) delete karna chahte hain?`,
        actionRequired: {
          id: `act_${Date.now()}`,
          type: 'delete_order',
          title: `Delete Order #${order._id.toString().slice(-6)}`,
          description: `Customer: ${order.customerDetails.name} • PKR ${order.totalAmount}`,
          count: 1,
          payload: { operation: 'delete_order', params: { orderId: order._id.toString() } },
        },
      };
    }

    await Order.findByIdAndDelete(order._id);
    return {
      handled: true,
      reply: `🗑️ **Order Deleted!** Order #${order._id.toString().slice(-6)} successfully delete kar diya gaya hai.`,
      actionExecuted: {
        type: 'delete_order',
        description: `Order #${order._id.toString().slice(-6)} deleted`,
      },
    };
  }

  if (operation === 'generate_whatsapp_digest') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayOrders, totalRevenue, pendingOrders, lowStock] = await Promise.all([
      Order.find({ createdAt: { $gte: today } }).lean(),
      Order.aggregate([
        { $match: { status: { $ne: 'Cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.countDocuments({ status: 'Pending' }),
      Product.find({ stock: { $lte: 5 } }).select('name stock price').limit(5).lean(),
    ]);

    const revPKR = totalRevenue[0]?.total || 0;
    const todaySalesPKR = todayOrders.reduce((acc: number, o: any) => acc + (o.totalAmount || 0), 0);

    const lowStockAlert = lowStock.length > 0
      ? lowStock.map((p: any) => `  • ${p.name} (${p.stock} bache)`).join('\n')
      : '  • Sab products ka stock healthy hai ✅';

    const digestText = `*🚗 PAK-O-DRIVE DAILY EXECUTIVE DIGEST*
📅 *Tareekh:* ${new Date().toLocaleDateString('en-PK', { dateStyle: 'medium' })}

💰 *Revenue Overview:*
• Aaj Ki Sales: *PKR ${todaySalesPKR.toLocaleString()}* (${todayOrders.length} orders)
• Total All-Time: *PKR ${revPKR.toLocaleString()}*

📦 *Orders Status:*
• Pending Orders: *${pendingOrders}* (Verification zaroori hai)
• Aaj Ke Naye Orders: *${todayOrders.length}*

⚠️ *Low Stock Alert:*
${lowStockAlert}

📍 *Twin Cities (RWP/ISB) Focus:*
Fog lights, Car ambient LEDs aur 4K Dashcams ki demand peak par hai.

_Generated via Pak-o-Drive AI Brain_`;

    const waLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(digestText)}`;

    return {
      handled: true,
      reply: `📱 **Today's WhatsApp Executive Digest Ready!**\n\n\`\`\`\n${digestText}\n\`\`\`\n\n👉 **[Click Here to Send to WhatsApp](${waLink})**`,
      actionExecuted: {
        type: 'generate_whatsapp_digest',
        description: 'Generated Daily Executive WhatsApp Digest',
        details: { waLink },
      },
    };
  }

  if (operation === 'analyze_cod_risk') {
    const { orderId } = params;
    let query: any = {};
    if (orderId && mongoose.Types.ObjectId.isValid(orderId)) {
      query._id = new mongoose.Types.ObjectId(orderId);
    } else {
      query.status = 'Pending';
    }

    const ordersToAnalyze = await Order.find(query).sort({ createdAt: -1 }).limit(6).lean();
    if (ordersToAnalyze.length === 0) {
      return {
        handled: true,
        reply: `ℹ️ Koi pending order nahi mila analyze karne ke liye.`,
      };
    }

    const analyses = [];
    for (const ord of ordersToAnalyze) {
      const phone = ord.customerDetails?.phone || '';
      const address = ord.customerDetails?.address || '';
      const city = ord.customerDetails?.city || '';

      const isPakPhone = /^(?:(?:\+|00)?92|0)?3\d{9}$/.test(phone.replace(/[\s-]/g, ''));
      const isDetailedAddress = address.length > 15 && /(house|street|flat|floor|sector|bazaar|road|phase|gali|makan|shop)/i.test(address);
      const isMajorCity = /(islamabad|rawalpindi|lahore|karachi|peshawar|faisalabad|multan|gujranwala)/i.test(city);

      const pastCancellations = await Order.countDocuments({
        'customerDetails.phone': phone,
        status: 'Cancelled',
      });

      let riskScore: 'Low' | 'Medium' | 'High' = 'Low';
      let riskReason = 'Valid phone aur complete address mila hai.';

      if (!isPakPhone || pastCancellations >= 2) {
        riskScore = 'High';
        riskReason = !isPakPhone ? 'Invalid phone format' : `${pastCancellations} pichle orders cancel ho chuke hain`;
      } else if (!isDetailedAddress || !isMajorCity) {
        riskScore = 'Medium';
        riskReason = !isDetailedAddress ? 'Address me gali/makan number wazeh nahi hai' : 'Remote delivery zone';
      }

      analyses.push({
        id: ord._id.toString().slice(-6),
        name: ord.customerDetails?.name || 'Customer',
        phone,
        city,
        amount: ord.totalAmount,
        riskScore,
        riskReason,
      });
    }

    const rows = analyses.map((a) => {
      const badge = a.riskScore === 'Low' ? '🟢 Low Risk' : a.riskScore === 'Medium' ? '🟡 Medium Risk' : '🔴 High Risk';
      return `| #${a.id} | ${a.name} (${a.city}) | PKR ${a.amount.toLocaleString()} | **${badge}** | ${a.riskReason} |`;
    }).join('\n');

    const responseText = `🛡️ **COD Fraud & Courier Return Risk Audit:**\n\n| Order ID | Customer | Amount | Risk Score | Risk Factor |\n| :--- | :--- | :--- | :--- | :--- |\n${rows}\n\n**Actionable Advice:**\n- 🔴 **High Risk Orders:** Customer se call par confirm karein ya PKR 300 delivery charges pehle JazzCash/Easypaisa se receive karein.\n- 🟢 **Low Risk Orders:** TCS/Trax me foran dispatch ke liye ready hain.`;

    return {
      handled: true,
      reply: responseText,
      actionExecuted: {
        type: 'analyze_cod_risk',
        description: `Analyzed COD risk for ${analyses.length} order(s)`,
      },
    };
  }

  if (operation === 'generate_dispatch_slip') {
    const { orderId } = params;
    let filter: any = {};
    if (orderId && mongoose.Types.ObjectId.isValid(orderId)) {
      filter._id = new mongoose.Types.ObjectId(orderId);
    } else {
      filter.status = { $in: ['Pending', 'Processing', 'On the Way'] };
    }

    const order = await Order.findOne(filter).sort({ createdAt: -1 }).lean();
    if (!order) {
      return { handled: true, reply: '❌ Dispatch slip ke liye koi order nahi mila.' };
    }

    const slip = `
========================================
       PAK-O-DRIVE COURIER DISPATCH SLIP
========================================
SENDER: Pak-o-Drive Auto Accessories
ADDRESS: Sector G-8, Islamabad, Pakistan
PHONE: +92 318 5205667
----------------------------------------
CONSIGNEE (RECEIVER):
NAME: ${order.customerDetails?.name}
PHONE: ${order.customerDetails?.phone}
ADDRESS: ${order.customerDetails?.address}
CITY: ${order.customerDetails?.city}
----------------------------------------
ORDER #: #${order._id.toString().slice(-6)}
DATE: ${new Date(order.createdAt).toLocaleDateString()}
PAYMENT: CASH ON DELIVERY (COD)
AMOUNT TO COLLECT: PKR ${order.totalAmount.toLocaleString()}
----------------------------------------
ITEMS INCLUDED:
${(order.items || []).map((i: any) => `• ${i.name} (Qty: ${i.quantity}) - PKR ${i.price}`).join('\n')}
----------------------------------------
BARCODE: ||| ||||| |||| || |||||||| |||
TRACKING / CN: ${order.trackingNumber || 'UNASSIGNED'}
COURIER: ${order.courierName || 'TCS / Trax Express'}
========================================
`;

    return {
      handled: true,
      reply: `🚚 **Thermal Courier Dispatch Slip Ready!**\n\n\`\`\`text${slip}\`\`\`\n\n*Aap is slip ko print kar ke parcel ke upar paste kar sakte hain.*`,
      actionExecuted: {
        type: 'generate_dispatch_slip',
        description: `Generated Dispatch Slip for Order #${order._id.toString().slice(-6)}`,
      },
    };
  }

  if (operation === 'generate_cod_confirmation') {
    const { limit = 6 } = params;
    const pendingOrders = await Order.find({ status: 'Pending' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    if (pendingOrders.length === 0) {
      return {
        handled: true,
        reply: `ℹ️ Is waqt koi pending COD order nahi hai. Tamam orders processed hain ✅`,
      };
    }

    let confirmationList = '';
    for (const ord of pendingOrders) {
      const custName = ord.customerDetails?.name || 'Customer';
      let cleanPhone = (ord.customerDetails?.phone || '').replace(/\D/g, '');
      if (cleanPhone.startsWith('03')) cleanPhone = '92' + cleanPhone.slice(1);
      if (!cleanPhone.startsWith('92') && cleanPhone.length === 10) cleanPhone = '92' + cleanPhone;

      const orderShortId = ord._id.toString().slice(-6);
      const itemsList = (ord.items || []).map((i: any) => `${i.name} (x${i.quantity})`).join(', ') || 'Car Accessories';
      const city = ord.customerDetails?.city || 'Pakistan';
      const address = ord.customerDetails?.address || '';

      const hasPhone = cleanPhone.length >= 11;
      const hasAddress = address.length >= 10;
      const riskLevel = !hasPhone || !hasAddress ? '⚠️ High Risk' : '🟢 Verified Safe';

      const waMsg = `Assalam-o-Alaikum ${custName} Bhai! 🚗\n\nPak-o-Drive se aapka Order #${orderShortId} receive hua hai:\n📦 Items: ${itemsList}\n💰 Total Amount: PKR ${ord.totalAmount.toLocaleString()} (Cash on Delivery)\n📍 Delivery City: ${city}\n\nKya hum aapka parcel TCS Express se rawana karein?\n1️⃣ Confirm karne ke liye 'YES' ya '1' reply karein.\n2️⃣ Address change karna ho tou yahan likhein.\n\nShukriya! Pak-o-Drive Team`;

      const waLink = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(waMsg)}`;

      confirmationList += `\n- **Order #${orderShortId}** — **${custName}** (${city}) [${riskLevel}]\n  • Total: **PKR ${ord.totalAmount.toLocaleString()}** | Phone: \`${cleanPhone}\`\n  • 👉 **[Send 1-Click WhatsApp Confirmation](${waLink})**\n`;
    }

    return {
      handled: true,
      reply: `🛡️ **WhatsApp COD Confirmation & Anti-RTO Shield Ready!**\n\nPending orders ke liye personalized 1-click confirmation WhatsApp links tayyar hain. Customer se delivery confirm karwa kar dispatch karein taake courier return (RTO) charges na paren:\n${confirmationList}\n\n*Customer ke confirm karne par order ko "Processing" mark kar dein.*`,
      actionExecuted: {
        type: 'generate_cod_confirmation',
        description: `Generated WhatsApp confirmation links for ${pendingOrders.length} pending orders`,
      },
    };
  }

  if (operation === 'export_courier_manifest') {
    const { courier = 'TCS Express' } = params;
    const orders = await Order.find({ status: { $in: ['Processing', 'Pending'] } })
      .sort({ createdAt: -1 })
      .limit(15)
      .lean();

    if (orders.length === 0) {
      return {
        handled: true,
        reply: `ℹ️ Dispatch manifest banane ke liye koi pending ya processing order nahi mila.`,
      };
    }

    let manifestRows: string[] = [];
    let csvRows: string[] = ['CN,OrderNo,CustomerName,Phone,City,Address,CODAmount,Items'];

    orders.forEach((ord: any, idx: number) => {
      const orderShortId = ord._id.toString().slice(-6);
      const cn = ord.trackingNumber || `PKD${Date.now().toString().slice(-6)}${idx}`;
      let phone = (ord.customerDetails?.phone || '').replace(/\D/g, '');
      const name = (ord.customerDetails?.name || 'Customer').replace(/,/g, ' ');
      const city = (ord.customerDetails?.city || 'Pakistan').replace(/,/g, ' ');
      const address = (ord.customerDetails?.address || '').replace(/,/g, ' ');
      const cod = ord.totalAmount || 0;
      const items = (ord.items || []).map((i: any) => `${i.name} (${i.quantity})`).join(' + ').replace(/,/g, ' ');

      manifestRows.push(`| \`${cn}\` | #${orderShortId} | **${name}** | \`${phone}\` | ${city} | **PKR ${cod.toLocaleString()}** |`);
      csvRows.push(`${cn},#${orderShortId},"${name}",${phone},"${city}","${address}",${cod},"${items}"`);
    });

    const totalCOD = orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);

    return {
      handled: true,
      reply: `🚚 **${courier} Bulk Dispatch Manifest Ready!**\n\n**Total Orders to Dispatch:** ${orders.length} | **Total COD to Collect:** PKR ${totalCOD.toLocaleString()}\n\n| CN / Tracking | Order | Customer Name | Phone | City | COD Amount |\n| :--- | :--- | :--- | :--- | :--- | :--- |\n${manifestRows.join('\n')}\n\n---\n### 📋 Raw CSV Manifest for TCS / Trax Portal:\n\`\`\`csv\n${csvRows.join('\n')}\n\`\`\`\n\n*Aap is CSV data ko copy kar ke direct courier portal par bulk upload kar sakte hain.*`,
      actionExecuted: {
        type: 'export_courier_manifest',
        description: `Generated ${courier} manifest for ${orders.length} orders (PKR ${totalCOD.toLocaleString()})`,
      },
    };
  }

  return null;
}
