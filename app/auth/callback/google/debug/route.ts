import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const url = request.nextUrl
  
  return NextResponse.json({
    fullUrl: url.toString(),
    searchParams: Object.fromEntries(url.searchParams),
    pathname: url.pathname,
    timestamp: new Date().toISOString()
  })
}
