import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "./lib/db";
import bcrypt from "bcryptjs";
import { decryptPassword, isBcryptHash, isEncryptedPassword } from "./lib/crypto";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      id: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials.email as string;
        const password = credentials.password as string;

        const result = await db.execute({
          sql: "SELECT * FROM users WHERE email = ?",
          args: [email],
        });

        const user = result.rows[0];

        if (!user) {
          throw new Error("Invalid credentials");
        }

        // Users in the main table are already verified
        let isValid = false;
        
        if (isBcryptHash(user.password as string)) {
          // Handle existing bcrypt hashes
          isValid = await bcrypt.compare(password, user.password as string);
        } else if (isEncryptedPassword(user.password as string)) {
          // Handle new encrypted passwords
          try {
            const decryptedPassword = decryptPassword(user.password as string);
            isValid = password === decryptedPassword;
          } catch (error) {
            isValid = false;
          }
        }

        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id as string,
          email: user.email as string,
          name: user.name as string,
          role: user.role as string,
        };
      },
    }),
    Credentials({
      id: "auto-login",
      credentials: {
        token: { label: "Auto-login Token", type: "text" },
      },
      authorize: async (credentials) => {
        const token = credentials.token as string;

        const result = await db.execute({
          sql: "SELECT * FROM users WHERE email_verification_token = ? AND email_verification_expires > ?",
          args: [token, Math.floor(Date.now() / 1000)],
        });

        const user = result.rows[0];

        if (!user) {
          throw new Error("Invalid or expired auto-login token");
        }

        // Clear the auto-login token after use
        await db.execute({
          sql: "UPDATE users SET email_verification_token = NULL, email_verification_expires = NULL WHERE id = ?",
          args: [user.id],
        });

        return {
          id: user.id as string,
          email: user.email as string,
          name: user.name as string,
          role: user.role as string,
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  // Enable automatic URL detection
  trustHost: true,
});
