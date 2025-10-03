import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import EmailProvider from "next-auth/providers/email"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "database", // ✅ Fixé en database (tu veux rester en database)
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        // ✅ Pas de domain = le cookie s'attache automatiquement au bon domaine
      },
    },
  },
  callbacks: {
    async session({ session, user }) {
      // ✅ Sécurisé : en mode database, 'user' vient de la BDD
      if (!user) {
        console.error("❌ SESSION: user introuvable en BDD")
        throw new Error("Session invalide: user non trouvé")
      }
      
      if (session?.user) {
        session.user.id = user.id
        session.user.email = user.email ?? session.user.email
        session.user.name = user.name ?? session.user.name
        session.user.image = user.image ?? session.user.image
      }
      
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV !== "production",
}