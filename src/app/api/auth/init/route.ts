import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_GATEWAY_URL!;
const API_KEY = process.env.API_KEY!;
const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID!;

export async function POST() {
  console.log('🚀 [API Route /init] ===== INIT AUTH START =====');
  console.log('📝 [API Route /init] Backend URL:', BACKEND_URL);
  console.log('🔑 [API Route /init] API Key:', API_KEY ? '✓ Present' : '✗ Missing');
  console.log('🆔 [API Route /init] Client ID:', CLIENT_ID);
  if (!BACKEND_URL || !API_KEY || !CLIENT_ID) {
    console.error('❌ [API Route /init] Missing auth configuration env vars');
    return NextResponse.json(
      {
        error: 'Missing auth configuration',
        missing: {
          NEXT_PUBLIC_GATEWAY_URL: !BACKEND_URL,
          API_KEY: !API_KEY,
          NEXT_PUBLIC_CLIENT_ID: !CLIENT_ID,
        },
      },
      { status: 500 }
    );
  }
  try {
    const response = await fetch(`${BACKEND_URL}/apikeygateway/generateFirstConnection/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY-GATEWAY': API_KEY,
        'X-API-KEY-GATEWAY-CLIENT': CLIENT_ID,
      },
      body: JSON.stringify({}),
    });
    console.log('📥 [API Route /init] Backend response:', response.status, response.statusText);
    if (!response.ok) {
      console.error('❌ [API Route /init] Backend response error:', response.status, response.statusText);
      return NextResponse.json({ error: 'Auth failed' }, { status: 401 });
    }

    const data = await response.json();
    console.log('📋 [API Route /init] Response data:', {
      hasAccessToken: !!data.accessToken,
      hasRefreshToken: !!data.refreshToken,
    });
    const { access_token, refresh_token } = data;

    const accessToken = access_token;
const refreshToken = refresh_token;

    /*console.log('RAW BACKEND JSON:', data);
    console.log('TOKENS EXTRACTED:', {
      accessToken,
      refreshToken,
    });*/

    const res = NextResponse.json({ success: true });

    res.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: false, //process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60,
      path: '/',
    });

    console.log('🍪 [API Route /init] Access token cookie set (1h)');

    res.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false, //process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 5,
      path: '/',
    });
        console.log('🍪 [API Route /init] Refresh token cookie set (5h)');


    return res;
  } catch (error) {
    console.error('Init auth error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
