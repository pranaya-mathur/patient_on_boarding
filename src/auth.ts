import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Staff Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // MVP check: hardcoded password
        if (credentials.password !== process.env.STAFF_PASSWORD) {
          return null;
        }

        const email = credentials.email as string;

        // Check if user exists
        let user = await prisma.staffUser.findUnique({
          where: { email },
        });

        // Auto-create if allowed
        if (!user) {
          const allowedEmails = process.env.STAFF_ALLOWED_EMAILS?.split(",").map((e) =>
            e.trim().toLowerCase()
          );
          if (allowedEmails?.includes(email.toLowerCase())) {
            user = await prisma.staffUser.create({
              data: {
                email: email.toLowerCase(),
                name: email.split("@")[0], // Default name from email
              },
            });
          }
        }

        if (!user) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isStaffRoute = nextUrl.pathname.startsWith("/staff") && nextUrl.pathname !== "/staff/login";
      
      if (isStaffRoute) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/staff/login",
  },
});
