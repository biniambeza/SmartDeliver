require('dotenv').config();
const prisma = require('../src/lib/prisma');
const bcrypt = require('bcryptjs');

async function main() {
  console.log('🌱 Starting database seed for Slice 2: Vendors & Products...');
  await prisma.$connect();

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Habesha Spice Kitchen (Restaurant)
  const habeshaUser = await prisma.user.upsert({
    where: { email: 'habesha@smartdeliver.com' },
    update: {},
    create: {
      email: 'habesha@smartdeliver.com',
      password: passwordHash,
      name: 'Chef Almaz Tesfaye',
      phone: '+251911223344',
      role: 'VENDOR',
      isVerified: true,
      vendor: {
        create: {
          name: 'Habesha Spice Kitchen',
          slug: 'habesha-spice-kitchen',
          description: 'Authentic Ethiopian dining featuring sizzling Doro Wat, fresh Injera, and organic spices.',
          category: 'RESTAURANT',
          logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=160&q=80',
          bannerUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
          address: 'Bole Medhanialem Road, Addis Ababa',
          isActive: true,
        },
      },
    },
    include: { vendor: true },
  });

  // 2. Bole Fresh Market (Grocery)
  const marketUser = await prisma.user.upsert({
    where: { email: 'bolemarket@smartdeliver.com' },
    update: {},
    create: {
      email: 'bolemarket@smartdeliver.com',
      password: passwordHash,
      name: 'Yared Hailu',
      phone: '+251922334455',
      role: 'VENDOR',
      isVerified: true,
      vendor: {
        create: {
          name: 'Bole Fresh Supermarket',
          slug: 'bole-fresh-supermarket',
          description: 'Premium fresh organic produce, imported pantry staples, daily dairy, and beverages.',
          category: 'GROCERY',
          logoUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=160&q=80',
          bannerUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1200&q=80',
          address: 'Namibia St, Bole Sub-City, Addis Ababa',
          isActive: true,
        },
      },
    },
    include: { vendor: true },
  });

  // 3. Gusto Italian Trattoria (Restaurant)
  const gustoUser = await prisma.user.upsert({
    where: { email: 'gusto@smartdeliver.com' },
    update: {},
    create: {
      email: 'gusto@smartdeliver.com',
      password: passwordHash,
      name: 'Marco Bellini',
      phone: '+251933445566',
      role: 'VENDOR',
      isVerified: true,
      vendor: {
        create: {
          name: 'Gusto Italian Trattoria',
          slug: 'gusto-italian-trattoria',
          description: 'Handmade wood-fired Neapolitan pizza, fresh truffle pasta, and artisanal desserts.',
          category: 'RESTAURANT',
          logoUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=160&q=80',
          bannerUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80',
          address: 'Kazanchis Business District, Addis Ababa',
          isActive: true,
        },
      },
    },
    include: { vendor: true },
  });

  // 4. Tomoca Heritage Roasters (Cafe)
  const tomocaUser = await prisma.user.upsert({
    where: { email: 'tomoca@smartdeliver.com' },
    update: {},
    create: {
      email: 'tomoca@smartdeliver.com',
      password: passwordHash,
      name: 'Hiwot Bekele',
      phone: '+251944556677',
      role: 'VENDOR',
      isVerified: true,
      vendor: {
        create: {
          name: 'Tomoca Heritage Roasters',
          slug: 'tomoca-heritage-roasters',
          description: 'Legendary Ethiopian single-origin roast coffees, pour-overs, and Italian espresso drinks.',
          category: 'CAFE',
          logoUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=160&q=80',
          bannerUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
          address: 'Piazza Central Square, Addis Ababa',
          isActive: true,
        },
      },
    },
    include: { vendor: true },
  });

  // 5. MedCare Central Pharmacy (Pharmacy)
  const pharmacyUser = await prisma.user.upsert({
    where: { email: 'medcare@smartdeliver.com' },
    update: {},
    create: {
      email: 'medcare@smartdeliver.com',
      password: passwordHash,
      name: 'Dr. Dawit Mengistu',
      phone: '+251955667788',
      role: 'VENDOR',
      isVerified: true,
      vendor: {
        create: {
          name: 'MedCare Central Pharmacy',
          slug: 'medcare-central-pharmacy',
          description: 'Licensed health essentials, vitamins, supplements, baby care, and emergency first-aid items.',
          category: 'PHARMACY',
          logoUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=160&q=80',
          bannerUrl: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=1200&q=80',
          address: 'Mexico Square, Addis Ababa',
          isActive: true,
        },
      },
    },
    include: { vendor: true },
  });

  console.log('✅ Vendors registered.');

  // Fetch created vendors
  const habesha = await prisma.vendor.findUnique({ where: { slug: 'habesha-spice-kitchen' } });
  const market = await prisma.vendor.findUnique({ where: { slug: 'bole-fresh-supermarket' } });
  const gusto = await prisma.vendor.findUnique({ where: { slug: 'gusto-italian-trattoria' } });
  const tomoca = await prisma.vendor.findUnique({ where: { slug: 'tomoca-heritage-roasters' } });
  const pharmacy = await prisma.vendor.findUnique({ where: { slug: 'medcare-central-pharmacy' } });

  // Clear existing products to ensure clean seed
  await prisma.product.deleteMany({
    where: {
      vendorId: { in: [habesha.id, market.id, gusto.id, tomoca.id, pharmacy.id] },
    },
  });

  // Seed Habesha Products
  await prisma.product.createMany({
    data: [
      {
        vendorId: habesha.id,
        name: 'Special Doro Wat with Injera',
        description: 'Tender chicken simmered in rich spicy berbere sauce, served with boiled organic egg and freshly baked teff injera.',
        price: 650.00,
        category: 'Traditional',
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
      },
      {
        vendorId: habesha.id,
        name: 'Sizzling Beef Tibs',
        description: 'Prime beef cubed and sautéed with rosemary, red onions, garlic, and green hot peppers on a clay burner.',
        price: 720.00,
        category: 'Main Dish',
        imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
      },
      {
        vendorId: habesha.id,
        name: 'Beyaynetu (Fasting Platter)',
        description: 'Colorful platter of 8 distinct lentil, split pea, cabbage, collard greens, and beet stews with injera.',
        price: 480.00,
        category: 'Vegetarian',
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
      },
      {
        vendorId: habesha.id,
        name: 'Fresh Tej Honey Wine (0.5L)',
        description: 'Traditional handcrafted golden honey wine with subtle gesho leaf herbal notes.',
        price: 350.00,
        category: 'Beverage',
        imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
      },
    ],
  });

  // Seed Bole Fresh Market Products
  await prisma.product.createMany({
    data: [
      {
        vendorId: market.id,
        name: 'Organic Hass Avocados (1kg)',
        description: 'Fresh locally grown creamy avocados picked ripe from Southern Ethiopia orchards.',
        price: 240.00,
        category: 'Produce',
        imageUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
      },
      {
        vendorId: market.id,
        name: 'Addis Gold Pasteurized Milk (1L Pack of 3)',
        description: 'Fresh full-cream homogenized whole milk fortified with vitamin D.',
        price: 360.00,
        category: 'Dairy',
        imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
      },
      {
        vendorId: market.id,
        name: 'Pure Highland Forest Honey (500g)',
        description: 'Raw, unpasteurized amber honey harvested from wild mountain flora.',
        price: 450.00,
        category: 'Pantry',
        imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
      },
    ],
  });

  // Seed Gusto Italian Trattoria Products
  await prisma.product.createMany({
    data: [
      {
        vendorId: gusto.id,
        name: 'Wood-Fired Margherita Pizza',
        description: 'San Marzano DOP tomato sauce, fresh buffalo mozzarella, fragrant basil, and extra virgin olive oil.',
        price: 780.00,
        category: 'Pizza',
        imageUrl: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
      },
      {
        vendorId: gusto.id,
        name: 'Tagliatelle al Tartufo',
        description: 'Fresh egg pasta tossed in black truffle cream, parmigiano reggiano, and wild forest mushrooms.',
        price: 920.00,
        category: 'Pasta',
        imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281699?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
      },
      {
        vendorId: gusto.id,
        name: 'Classic Espresso Tiramisu',
        description: 'Savoiardi ladyfingers soaked in dark espresso and marsala, layered with mascarpone cream.',
        price: 390.00,
        category: 'Dessert',
        imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
      },
    ],
  });

  // Seed Tomoca Coffee Products
  await prisma.product.createMany({
    data: [
      {
        vendorId: tomoca.id,
        name: 'Yirgacheffe Pour-Over (Special Reserve)',
        description: 'Bright citrus floral profile with delicate jasmine aroma and smooth bergamot finish.',
        price: 180.00,
        category: 'Coffee',
        imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
      },
      {
        vendorId: tomoca.id,
        name: 'Double Macchiato Forte',
        description: 'Rich dark espresso topped with silky steamed microfoam in classic glass.',
        price: 120.00,
        category: 'Coffee',
        imageUrl: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
      },
      {
        vendorId: tomoca.id,
        name: 'Whole Bean Sidama Coffee (500g Bag)',
        description: 'Medium roast artisan beans with notes of blueberry, chocolate, and cane sugar.',
        price: 680.00,
        category: 'Packaged Beans',
        imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
      },
    ],
  });

  // Seed MedCare Pharmacy Products
  await prisma.product.createMany({
    data: [
      {
        vendorId: pharmacy.id,
        name: 'High Potency Vitamin C 1000mg + Zinc (60 Tablets)',
        description: 'Immune defense support dietary supplement with bioflavonoids.',
        price: 850.00,
        category: 'Wellness',
        imageUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
      },
      {
        vendorId: pharmacy.id,
        name: 'Comprehensive Home First Aid Kit',
        description: 'Essential emergency kit containing sterile gauze, bandages, antiseptic wipes, burn gel, and shears.',
        price: 1200.00,
        category: 'First Aid',
        imageUrl: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
      },
    ],
  });

  console.log('🎉 Successfully seeded 5 vendors and 15 catalog items into Supabase!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
