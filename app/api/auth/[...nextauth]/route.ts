import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Clinician Access",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "doctor@basira.global" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;

        // In a real app, hash and check passwords
        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { clinic: true }
        });

        if (user && user.password === credentials.password) {
          return { id: user.id, name: user.name, email: user.email, role: user.role, clinicId: user.clinicId };
        }
        return null; // Invalid credentials
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: { token: any, user: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.clinicId = user.clinicId;
      }
      return token;
    },
    async session({ session, token }: { session: any, token: any }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.clinicId = token.clinicId;
      }
      return session;
    }
  },
  pages: {
    signIn: "/clinician/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "basira-sovereign-2026",
});

export { handler as GET, handler as POST };
