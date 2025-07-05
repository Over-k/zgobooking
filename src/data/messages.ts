// Use more flexible types to avoid Prisma client type mismatches
type MockMessageThread = {
    id: string;
    lastMessageId: string | null;
    createdAt: Date;
    updatedAt: Date;
    listingId: string | null;
    bookingId: string | null;
};

type MockMessage = {
    id: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    isRead: boolean;
    threadId: string;
    senderId: string;
    recipientId: string;
};

type MockMessageThreadParticipant = {
    threadId: string;
    userId: string;
    unreadCount: number;
    isArchived: boolean;
    lastReadAt: Date | null;
    joinedAt: Date;
};

export const mockMessageThreads: MockMessageThread[] = [
    {
        id: "thread1",
        lastMessageId: "msg5",
        createdAt: new Date("2024-12-15T15:30:00Z"), // Use earliest message date
        updatedAt: new Date("2025-01-15T08:45:00Z"), // Use latest message date
        listingId: "listing-1",
        bookingId: "booking-1",
    },
    {
        id: "thread2",
        lastMessageId: "msg8",
        createdAt: new Date("2025-01-20T14:15:00Z"),
        updatedAt: new Date("2025-02-09T10:20:00Z"),
        listingId: "listing-1",
        bookingId: "booking-2",
    },
    {
        id: "thread3",
        lastMessageId: "msg12", // Note: You'll need to add msg11 and msg12
        createdAt: new Date("2025-03-10T09:45:00Z"),
        updatedAt: new Date("2025-03-20T16:30:00Z"),
        listingId: "listing-2",
        bookingId: "booking-3",
    }
];

export const mockMessages: MockMessage[] = [
    // Thread 1: John Doe and Tai
    {
        id: "msg1",
        content: "Hi Tai, I'm interested in booking your place for January 10-15. Is it available?",
        createdAt: new Date("2024-12-15T15:30:00Z"),
        updatedAt: new Date("2024-12-15T15:30:00Z"),
        isRead: true,
        threadId: "thread1",
        senderId: "user-1", // John Doe
        recipientId: "user-2", // Tai
    },
    {
        id: "msg2",
        content: "Hi John! Yes, it's available for those dates. The rate is $150/night. Would you like to proceed with the booking?",
        createdAt: new Date("2024-12-15T16:00:00Z"),
        updatedAt: new Date("2024-12-15T16:00:00Z"),
        isRead: true,
        threadId: "thread1",
        senderId: "user-2", // Tai
        recipientId: "user-1", // John Doe
    },
    {
        id: "msg3",
        content: "Great! I just booked it. Is it possible to check in around 9 PM?",
        createdAt: new Date("2024-12-15T17:00:00Z"),
        updatedAt: new Date("2024-12-15T17:00:00Z"),
        isRead: true,
        threadId: "thread1",
        senderId: "user-1", // John Doe
        recipientId: "user-2", // Tai
    },
    {
        id: "msg4",
        content: "9 PM check-in is fine. I'll make sure someone is there to greet you.",
        createdAt: new Date("2024-12-15T17:30:00Z"),
        updatedAt: new Date("2024-12-15T17:30:00Z"),
        isRead: true,
        threadId: "thread1",
        senderId: "user-2", // Tai
        recipientId: "user-1", // John Doe
    },
    {
        id: "msg5",
        content: "Perfect, enjoy your stay!",
        createdAt: new Date("2025-01-15T08:45:00Z"),
        updatedAt: new Date("2025-01-15T08:45:00Z"),
        isRead: true,
        threadId: "thread1",
        senderId: "user-2", // Tai (fixed - was user-1)
        recipientId: "user-1", // John Doe
    },

    // Thread 2: Jane Smith and Tai
    {
        id: "msg6",
        content: "Hello Tai, I've booked your place for Feb 5-10. I wanted to ask if you have recommendations for local restaurants?",
        createdAt: new Date("2025-01-20T14:15:00Z"),
        updatedAt: new Date("2025-01-20T14:15:00Z"),
        isRead: true,
        threadId: "thread2",
        senderId: "user-3", // Jane Smith (assuming user-3)
        recipientId: "user-2", // Tai
    },
    {
        id: "msg7",
        content: "Hi Jane! There are several great restaurants within walking distance. I'll prepare a list for you with my favorites.",
        createdAt: new Date("2025-01-20T15:00:00Z"),
        updatedAt: new Date("2025-01-20T15:00:00Z"),
        isRead: true,
        threadId: "thread2",
        senderId: "user-2", // Tai
        recipientId: "user-3", // Jane Smith
    },
    {
        id: "msg8",
        content: "Thanks for understanding. See you tomorrow!",
        createdAt: new Date("2025-02-09T10:20:00Z"),
        updatedAt: new Date("2025-02-09T10:20:00Z"),
        isRead: false,
        threadId: "thread2",
        senderId: "user-3", // Jane Smith
        recipientId: "user-2", // Tai
    },

    // Thread 3: Michael Chen and Sarah
    {
        id: "msg9",
        content: "Hi Sarah, I'm really looking forward to staying at your villa next week. Do you have airport pickup service?",
        createdAt: new Date("2025-03-10T09:45:00Z"),
        updatedAt: new Date("2025-03-10T09:45:00Z"),
        isRead: true,
        threadId: "thread3",
        senderId: "user-4", // Michael Chen
        recipientId: "user-5", // Sarah
    },
    {
        id: "msg10",
        content: "Hello Michael! Yes, we offer airport pickup for $25. Would you like me to arrange that for you?",
        createdAt: new Date("2025-03-10T10:30:00Z"),
        updatedAt: new Date("2025-03-10T10:30:00Z"),
        isRead: true,
        threadId: "thread3",
        senderId: "user-5", // Sarah
        recipientId: "user-4", // Michael Chen
    },
    {
        id: "msg11",
        content: "Yes, please arrange the pickup. My flight arrives at 3:30 PM on March 15th. Also, I noticed the listing mentions a pool - is it heated?",
        createdAt: new Date("2025-03-15T12:00:00Z"),
        updatedAt: new Date("2025-03-15T12:00:00Z"),
        isRead: true,
        threadId: "thread3",
        senderId: "user-4", // Michael Chen
        recipientId: "user-5", // Sarah
    },
    {
        id: "msg12",
        content: "The pool will be cleaned daily during your stay. Let me know if you need anything else!",
        createdAt: new Date("2025-03-20T16:30:00Z"),
        updatedAt: new Date("2025-03-20T16:30:00Z"),
        isRead: false,
        threadId: "thread3",
        senderId: "user-5", // Sarah
        recipientId: "user-4", // Michael Chen
    }
];

export const mockMessageThreadParticipants: MockMessageThreadParticipant[] = [
    // Thread 1 participants
    {
        threadId: "thread1",
        userId: "user-1", // John Doe
        unreadCount: 0,
        isArchived: false,
        lastReadAt: new Date("2025-01-15T08:45:00Z"),
        joinedAt: new Date("2024-12-15T15:30:00Z"),
    },
    {
        threadId: "thread1",
        userId: "user-2", // Tai
        unreadCount: 0,
        isArchived: false,
        lastReadAt: new Date("2025-01-15T08:45:00Z"),
        joinedAt: new Date("2024-12-15T15:30:00Z"),
    },

    // Thread 2 participants
    {
        threadId: "thread2",
        userId: "user-2", // Tai
        unreadCount: 1, // Has 1 unread message (msg8)
        isArchived: false,
        lastReadAt: new Date("2025-01-20T15:00:00Z"),
        joinedAt: new Date("2025-01-20T14:15:00Z"),
    },
    {
        threadId: "thread2",
        userId: "user-3", // Jane Smith
        unreadCount: 0,
        isArchived: false,
        lastReadAt: new Date("2025-02-09T10:20:00Z"),
        joinedAt: new Date("2025-01-20T14:15:00Z"),
    },

    // Thread 3 participants
    {
        threadId: "thread3",
        userId: "user-4", // Michael Chen
        unreadCount: 1, // Has 1 unread message (msg12)
        isArchived: false,
        lastReadAt: new Date("2025-03-15T12:00:00Z"),
        joinedAt: new Date("2025-03-10T09:45:00Z"),
    },
    {
        threadId: "thread3",
        userId: "user-5", // Sarah
        unreadCount: 0,
        isArchived: false,
        lastReadAt: new Date("2025-03-20T16:30:00Z"),
        joinedAt: new Date("2025-03-10T09:45:00Z"),
    },
];

// Example message attachments (optional - add if you want to test attachments)
export const mockMessageAttachments = [
    {
        id: "att1",
        type: "IMAGE" as const,
        url: "https://example.com/checkin-instructions.jpg",
        name: "Check-in Instructions",
        previewUrl: "https://example.com/checkin-instructions-thumb.jpg",
        fileSize: 245760,
        mimeType: "image/jpeg",
        messageId: "msg4",
        createdAt: new Date("2024-12-15T17:30:00Z"),
        latitude: null,
        longitude: null,
        locationName: null,
    },
    {
        id: "att2",
        type: "LOCATION" as const,
        url: null,
        name: "Villa Location",
        previewUrl: null,
        fileSize: null,
        mimeType: null,
        latitude: 31.6295,
        longitude: -7.9811,
        locationName: "Marrakesh, Morocco",
        messageId: "msg10",
        createdAt: new Date("2025-03-10T10:30:00Z"),
    }
];