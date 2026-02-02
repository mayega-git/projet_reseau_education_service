import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_GATEWAY_URL!;
const API_KEY = process.env.API_KEY!;

export async function POST(request: NextRequest) {
  console.log('🔄 [API Route /refresh] ===== TOKEN REFRESH START =====');

  if (!BACKEND_URL || !API_KEY) {
    console.error('❌ [API Route /refresh] Missing auth configuration env vars');
    return NextResponse.json(
      {
        error: 'Missing auth configuration',
        missing: {
          NEXT_PUBLIC_GATEWAY_URL: !BACKEND_URL,
          API_KEY: !API_KEY,
        },
      },
      { status: 500 }
    );
  }
  
  const refreshToken = request.cookies.get('refreshToken')?.value;

  if (!refreshToken) {
    console.error('❌ [API Route /refresh] No refresh token in cookies');
    return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
  }

  console.log('✅ [API Route /refresh] Refresh token found in cookies');

  try {
    const refreshUrl = `${BACKEND_URL}/education-service/apikeygateway/refresh`;
    console.log('📤 [API Route /refresh] Calling backend:', refreshUrl);

    const response = await fetch(refreshUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify({ refreshToken }),
    });

    console.log('📥 [API Route /refresh] Backend response:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [API Route /refresh] Backend error:', errorText);
      
      const res = NextResponse.json({ error: 'Refresh failed' }, { status: 401 });
      res.cookies.delete('accessToken');
      res.cookies.delete('refreshToken');
      console.log('🗑️ [API Route /refresh] Cookies deleted due to refresh failure');
      return res;
    }

    const data = await response.json();
    console.log('📋 [API Route /refresh] Response data:', {
      hasAccessToken: !!data.accessToken,
      hasRefreshToken: !!data.refreshToken,
    });

    const { accessToken, refreshToken: newRefreshToken } = data;

    const res = NextResponse.json({ accessToken });

    res.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60,
      path: '/',
    });
    console.log('🍪 [API Route /refresh] New access token cookie set');

    res.cookies.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 5,
      path: '/',
    });
    console.log('🍪 [API Route /refresh] New refresh token cookie set');

    console.log('✅ [API Route /refresh] ===== TOKEN REFRESH SUCCESS =====');
    return res;
  } catch (error) {
    console.error('❌ [API Route /refresh] Exception:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
