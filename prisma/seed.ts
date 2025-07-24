import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import { mockUsers } from '../src/data/users.js';
import { mockListings } from '../src/data/listings.js';
import { mockBookings } from '../src/data/bookings.js';
import { mockReviews } from '../src/data/reviews.js';
import { mockMessageThreads, mockMessages, mockMessageThreadParticipants, mockMessageAttachments} from '../src/data/messages.js';
import { mockFavorites } from '../src/data/favorites.js';
import { mockPaymentMethods } from '../src/data/paymentMethods.js';
import { mockHostRequests } from '../src/data/hostRequests.js';
import { mockNotifications } from '../src/data/notifications.js';
const prisma = new PrismaClient();

// Configure Cloudinary with enhanced timeout and retry settings
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 60000, // Increased timeout to 60 seconds
  upload_prefix: 'https://api.cloudinary.com' // Explicit API endpoint
});

// Enhanced image upload function with retries
async function uploadImageToCloudinary(imageUrl: string, retries = 3): Promise<string> {
  if (imageUrl.startsWith('/images/')){
    console.log(`⚠️ Using original URL: ${imageUrl}`);
    return imageUrl;
  }
  // Check if Cloudinary credentials are properly set
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.log(`⚠️ Cloudinary credentials missing. Using original URL: ${imageUrl}`);
    console.log(`   CLOUDINARY_CLOUD_NAME: ${cloudName || 'NOT SET'}`);
    console.log(`   CLOUDINARY_API_KEY: ${apiKey ? 'SET' : 'NOT SET'}`);
    console.log(`   CLOUDINARY_API_SECRET: ${apiSecret ? 'SET' : 'NOT SET'}`);
    return imageUrl;
  }

  // Check if credentials are still placeholder values
  if (cloudName === 'your-cloud-name' || apiKey === 'your-api-key' || apiSecret === 'your-api-secret') {
    console.log(`⚠️ Cloudinary credentials are placeholder values. Using original URL: ${imageUrl}`);
    return imageUrl;
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`📤 Uploading image to Cloudinary (attempt ${attempt}/${retries}): ${imageUrl}`);
      const result = await cloudinary.uploader.upload(imageUrl);
      console.log(`✅ Successfully uploaded to Cloudinary: ${result.secure_url}`);
      return result.secure_url;
    } catch (error: any) {
      console.error(`❌ Attempt ${attempt} failed to upload image ${imageUrl}:`, {
        error: error.message || error,
        http_code: error.http_code,
        name: error.name
      });
      
      if (attempt === retries) {
        console.log(`⚠️ Using original URL after ${retries} failed attempts: ${imageUrl}`);
        return imageUrl;
      }
      
      // Wait before retrying (exponential backoff)
      const waitTime = 2000 * Math.pow(2, attempt - 1);
      console.log(`⏳ Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  return imageUrl;
}

// Batch processing helper with error handling
async function processInBatches<T>(
  items: T[],
  batchSize: number,
  processor: (batch: T[]) => Promise<void>,
  entityName: string
): Promise<void> {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    try {
      await processor(batch);
      console.log(`Processed ${Math.min(i + batchSize, items.length)} of ${items.length} ${entityName}`);
    } catch (error) {
      console.error(`Error processing batch ${i / batchSize + 1} of ${entityName}:`, error);
      throw error;
    }
  }
}

// Safer database cleanup function without trigger disabling
async function clearDatabase(): Promise<void> {
  console.log('Clearing existing data...');
  
  try {
    // Check if tables exist before trying to delete from them
    const tablesToCheck = [
      'message_attachments',
      'message_thread_participants', 
      'messages',
      'message_threads',
      'review_photos',
      'reviews',
      'bookings',
      'favorites',
      'wishlist_listings',
      'wishlists',
      'listing_images',
      'listings',
      'payment_methods',
      'host_requests',
      'users',
      'notifications'
    ];

    // Build delete operations only for existing tables
    const deleteOperations = [];
    
    for (const table of tablesToCheck) {
      try {
        // Try to check if table exists by doing a simple query
        await prisma.$queryRawUnsafe(`SELECT 1 FROM "${table}" LIMIT 1`);
        // If we get here, table exists, so add delete operation
        switch (table) {
          case 'message_attachments':
            deleteOperations.push(prisma.messageAttachment.deleteMany());
            break;
          case 'message_thread_participants':
            deleteOperations.push(prisma.messageThreadParticipant.deleteMany());
            break;
          case 'messages':
            deleteOperations.push(prisma.message.deleteMany());
            break;
          case 'message_threads':
            deleteOperations.push(prisma.messageThread.deleteMany());
            break;
          case 'review_photos':
            deleteOperations.push(prisma.reviewPhoto.deleteMany());
            break;
          case 'reviews':
            deleteOperations.push(prisma.review.deleteMany());
            break;
          case 'bookings':
            deleteOperations.push(prisma.booking.deleteMany());
            break;
          case 'favorites':
            deleteOperations.push(prisma.favorite.deleteMany());
            break;
          case 'wishlist_listings':
            deleteOperations.push(prisma.wishlistListing.deleteMany());
            break;
          case 'wishlists':
            deleteOperations.push(prisma.wishlist.deleteMany());
            break;
          case 'listing_images':
            deleteOperations.push(prisma.listingImage.deleteMany());
            break;
          case 'listings':
            deleteOperations.push(prisma.listing.deleteMany());
            break;
          case 'payment_methods':
            deleteOperations.push(prisma.paymentMethod.deleteMany());
            break;
          case 'host_requests':
            deleteOperations.push(prisma.hostRequest.deleteMany());
            break;
          case 'users':
            deleteOperations.push(prisma.user.deleteMany());
            break;
          case 'notifications':
            deleteOperations.push(prisma.notification.deleteMany());
            break;
        }
        console.log(`✅ Table ${table} exists, will be cleared`);
      } catch (error) {
        console.log(`⚠️ Table ${table} does not exist, skipping`);
      }
    }

    if (deleteOperations.length > 0) {
      await prisma.$transaction(deleteOperations);
      console.log('Database cleared successfully');
    } else {
      console.log('No existing tables found to clear');
    }
  } catch (error) {
    console.error('Error clearing database:', error);
    throw error;
  }
}

// Seeding functions
async function seedUsers(): Promise<void> {
  console.log('Seeding users...');
  
  const batchProcessor = async (userBatch: typeof mockUsers) => {
    const userPromises = userBatch.map(async (user) => {
      const profileImageUrl = await uploadImageToCloudinary(user.profileImage);
      
      return prisma.user.create({
        data: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          profileImage: profileImageUrl,
          joinDate: user.joinDate,
          isHost: user.isHost,
          isAdmin: user.isAdmin,
          isVerified: user.isVerified,
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified,
          governmentIdVerified: user.governmentIdVerified,
          identityVerified: user.identityVerified,
          securitySettings: {
            create: {
              id: user.securitySettings.id,
              email: user.securitySettings.email,
              password: user.securitySettings.password,
              passwordSalt: user.securitySettings.passwordSalt,
              passwordResetToken: user.securitySettings.passwordResetToken,
              passwordResetExpires: user.securitySettings.passwordResetExpires,
              twoFactorEnabled: user.securitySettings.twoFactorEnabled,
              twoFactorSecret: user.securitySettings.twoFactorSecret,
              lastPasswordChange: user.securitySettings.lastPasswordChange,
              failedLoginAttempts: user.securitySettings.failedLoginAttempts,
              accountLocked: user.securitySettings.accountLocked,
              accountLockedUntil: user.securitySettings.accountLockedUntil,
              emailVerifiedAt: user.securitySettings.emailVerifiedAt,
            },
          },
          loginHistory: {
            create: user.loginHistory.map((login) => ({
              id: login.id,
              date: login.date,
              location: login.location,
              device: login.device,
              securitySettingsId: login.securitySettingsId,
            })),
          },
        }
      });
    });
    
    await Promise.all(userPromises);
  };
  
  await processInBatches(mockUsers, 5, batchProcessor, 'users');
  console.log(`Successfully seeded ${mockUsers.length} users`);
}

async function seedListings(): Promise<void> {
  console.log('Seeding listings...');
  
  const batchProcessor = async (listingBatch: typeof mockListings) => {
    const listingPromises = listingBatch.map(async (listing) => {
      try {
        // First verify the host exists
        const hostExists = await prisma.user.findUnique({
          where: { id: listing.hostId }
        });
        
        if (!hostExists) {
          throw new Error(`Host with ID ${listing.hostId} not found`);
        }

        // Upload all images for this listing
        const imageUrls = await Promise.all(
          (listing.images || []).map((img: any) => uploadImageToCloudinary(img.url))
        );

        // Create the listing with nested data
        return await prisma.listing.create({
          data: {
            id: listing.id,
            title: listing.title,
            propertyType: listing.propertyType,
            description: listing.description,
            price: listing.price,
            currency: listing.currency || 'USD',
            beds: listing.beds,
            bathrooms: listing.bathrooms,
            category: listing.category,
            rating: listing.rating || 0,
            reviewsCount: listing.reviewsCount || 0,
            instantBooking: listing.instantBooking || false,
            minimumStay: listing.minimumStay || 1,
            maximumStay: listing.maximumStay || 365,
            maxAdults: listing.maxAdults || 1,
            maxChildren: listing.maxChildren || 0,
            maxInfants: listing.maxInfants || 0,
            maxPets: listing.maxPets || 0,
            status: listing.status || 'Active',
            
            images: {
              create: imageUrls.map((url: string, index: number) => ({
                url,
                isPrimary: index === 0,
                caption: listing.images?.[index]?.caption,
              }))
            },
            
            host: {
              connect: { id: listing.hostId }
            },
            
            ...(listing.location && {
              location: {
                create: {
                  city: listing.location.city,
                  country: listing.location.country,
                  neighborhood: listing.location.neighborhood || null,
                  latitude: listing.location.latitude,
                  longitude: listing.location.longitude,
                  address: listing.location.address,
                }
              }
            }),
            
            ...(listing.amenities && {
              amenities: {
                create: {
                  essential: listing.amenities?.essential || [],
                  safety: listing.amenities?.safety || [],
                  outdoor: listing.amenities?.outdoor || [],
                  features: listing.amenities?.features || [],
                  accessibility: listing.amenities?.accessibility || [],
                  others: listing.amenities?.others || [],
                }
              }
            }),
          }
        });
      } catch (error) {
        console.error(`Error creating listing ${listing.title}:`, error);
        throw error;
      }
    });

    await Promise.all(listingPromises);
  };

  await processInBatches(mockListings, 3, batchProcessor, 'listings');
  console.log(`Successfully seeded ${mockListings.length} listings`);
}

async function seedPaymentMethods(): Promise<void> {
  console.log('Seeding payment methods...');
  
  const batchProcessor = async (paymentBatch: typeof mockPaymentMethods) => {
    await prisma.paymentMethod.createMany({
      data: paymentBatch.map(payment => ({
        ...payment,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      skipDuplicates: true
    });
  };
  
  await processInBatches(mockPaymentMethods, 20, batchProcessor, 'payment methods');
  console.log(`Successfully seeded ${mockPaymentMethods.length} payment methods`);
}

async function seedHostRequests(): Promise<void> {
  console.log('Seeding host requests...');
  
  const batchProcessor = async (requestBatch: typeof mockHostRequests) => {
    await prisma.hostRequest.createMany({
      data: requestBatch.map(request => ({
        ...request,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      skipDuplicates: true
    });
  };
  
  await processInBatches(mockHostRequests, 20, batchProcessor, 'host requests');
  console.log(`Successfully seeded ${mockHostRequests.length} host requests`);
}
async function seedBookings(): Promise<void> {
  console.log('Seeding bookings...');
  
  // First verify all required relations exist
  const verifyRelations = async () => {
    // Verify listings exist
    const listingIds = Array.from(new Set(mockBookings.map(b => b.listingId)));
    const existingListings = await prisma.listing.findMany({
      where: { id: { in: listingIds } },
      select: { id: true }
    });
    
    // Verify payment methods exist
    const paymentMethodIds = Array.from(new Set(
      mockBookings
        .map(b => b.paymentMethodId)
        .filter(id => id !== undefined && id !== null) as string[]
    ));
    const existingPaymentMethods = await prisma.paymentMethod.findMany({
      where: { id: { in: paymentMethodIds } },
      select: { id: true }
    });

    // Verify users exist
    const userIds = Array.from(new Set([
      ...mockBookings.map(b => b.guestId),
      ...mockBookings.map(b => b.hostId)
    ]));
    const existingUsers = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true }
    });

    // Check for missing relations
    const missingListings = listingIds.filter(id => 
      !existingListings.some(l => l.id === id)
    );
    
    const missingPaymentMethods = paymentMethodIds.filter(id => 
      !existingPaymentMethods.some(p => p.id === id)
    );

    const missingUsers = userIds.filter(id =>
      !existingUsers.some(u => u.id === id)
    );
    
    if (missingListings.length > 0) {
      throw new Error(`Missing listings: ${missingListings.join(', ')}`);
    }
    
    if (missingPaymentMethods.length > 0) {
      throw new Error(`Missing payment methods: ${missingPaymentMethods.join(', ')}`);
    }

    if (missingUsers.length > 0) {
      throw new Error(`Missing users: ${missingUsers.join(', ')}`);
    }
  };
  
  await verifyRelations();
  
  const batchProcessor = async (bookingBatch: typeof mockBookings) => {
    const bookingData = bookingBatch.map(booking => ({
      id: booking.id,
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      total: booking.total,
      status: booking.status,
      guestId: booking.guestId,
      hostId: booking.hostId,
      listingId: booking.listingId,
      paymentMethodId: booking.paymentMethodId,
      adults: booking.adults,
      children: booking.children,
      infants: booking.infants,
      pets: booking.pets,
      nightlyRate: booking.nightlyRate,
      nights: booking.nights,
      cleaningFee: booking.cleaningFee,
      serviceFee: booking.serviceFee,
      taxes: booking.taxes,
      currency: booking.currency,
      paymentStatus: booking.paymentStatus,
      specialRequests: booking.specialRequests,
      contactPhone: booking.contactPhone,
      contactEmail: booking.contactEmail,
      hasReviewed: booking.hasReviewed,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      cancelledBy: booking.cancelledBy,
      cancelledAt: booking.cancelledAt,
      cancellationReason: booking.cancellationReason,
      refundAmount: booking.refundAmount
    }));
    
    await prisma.booking.createMany({
      data: bookingData,
      skipDuplicates: true
    });
  };
  
  await processInBatches(mockBookings, 10, batchProcessor, 'bookings');
  console.log(`Successfully seeded ${mockBookings.length} bookings`);
}

async function seedReviews(): Promise<void> {
  console.log('Seeding reviews...');
  
  const batchProcessor = async (reviewBatch: typeof mockReviews) => {
    const reviewData = reviewBatch.map(review => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      reviewType: review.reviewType,
      userId: review.userId,
      receiverId: review.receiverId,
      listingId: review.listingId,
      bookingId: review.bookingId,
      cleanliness: review.cleanliness || 0,
      communication: review.communication || 0,
      checkIn: review.checkIn || 0,
      accuracy: review.accuracy || 0,
      location: review.location || 0,
      value: review.value || 0,
      response: review.response || null,
      responseCreatedAt: review.responseCreatedAt ? new Date(review.responseCreatedAt) : null,
      createdAt: new Date(review.createdAt),
      updatedAt: new Date(review.updatedAt),
      isPublic: review.isPublic,
      helpfulVotes: review.helpfulVotes,
      reportCount: review.reportCount,
      isVerifiedStay: review.isVerifiedStay
    }));
    
    await prisma.review.createMany({
      data: reviewData,
      skipDuplicates: true
    });
  };
  
  await processInBatches(mockReviews, 20, batchProcessor, 'reviews');
  console.log(`Successfully seeded ${mockReviews.length} reviews`);
}

async function seedMessages(): Promise<void> {
  console.log('Seeding message threads, messages, and participants...');

  try {
    // 1. Create message threads first (without lastMessageId)
    console.log('Creating message threads...');
    for (const thread of mockMessageThreads) {
      await prisma.messageThread.create({
        data: {
          id: thread.id,
          createdAt: thread.createdAt,
          updatedAt: thread.updatedAt,
          listingId: thread.listingId,
          bookingId: thread.bookingId,
          // Don't set lastMessageId yet - will update after messages are created
        } as any
      });
    }
    console.log(`Created ${mockMessageThreads.length} message threads`);

    // 2. Create messages
    console.log('Creating messages...');
    const batchProcessor = async (messageBatch: typeof mockMessages) => {
      const messageData = messageBatch.map(message => ({
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        recipientId: message.recipientId,
        threadId: message.threadId,
        isRead: message.isRead,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
      }));

      await prisma.message.createMany({
        data: messageData,
        skipDuplicates: true
      });
    };

    await processInBatches(mockMessages, 20, batchProcessor, 'messages');
    console.log(`Successfully seeded ${mockMessages.length} messages`);

    // 3. Update threads with lastMessageId
    console.log('Linking last messages to threads...');
    for (const thread of mockMessageThreads) {
      if (thread.lastMessageId) {
        // Find the last message to get its data
        const lastMessage = mockMessages.find(msg => msg.id === thread.lastMessageId);
        await prisma.messageThread.update({
          where: { id: thread.id },
          data: { 
            lastMessageId: thread.lastMessageId,
            ...(lastMessage?.createdAt && { lastMessageAt: lastMessage.createdAt }),
            ...(lastMessage?.content && { lastMessageText: lastMessage.content })
          }
        });
      }
    }
    console.log('Linked last messages to threads');

    // 4. Create thread participants
    console.log('Creating thread participants...');
    const participantBatchProcessor = async (participantBatch: typeof mockMessageThreadParticipants) => {
      const participantData = participantBatch.map(participant => ({
        threadId: participant.threadId,
        userId: participant.userId,
        unreadCount: participant.unreadCount,
        isArchived: participant.isArchived,
        lastReadAt: participant.lastReadAt,
        joinedAt: participant.joinedAt,
      }));

      await prisma.messageThreadParticipant.createMany({
        data: participantData,
        skipDuplicates: true
      });
    };

    await processInBatches(mockMessageThreadParticipants, 20, participantBatchProcessor, 'thread participants');
    console.log(`Successfully seeded ${mockMessageThreadParticipants.length} thread participants`);

    // 5. Create message attachments (if any)
    if (mockMessageAttachments && mockMessageAttachments.length > 0) {
      console.log('Creating message attachments...');
      const attachmentBatchProcessor = async (attachmentBatch: typeof mockMessageAttachments) => {
        const attachmentData = attachmentBatch.map(attachment => ({
          id: attachment.id,
          type: attachment.type,
          url: attachment.url,
          name: attachment.name,
          previewUrl: attachment.previewUrl,
          fileSize: attachment.fileSize,
          mimeType: attachment.mimeType,
          latitude: attachment.latitude,
          longitude: attachment.longitude,
          locationName: attachment.locationName,
          messageId: attachment.messageId,
          createdAt: attachment.createdAt,
        }));

        await prisma.messageAttachment.createMany({
          data: attachmentData,
          skipDuplicates: true
        });
      };

      await processInBatches(mockMessageAttachments, 20, attachmentBatchProcessor, 'message attachments');
      console.log(`Successfully seeded ${mockMessageAttachments.length} message attachments`);
    }

  } catch (error) {
    console.error('Error seeding messages:', error);
    throw error;
  }
}

async function seedFavorites(): Promise<void> {
  console.log('Seeding favorites...');
  
  // Remove duplicates based on userId-listingId combination
  const uniqueFavorites = mockFavorites.filter((favorite, index, self) =>
    self.findIndex(f => f.userId === favorite.userId && f.listingId === favorite.listingId) === index
  );
  
  const batchProcessor = async (favoriteBatch: typeof uniqueFavorites) => {
    const favoriteData = favoriteBatch.map(favorite => ({
      id: favorite.id,
      userId: favorite.userId,
      listingId: favorite.listingId,
      createdAt: favorite.createdAt || new Date(),
    }));
    
    await prisma.favorite.createMany({
      data: favoriteData,
      skipDuplicates: true
    });
  };
  
  await processInBatches(uniqueFavorites, 20, batchProcessor, 'favorites');
  console.log(`Successfully seeded ${uniqueFavorites.length} favorites`);
}

async function seedNotifications(): Promise<void> {
  console.log('Seeding notifications...');
  await prisma.notification.createMany({
    data: mockNotifications.map(n => ({
      id: n.id,
      type: n.type,
      message: n.message,
      isRead: n.isRead,
      createdAt: n.createdAt,
      userId: n.userId
    })),
    skipDuplicates: true
  });
  console.log(`Successfully seeded ${mockNotifications.length} notifications`);
}

// Main seeding function
async function main(): Promise<void> {
  console.log('Starting database seeding...');
  const startTime = Date.now();

  try {
    // Clear existing data
    await clearDatabase();

    // Seed data in dependency order
    await seedUsers();
    await seedNotifications();
    await seedPaymentMethods();
    await seedHostRequests();
    await seedListings();
    await seedBookings();
    await seedReviews();
    await seedMessages();
    await seedFavorites();

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log(`Database seeding completed successfully in ${duration.toFixed(2)} seconds!`);

    // Print summary with message-related counts
    const counts = await Promise.all([
      prisma.user.count(),
      prisma.listing.count(),
      prisma.booking.count(),
      prisma.review.count(),
      prisma.messageThread.count(),
      prisma.message.count(),
      prisma.messageThreadParticipant.count(),
      prisma.messageAttachment.count(),
      prisma.favorite.count(),
      prisma.notification.count()
    ]);

    console.log('\nSeeding Summary:');
    console.log(`- Users: ${counts[0]}`);
    console.log(`- Listings: ${counts[1]}`);
    console.log(`- Bookings: ${counts[2]}`);
    console.log(`- Reviews: ${counts[3]}`);
    console.log(`- Message Threads: ${counts[4]}`);
    console.log(`- Messages: ${counts[5]}`);
    console.log(`- Thread Participants: ${counts[6]}`);
    console.log(`- Message Attachments: ${counts[7]}`);
    console.log(`- Favorites: ${counts[8]}`);
    console.log(`- Notifications: ${counts[9]}`);

  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    console.log('Database connection closed');
  }
}

// Execute seeding
main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  });