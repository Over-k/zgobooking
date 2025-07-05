export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profileImage: string;
  bio?: string;
  city?: string;
  country?: string;
  language: string;
  currency: string;
  timezone: string;
  privacySettings: {
    showProfile: boolean;
    shareActivity: boolean;
    allowMarketingEmails: boolean;
  };
}

export interface AccountSettings {
  language: string;
  currency: string;
  timezone: string;
  privacySettings: {
    showProfile: boolean;
    shareActivity: boolean;
    allowMarketingEmails: boolean;
  };
}

export interface LoginHistoryItem {
  date: string;
  location: string;
  device: string;
}

export interface SecuritySettings {
  email: string;
  twoFactorEnabled: boolean;
  lastPasswordChange: string;
  emailVerified: boolean;
  loginHistory: LoginHistoryItem[];
}