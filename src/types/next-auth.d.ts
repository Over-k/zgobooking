import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isAdmin?: boolean;
      isHost?: boolean;
      firstName?: string;
      lastName?: string;
      phone?: string;
    }
  }

  interface User {
    id: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
    isAdmin?: boolean;
    isHost?: boolean;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email?: string | null;
    isAdmin?: boolean;
    isHost?: boolean;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }
} 