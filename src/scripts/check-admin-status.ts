import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAdminStatus() {
  const email = 'aitmiloudkhaled@gmail.com';
  
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      isAdmin: true,
      firstName: true,
      lastName: true
    }
  });

  console.log('User data:', user);
}

checkAdminStatus()
  .catch(console.error)
  .finally(() => prisma.$disconnect()); 