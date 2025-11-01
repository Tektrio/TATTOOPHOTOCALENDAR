import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // TODO: Listar arquivos locais com fs
    const files = {
      root: '/tattoo-data',
      files: [
        {
          id: '1',
          name: 'tattoo.db',
          type: 'database',
          size: 5242880,
          modified: new Date().toISOString(),
          synced: true
        },
        {
          id: '2',
          name: 'backup_2025-11-01.db',
          type: 'database',
          size: 5120000,
          modified: new Date(Date.now() - 86400000).toISOString(),
          synced: false
        }
      ],
      stats: {
        totalSize: 10362880,
        fileCount: 2,
        lastBackup: new Date().toISOString()
      }
    };

    return NextResponse.json(files);
  } catch (error) {
    console.error('Erro ao listar arquivos locais:', error);
    return NextResponse.json(
      { error: 'Erro ao listar arquivos locais' },
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

    // TODO: Salvar arquivo localmente com fs
    // const buffer = Buffer.from(await file.arrayBuffer());
    // fs.writeFileSync(path, buffer);

    return NextResponse.json({
      success: true,
      filename: file.name,
      size: file.size,
      path: path || '/tattoo-data/' + file.name
    });
  } catch (error) {
    console.error('Erro ao salvar arquivo:', error);
    return NextResponse.json(
      { error: 'Erro ao salvar arquivo' },
      { status: 500 }
    );
  }
}

