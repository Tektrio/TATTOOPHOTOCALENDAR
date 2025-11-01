import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // TODO: Conectar ao QNAP e listar arquivos
    const qnapData = {
      connected: false,
      host: process.env.QNAP_HOST || 'não configurado',
      status: 'disconnected',
      message: 'QNAP não configurado ou inacessível',
      stats: {
        totalSpace: 0,
        usedSpace: 0,
        freeSpace: 0,
        fileCount: 0
      }
    };

    return NextResponse.json(qnapData);
  } catch (error) {
    console.error('Erro ao conectar ao QNAP:', error);
    return NextResponse.json(
      { error: 'Erro ao conectar ao QNAP' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const path = formData.get('path') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    // TODO: Upload para QNAP via SSH/SFTP/WebDAV
    
    return NextResponse.json({
      success: false,
      error: 'QNAP não configurado'
    });
  } catch (error) {
    console.error('Erro ao fazer upload para QNAP:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer upload' },
      { status: 500 }
    );
  }
}

