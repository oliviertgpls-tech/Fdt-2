import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

console.log('🚨🚨🚨 API AUTH APPELÉE 🚨🚨🚨')

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }