import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    console.log('🔍 [API Route /token] Checking for access token in cookies...');
  const accessToken = request.cookies.get('accessToken')?.value;

  if (accessToken) {
    console.log('✅ [API Route /token] Access token found in cookies');
    return NextResponse.json({ accessToken });
  }
    console.warn('⚠️ [API Route /token] No access token found in cookies');

  return NextResponse.json({ accessToken: null }, { status: 401 });
}