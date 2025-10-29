import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

/**
 * Error Boundary Component
 * Captura erros em componentes filhos e exibe uma UI de fallback
 * em vez de travar a aplicação inteira
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Atualiza o estado para renderizar fallback UI na próxima renderização
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log do erro para monitoramento
    console.error('Error Boundary capturou erro:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-6 h-6" />
                Algo deu errado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-400">
                A aplicação encontrou um erro inesperado. Tente recarregar a página.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 p-4 bg-gray-800 rounded-lg">
                  <summary className="cursor-pointer text-sm font-semibold text-gray-300">
                    Detalhes do erro (apenas visível em desenvolvimento)
                  </summary>
                  <pre className="mt-2 text-xs text-red-400 overflow-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
              
              <Button onClick={this.handleReset} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Recarregar Página
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

