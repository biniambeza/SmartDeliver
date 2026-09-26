const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@smartdeliver.com';
  const password = 'SuperSecretPassword123!';
  
  const existing = await prisma.user.findUnique({ where: { email } });
  
  if (existing) {
    console.log('Admin user already exists!');
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: 'God Admin',
      role: 'ADMIN',
      isActive: true,
      isVerified: true
    }
  });

  console.log('✅ God Admin account created successfully!');
  console.log('--------------------------------------------------');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log('--------------------------------------------------');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
