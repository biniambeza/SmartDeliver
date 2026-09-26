const prisma = require('./src/lib/prisma');

async function setupTables() {
  console.log('Setting up Customer tables in PostgreSQL...');

  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS customer_addresses (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      label VARCHAR(100) NOT NULL,
      address TEXT NOT NULL,
      lat DECIMAL(10, 7),
      lng DECIMAL(10, 7),
      is_default BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS customer_payment_methods (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type VARCHAR(50) NOT NULL,
      provider VARCHAR(255) NOT NULL,
      expiry VARCHAR(50),
      is_default BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS customer_reviews (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      order_id VARCHAR(255) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      vendor_rating INTEGER NOT NULL,
      driver_rating INTEGER NOT NULL,
      comment TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS support_tickets (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      order_id VARCHAR(255),
      topic VARCHAR(255) NOT NULL,
      details TEXT NOT NULL,
      status VARCHAR(50) DEFAULT 'OPEN',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS customer_loyalty (
      user_id VARCHAR(255) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      points INTEGER DEFAULT 250,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  console.log('Customer tables setup successfully!');
}

setupTables()
  .catch(err => {
    console.error('Error setting up tables:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
