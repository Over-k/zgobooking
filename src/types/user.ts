import { Review } from "./review";
export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    profileImage: string;
    bio?: string;
    city?: string;
    country?: string;
    dateOfBirth?: Date;
    joinDate: Date;
    isHost: boolean;
    isAdmin: boolean;
    isVerified: boolean;
    emailVerified: boolean;
    phoneVerified: boolean;
    governmentIdVerified: boolean;
    identityVerified: boolean;
    
    // Optional related data
    paymentMethods?: PaymentMethod[];
    hostInfo?: HostInfo;
    wishlists?: Wishlist[];
    reviews?: {
        given: Review[];
        received: Review[];
    };
    notifications?: Notification[];
    securitySettings?: SecuritySettings;
    accountSettings?: AccountSettings;
    notificationPreferences?: NotificationPreferences;
}

export interface PaymentMethod {
    id: string;
    type: string; // credit_card, paypal, bank_account
    name: string;
    lastFour?: string;
    expiryDate?: string;
    isDefault: boolean;
    userId: string;
}

export interface HostInfo {
    id: string;
    superhost: boolean;
    responseRate: number;
    responseTime: string;
    acceptanceRate: number;
    hostSince: Date;
    languages: string[];
    totalReviews: number;
    averageRating: number;
    userId: string;
}

export interface Wishlist {
    id: string;
    name: string;
    description?: string;
    coverImageId?: string;
    createdAt: Date;
    updatedAt: Date;
    isPrivate: boolean;
    isDefault: boolean;
    shareableLink?: string;
    userId: string;
}

export interface Notification {
    id: string;
    type: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
    userId: string;
}

export interface SecuritySettings {
    id: string;
    email: string;
    password: string;
    passwordSalt: string;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    twoFactorEnabled: boolean;
    twoFactorSecret?: string;
    lastPasswordChange: Date;
    failedLoginAttempts: number;
    accountLocked: boolean;
    accountLockedUntil?: Date;
    emailVerifiedAt?: Date;
    userId: string;
}

export interface AccountSettings {
    id: string;
    language: string;
    currency: string;
    timezone: string;
    showProfile: boolean;
    shareActivity: boolean;
    allowMarketingEmails: boolean;
    userId: string;
}

export interface NotificationPreferences {
    id: string;
    emailMarketing: boolean;
    emailAccountUpdates: boolean;
    emailBookingReminders: boolean;
    emailNewMessages: boolean;
    pushMarketing: boolean;
    pushAccountUpdates: boolean;
    pushBookingReminders: boolean;
    pushNewMessages: boolean;
    smsMarketing: boolean;
    smsAccountUpdates: boolean;
    smsBookingReminders: boolean;
    smsNewMessages: boolean;
    userId: string;
}