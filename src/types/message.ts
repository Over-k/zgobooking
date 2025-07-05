import { User } from "./user";
import { Listing } from "./listing";
import { BookingListing } from "./booking";

// message.ts
export interface Message {
    id: string;
    content: string;
    createdAt: Date;
    isRead: boolean;
    threadId: string;
    senderId: string;
    recipientId: string;
    
    // Optional populated relations
    sender?: User;
    recipient?: User;
    attachments?: MessageAttachment[];
}

export interface MessageAttachment {
    id: string;
    type: string; // image, document, location
    url?: string;
    name?: string;
    previewUrl?: string;
    latitude?: number;
    longitude?: number;
    messageId: string;
}

export interface MessageThread {
    id: string;
    lastMessageId?: string;
    lastMessageAt: Date;
    lastMessageText: string;
    createdAt: Date;
    updatedAt: Date;
    listingId?: string;
    bookingId?: string;
    
    // Optional populated relations
    participants?: MessageThreadParticipant[];
    messages?: Message[];
    listing?: Listing;
    booking?: BookingListing;
}

export interface MessageThreadParticipant {
    unreadCount: number;
    isArchived: boolean;
    threadId: string;
    userId: string;
    
    // Optional populated relations
    thread?: MessageThread;
    user?: User;
}