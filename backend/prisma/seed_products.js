require('dotenv').config();
const prisma = require('../src/lib/prisma');

async function seedProducts() {
  console.log('🌱 Seeding products for registered vendors...');
  await prisma.$connect();

  const vendors = await prisma.vendor.findMany();
  console.log(`Found ${vendors.length} vendors in DB:`);
  vendors.forEach(v => console.log(` - ${v.name} (${v.category}) [${v.slug}]`));

  const vendorMap = {};
  vendors.forEach(v => { vendorMap[v.slug] = v.id; });

  const productsToSeed = [
    // Habesha Spice Kitchen
    {
      vendorSlug: 'habesha-spice-kitchen',
      name: 'Special Doro Wat with Injera',
      description: 'Tender chicken simmered in rich spicy berbere sauce, served with boiled organic egg and fresh teff injera.',
      price: 650.00,
      category: 'Traditional',
      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
    },
    {
      vendorSlug: 'habesha-spice-kitchen',
      name: 'Sizzling Beef Tibs',
      description: 'Prime beef cubed and sautéed with rosemary, red onions, garlic, and green hot peppers on a clay burner.',
      price: 720.00,
      category: 'Main Dish',
      imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
    },
    {
      vendorSlug: 'habesha-spice-kitchen',
      name: 'Beyaynetu (Fasting Platter)',
      description: 'Colorful platter of 8 distinct lentil, split pea, cabbage, collard greens, and beet stews with injera.',
      price: 480.00,
      category: 'Vegetarian',
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
    },
    {
      vendorSlug: 'habesha-spice-kitchen',
      name: 'Fresh Tej Honey Wine (0.5L)',
      description: 'Traditional handcrafted golden honey wine with subtle gesho leaf herbal notes.',
      price: 350.00,
      category: 'Beverage',
      imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
    },

    // Bole Fresh Supermarket
    {
      vendorSlug: 'bole-fresh-supermarket',
      name: 'Organic Hass Avocados (1kg)',
      description: 'Fresh locally grown creamy avocados picked ripe from Southern Ethiopia orchards.',
      price: 240.00,
      category: 'Produce',
      imageUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
    },
    {
      vendorSlug: 'bole-fresh-supermarket',
      name: 'Addis Gold Pasteurized Milk (1L Pack of 3)',
      description: 'Fresh full-cream homogenized whole milk fortified with vitamin D.',
      price: 360.00,
      category: 'Dairy',
      imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
    },
    {
      vendorSlug: 'bole-fresh-supermarket',
      name: 'Pure Highland Forest Honey (500g)',
      description: 'Raw, unpasteurized amber honey harvested from wild mountain flora.',
      price: 450.00,
      category: 'Pantry',
      imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
    },

    // Gusto Italian Trattoria
    {
      vendorSlug: 'gusto-italian-trattoria',
      name: 'Wood-Fired Margherita Pizza',
      description: 'San Marzano DOP tomato sauce, fresh buffalo mozzarella, fragrant basil, and extra virgin olive oil.',
      price: 780.00,
      category: 'Pizza',
      imageUrl: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
    },
    {
      vendorSlug: 'gusto-italian-trattoria',
      name: 'Tagliatelle al Tartufo',
      description: 'Fresh egg pasta tossed in black truffle cream, parmigiano reggiano, and wild forest mushrooms.',
      price: 920.00,
      category: 'Pasta',
      imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281699?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
    },
    {
      vendorSlug: 'gusto-italian-trattoria',
      name: 'Classic Espresso Tiramisu',
      description: 'Savoiardi ladyfingers soaked in dark espresso and marsala, layered with mascarpone cream.',
      price: 390.00,
      category: 'Dessert',
      imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
    },

    // Tomoca Heritage Roasters
    {
      vendorSlug: 'tomoca-heritage-roasters',
      name: 'Yirgacheffe Pour-Over (Special Reserve)',
      description: 'Bright citrus floral profile with delicate jasmine aroma and smooth bergamot finish.',
      price: 180.00,
      category: 'Coffee',
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
    },
    {
      vendorSlug: 'tomoca-heritage-roasters',
      name: 'Double Macchiato Forte',
      description: 'Rich dark espresso topped with silky steamed microfoam in classic glass.',
      price: 120.00,
      category: 'Coffee',
      imageUrl: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
    },
    {
      vendorSlug: 'tomoca-heritage-roasters',
      name: 'Whole Bean Sidama Coffee (500g Bag)',
      description: 'Medium roast artisan beans with notes of blueberry, chocolate, and cane sugar.',
      price: 680.00,
      category: 'Beans',
      imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
    },

    // MedCare Central Pharmacy
    {
      vendorSlug: 'medcare-central-pharmacy',
      name: 'High Potency Vitamin C 1000mg + Zinc',
      description: 'Immune defense support dietary supplement with bioflavonoids (60 tablets).',
      price: 850.00,
      category: 'Wellness',
      imageUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
    },
    {
      vendorSlug: 'medcare-central-pharmacy',
      name: 'Comprehensive Home First Aid Kit',
      description: 'Sterile gauze, bandages, antiseptic wipes, burn gel, medical tape, and shears.',
      price: 1200.00,
      category: 'First Aid',
      imageUrl: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
    },
  ];

  let insertedCount = 0;
  for (const item of productsToSeed) {
    const vendorId = vendorMap[item.vendorSlug];
    if (!vendorId) {
      console.warn(`Vendor slug not found: ${item.vendorSlug}`);
      continue;
    }

    // Check if product already exists
    const existing = await prisma.product.findFirst({
      where: { vendorId, name: item.name },
    });

    if (!existing) {
      await prisma.product.create({
        data: {
          vendorId,
          name: item.name,
          description: item.description,
          price: item.price,
          category: item.category,
          imageUrl: item.imageUrl,
          isAvailable: item.isAvailable,
        },
      });
      insertedCount++;
      console.log(`  + Added: ${item.name} (${item.vendorSlug})`);
    } else {
      console.log(`  = Already exists: ${item.name}`);
    }
  }

  console.log(`🎉 Seeding complete! Inserted ${insertedCount} new products.`);
}

seedProducts()
  .catch((e) => {
    console.error('Error seeding products:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
