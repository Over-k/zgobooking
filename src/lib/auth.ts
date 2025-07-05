import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { AuthModel } from "@/lib/models/auth";
import { PrismaClient } from "@prisma/client";
import { PasswordManager } from "@/lib/utils/password";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const { email, password } = credentials;

        try {
          const user = await prisma.user.findUnique({
            where: { email },
            include: { securitySettings: true }
          });

          if (!user) {
            console.log("User not found");
            return null;
          }

          if (!user.securitySettings) {
            console.log("User security settings not found");
            return null;
          }

          const isValid = await PasswordManager.verifyPassword(
            password,
            user.securitySettings.password,
            user.securitySettings.passwordSalt
          );

          if (!isValid) {
            console.log("Invalid password");
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            isAdmin: user.isAdmin,
            isHost: user.isHost,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone ?? undefined,
          };
        } catch (error) {
          console.error('Authorization error:', error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: AuthModel.getPath('signin'),
    signOut: "/",
  },
  callbacks: {
    async signIn({ user, account }) {
      try {
        if (account?.provider === 'google' && user.email) {
          // Check if user exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
            include: { securitySettings: true }
          });

          if (existingUser) {
            // Update existing user with Google profile info
            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                firstName: user.name?.split(' ')[0] || '',
                lastName: user.name?.split(' ')[1] || '',
                profileImage: user.image || '',
              }
            });
          } else {
            // Create new user with security settings and login history
            await prisma.user.create({
              data: {
                email: user.email,
                firstName: user.name?.split(' ')[0] || '',
                lastName: user.name?.split(' ')[1] || '',
                profileImage: user.image || '',
                joinDate: new Date(),
                securitySettings: {
                  create: {
                    email: user.email,
                    password: '',
                    passwordSalt: '',
                    lastPasswordChange: new Date(),
                    emailVerifiedAt: new Date()
                  }
                }
              }
            });
          }
        } else if (user.email) {
          // For credentials sign-in
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
            include: { securitySettings: true }
          });

          if (existingUser) {
            // First ensure security settings exist
            const securitySettings = await prisma.securitySettings.findUnique({
              where: { userId: existingUser.id }
            });

            if (!securitySettings) {
              // Create security settings if they don't exist
              await prisma.securitySettings.create({
                data: {
                  email: existingUser.email,
                  password: '',
                  passwordSalt: '',
                  lastPasswordChange: new Date(),
                  emailVerifiedAt: new Date(),
                  userId: existingUser.id
                }
              });
            }
          }
        }
        return true;
      } catch (error) {
        console.error('Error during sign-in:', error);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.isAdmin = user.isAdmin;
        token.isHost = user.isHost;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.phone = user.phone;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.isAdmin = token.isAdmin;
        session.user.isHost = token.isHost;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.phone = token.phone;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development'
};