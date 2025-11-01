'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, CheckCircle, Clock, XCircle } from 'lucide-react';

interface Project {
  id: number;
  title: string;
  description?: string;
  status: 'planejamento' | 'em_andamento' | 'concluido' | 'cancelado';
  start_date?: string;
  estimated_sessions?: number;
  completed_sessions?: number;
}

interface ProjectsTabProps {
  customerId: number;
}

export default function ProjectsTab({ customerId }: ProjectsTabProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, [customerId]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/clients/${customerId}/projects`);
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planejamento': return 'bg-yellow-100 text-yellow-800';
      case 'em_andamento': return 'bg-blue-100 text-blue-800';
      case 'concluido': return 'bg-green-100 text-green-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planejamento': return <Clock className="w-4 h-4" />;
      case 'em_andamento': return <Calendar className="w-4 h-4" />;
      case 'concluido': return <CheckCircle className="w-4 h-4" />;
      case 'cancelado': return <XCircle className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  if (loading) {
    return <div className="text-center text-white py-8">Carregando projetos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Projetos de Tatuagem</h2>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Projeto
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-white">Nenhum projeto cadastrado</p>
            <p className="text-gray-400 text-sm mt-2">Projetos são conjuntos de tatuagens relacionadas</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <Card key={project.id} className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white">{project.title}</CardTitle>
                    {project.description && (
                      <p className="text-gray-400 text-sm mt-1">{project.description}</p>
                    )}
                  </div>
                  <Badge className={getStatusColor(project.status)}>
                    {getStatusIcon(project.status)}
                    <span className="ml-1">{project.status}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 text-sm text-gray-300">
                  {project.start_date && (
                    <div>
                      <span className="text-gray-400">Início:</span>{' '}
                      {new Date(project.start_date).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                  {project.estimated_sessions && (
                    <div>
                      <span className="text-gray-400">Sessões:</span>{' '}
                      {project.completed_sessions || 0}/{project.estimated_sessions}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

