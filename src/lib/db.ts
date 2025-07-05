import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export { prisma };

export const dbModels = {
  listing: prisma.listing,
  // Add other models as needed
  user: prisma.user,
  review: prisma.review,
  hostInfo: prisma.hostInfo,
  securitySettings: prisma.securitySettings,
  accountSettings: prisma.accountSettings,
  notificationPreferences: prisma.notificationPreferences,
  paymentMethod: prisma.paymentMethod,
  booking: prisma.booking,
  message: prisma.message,
  availableDate: prisma.availableDate,
  listingImage: prisma.listingImage,
}; 