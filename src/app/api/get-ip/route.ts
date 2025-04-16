import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.ip
  return new NextResponse(ip || 'unknown')
}

export const dynamic = 'force-dynamic' 