import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

console.log('🔥🔥🔥 AUTH.TS CHARGÉ 🔥🔥🔥')
console.log('Variables env:', {
  hasGoogleId: !!process.env.GOOGLE_CLIENT_ID,
  hasGoogleSecret: !!process.env.GOOGLE_CLIENT_SECRET,
  hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
  hasPostgresPrismaUrl: !!process.env.POSTGRES_PRISMA_URL,
})

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
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('🎯 SIGNIN CALLBACK', { user, account, profile })
      return true
    },
    async session({ session, user }) {
      console.log('🔵 SESSION CALLBACK', { session, user })
      if (session?.user) {
        session.user.id = user.id
      }
      return session
    },
  },
  debug: true,
  logger: {
    error(code, metadata) {
      console.error('❌❌❌ NextAuth ERROR:', code, metadata)
    },
    warn(code) {
      console.warn('⚠️⚠️⚠️ NextAuth WARN:', code)
    },
    debug(code, metadata) {
      console.log('🐛🐛🐛 NextAuth DEBUG:', code, metadata)
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

console.log('✅ authOptions créé')