import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: "database",
  },
  callbacks: {
    async session({ session, user }) {
      if (session?.user) {
        session.user.id = user.id
      }
      return session
    },
    // 🔥 AJOUT : Gérer la redirection après connexion
    async redirect({ url, baseUrl }) {
      console.log('🔀 REDIRECT:', { url, baseUrl })
      
      // Si l'URL est relative, la préfixer avec baseUrl
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`
      }
      // Si l'URL est sur le même domaine, l'utiliser
      else if (new URL(url).origin === baseUrl) {
        return url
      }
      // Sinon, rediriger vers /recipes par défaut
      return `${baseUrl}/recipes`
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: false,
}