import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Mock data
  const projects = [
    {
      id: 1,
      title: 'Manga Completa - Dragões',
      description: 'Projeto de manga completa com dragões orientais',
      status: 'em_andamento',
      start_date: '2025-10-01',
      estimated_sessions: 8,
      completed_sessions: 3
    }
  ];

  return NextResponse.json(projects);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const newProject = {
      id: Date.now(),
      ...body,
      createdAt: new Date().toISOString()
    };

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar projeto' }, { status: 500 });
  }
}

