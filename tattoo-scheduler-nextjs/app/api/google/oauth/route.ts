import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // TODO: Implementar fluxo OAuth completo
    // 1. Gerar URL de autorização Google
    // 2. Redirecionar usuário
    // 3. Receber callback
    // 4. Trocar code por tokens
    // 5. Salvar tokens no banco
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&` +
      `response_type=code&` +
      `scope=https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive.file&` +
      `access_type=offline&` +
      `prompt=consent`;

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Erro ao gerar URL OAuth:', error);
    return NextResponse.json(
      { error: 'Erro ao iniciar autenticação' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    // TODO: Trocar code por tokens
    // const tokens = await oauth2Client.getToken(code);
    // Salvar no banco

    return NextResponse.json({
      success: true,
      message: 'Autenticação concluída'
    });
  } catch (error) {
    console.error('Erro ao processar OAuth:', error);
    return NextResponse.json(
      { error: 'Erro ao processar autenticação' },
      { status: 500 }
    );
  }
}

