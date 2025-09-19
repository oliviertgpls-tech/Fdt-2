import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user?.id) {
    return null
  }
  
  return session.user
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { error: "Non authentifié" }, 
    { status: 401 }
  )
}
