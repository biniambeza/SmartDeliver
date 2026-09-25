require('dotenv').config();
const axios = require('axios');
const prisma = require('./src/lib/prisma');

const API_URL = 'http://localhost:5000/api/v1';

async function testSlice5() {
  console.log('🚀 === STARTING SLICE 5: COURIER DISPATCH & ESCROW RELEASE VERIFICATION ===\n');

  try {
    // 1. Authenticate or Register Customer
    console.log('1️⃣ Authenticating Customer...');
    let customerToken;
    let customerUser;
    try {
      const loginRes = await axios.post(`${API_URL}/auth/login`, {
        email: 'customer@smartdeliver.com',
        password: 'Password123!',
      });
      customerToken = loginRes.data.token || loginRes.data.accessToken;
      customerUser = loginRes.data.user;
    } catch (e) {
      const regRes = await axios.post(`${API_URL}/auth/register`, {
        name: 'Abebe Bikila',
        email: 'customer@smartdeliver.com',
        password: 'Password123!',
        phone: '+251911998877',
      });
      customerToken = regRes.data.token || regRes.data.accessToken;
      customerUser = regRes.data.user;
    }
    console.log(`✅ Customer Authenticated: ${customerUser.name} (${customerUser.id})`);

    // 2. Fetch a vendor & product to place order
    console.log('\n2️⃣ Fetching Storefront Vendor & Catalog Product...');
    const vendorsRes = await axios.get(`${API_URL}/vendors`);
    const vendor = vendorsRes.data.vendors[0];
    const productsRes = await axios.get(`${API_URL}/vendors/${vendor.id}/products`);
    const product = productsRes.data.products[0];
    console.log(`✅ Selected Vendor: ${vendor.name}, Product: ${product.name} (ETB ${product.price})`);

    // 3. Create Atomic Order
    console.log('\n3️⃣ Placing Customer Order...');
    const orderRes = await axios.post(
      `${API_URL}/orders`,
      {
        vendorId: vendor.id,
        deliveryAddress: 'Bole Atlas, House #402, Addis Ababa',
        deliveryNotes: 'Ring gate bell twice',
        items: [{ productId: product.id, quantity: 2 }],
      },
      { headers: { Authorization: `Bearer ${customerToken}` } }
    );
    const order = orderRes.data.order;
    console.log(`✅ Order Placed: #${order.id} | Total: ETB ${order.totalAmount}`);

    // 4. Initialize & Confirm Chapa Payment (Escrow Held)
    console.log('\n4️⃣ Initializing & Confirming Chapa Payment...');
    const initPayRes = await axios.post(
      `${API_URL}/payments/initialize/${order.id}`,
      {
        paymentMethod: 'telebirr',
      },
      { headers: { Authorization: `Bearer ${customerToken}` } }
    );
    const txRef = initPayRes.data.txRef;

    // Verify / Confirm payment in Escrow
    await axios.post(
      `${API_URL}/payments/verify/${txRef}`,
      {},
      { headers: { Authorization: `Bearer ${customerToken}` } }
    );

    // Verify Escrow is held
    const dbPaymentBefore = await prisma.payment.findUnique({ where: { txRef } });
    console.log(`✅ Payment Confirmed: Status=${dbPaymentBefore.status}, isEscrowHeld=${dbPaymentBefore.isEscrowHeld}`);
    if (!dbPaymentBefore.isEscrowHeld) {
      throw new Error('Assertion failed: Escrow should be held true before delivery!');
    }

    // 5. Courier Claims Delivery (ASSIGNED)
    console.log('\n5️⃣ Dispatching Courier to Claim Delivery...');
    const claimRes = await axios.post(
      `${API_URL}/deliveries/claim/${order.id}`,
      {},
      { headers: { Authorization: `Bearer ${customerToken}` } }
    );
    const delivery = claimRes.data.delivery;
    console.log(`✅ Delivery Claimed: ID=${delivery.id}, Status=${delivery.status}`);
    console.log(`   Assigned Courier: ${delivery.rider.name} (${delivery.rider.phone})`);

    // 6. Courier Updates Status to PICKED_UP
    console.log('\n6️⃣ Courier Picks Up Order from Vendor...');
    const pickupRes = await axios.patch(
      `${API_URL}/deliveries/${delivery.id}/status`,
      { status: 'PICKED_UP' },
      { headers: { Authorization: `Bearer ${customerToken}` } }
    );
    console.log(`✅ Delivery Status Updated: ${pickupRes.data.delivery.status}`);

    // 7. Update Real-Time GPS Coordinates
    console.log('\n7️⃣ Courier Broadcasts GPS Coordinates...');
    const gpsRes = await axios.post(
      `${API_URL}/deliveries/${delivery.id}/location`,
      { lat: 9.0125, lng: 38.7750 },
      { headers: { Authorization: `Bearer ${customerToken}` } }
    );
    console.log(`✅ GPS Updated: Lat=${gpsRes.data.lat}, Lng=${gpsRes.data.lng}`);

    // 8. Courier Marks Order as DELIVERED & Releases Escrow
    console.log('\n8️⃣ Courier Marks Order as DELIVERED (Triggering Escrow Release)...');
    const deliverRes = await axios.patch(
      `${API_URL}/deliveries/${delivery.id}/status`,
      { status: 'DELIVERED' },
      { headers: { Authorization: `Bearer ${customerToken}` } }
    );
    console.log(`✅ Delivery Status Updated: ${deliverRes.data.delivery.status}`);

    // 9. Verify Escrow Release in Database
    console.log('\n9️⃣ Verifying Escrow Release & Order Status in Supabase DB...');
    const dbPaymentAfter = await prisma.payment.findUnique({ where: { txRef } });
    const dbOrderAfter = await prisma.order.findUnique({ where: { id: order.id } });

    console.log(`   Order Status: ${dbOrderAfter.status} (Expected: DELIVERED)`);
    console.log(`   Payment Status: ${dbPaymentAfter.status}`);
    console.log(`   Escrow Held: ${dbPaymentAfter.isEscrowHeld} (Expected: false)`);
    console.log(`   Escrow Released At: ${dbPaymentAfter.releasedAt}`);

    if (dbOrderAfter.status !== 'DELIVERED') {
      throw new Error(`Assertion failed: Order status should be DELIVERED, got ${dbOrderAfter.status}`);
    }
    if (dbPaymentAfter.isEscrowHeld !== false) {
      throw new Error('Assertion failed: isEscrowHeld should be false after delivery!');
    }
    if (!dbPaymentAfter.releasedAt) {
      throw new Error('Assertion failed: releasedAt timestamp must be recorded upon delivery!');
    }

    // 10. Fetch Order details via GET /orders/:id (as used by OrderTrackerModal)
    console.log('\n🔟 Testing Customer Order Tracking Fetch (GET /api/v1/orders/:id)...');
    const trackingRes = await axios.get(`${API_URL}/orders/${order.id}`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const trackedOrder = trackingRes.data.order;
    console.log(`✅ Order Tracker Response Received:`);
    console.log(`   Order ID: ${trackedOrder.id}`);
    console.log(`   Delivery Status: ${trackedOrder.delivery?.status}`);
    console.log(`   Courier Name: ${trackedOrder.delivery?.rider?.name}`);
    console.log(`   Escrow Status: Held=${trackedOrder.payment?.isEscrowHeld}`);

    console.log('\n🎉 ========================================================');
    console.log('🎉 SLICE 5: ALL COURIER DISPATCH & ESCROW TESTS PASSED 100%');
    console.log('🎉 ========================================================\n');
  } catch (err) {
    console.error('❌ Verification Error:', err.response?.data || err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testSlice5();
