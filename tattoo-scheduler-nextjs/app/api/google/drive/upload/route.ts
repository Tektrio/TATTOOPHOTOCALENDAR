import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folderId = formData.get('folderId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    // TODO: Upload para Google Drive
    // 1. Autenticar com tokens salvos
    // 2. Upload do arquivo
    // 3. Retornar ID e URL do Drive

    return NextResponse.json({
      success: true,
      fileId: 'drive-file-id-123',
      webViewLink: 'https://drive.google.com/file/d/...',
      name: file.name,
      size: file.size
    });
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer upload' },
      { status: 500 }
    );
  }
}

