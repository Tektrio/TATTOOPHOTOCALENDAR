import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    // TODO: Implementar parsing de Excel com xlsx
    // const buffer = Buffer.from(await file.arrayBuffer());
    // const workbook = XLSX.read(buffer);
    // const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

    // Mock data preview
    const preview = {
      filename: file.name,
      size: file.size,
      type: file.type,
      rowCount: 150,
      columns: [
        'Nome',
        'Email',
        'Telefone',
        'CPF',
        'Data Nascimento',
        'Endereço',
        'CEP',
        'Cidade',
        'Estado'
      ],
      sampleData: [
        {
          Nome: 'João Silva',
          Email: 'joao@email.com',
          Telefone: '(11) 98765-4321',
          CPF: '123.456.789-00',
          'Data Nascimento': '1990-05-15',
          Endereço: 'Rua Example, 123',
          CEP: '01234-567',
          Cidade: 'São Paulo',
          Estado: 'SP'
        },
        {
          Nome: 'Maria Santos',
          Email: 'maria@email.com',
          Telefone: '(11) 91234-5678',
          CPF: '987.654.321-00',
          'Data Nascimento': '1985-08-20',
          Endereço: 'Av. Test, 456',
          CEP: '98765-432',
          Cidade: 'São Paulo',
          Estado: 'SP'
        },
        {
          Nome: 'Pedro Oliveira',
          Email: 'pedro@email.com',
          Telefone: '(21) 99999-8888',
          CPF: '111.222.333-44',
          'Data Nascimento': '1992-12-10',
          Endereço: 'Rua Sample, 789',
          CEP: '20000-000',
          Cidade: 'Rio de Janeiro',
          Estado: 'RJ'
        }
      ]
    };

    return NextResponse.json(preview);
  } catch (error) {
    console.error('Erro ao processar Excel:', error);
    return NextResponse.json(
      { error: 'Erro ao processar arquivo Excel' },
      { status: 500 }
    );
  }
}

