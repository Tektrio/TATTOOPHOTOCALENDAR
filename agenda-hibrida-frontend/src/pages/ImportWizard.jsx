/**
 * Assistente de Importação de Dados
 * Importa dados do Vagaro (Excel), ICS e Google Calendar
 */

import React, { useState } from 'react';
import { Upload, FileSpreadsheet, Calendar, Cloud, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import ExcelFieldMapper from '../components/ExcelFieldMapper';

const API_BASE = 'http://localhost:3001/api';

export default function ImportWizard() {
  const [activeTab, setActiveTab] = useState('vagaro');
  
  // Estado Vagaro Excel
  const [vagaroFile, setVagaroFile] = useState(null);
  const [vagaroType, setVagaroType] = useState('clients');
  const [vagaroPreview, setVagaroPreview] = useState(null);
  const [vagaroLoading, setVagaroLoading] = useState(false);
  const [vagaroReport, setVagaroReport] = useState(null);
  
  // Estado ICS
  const [icsFile, setIcsFile] = useState(null);
  const [icsPreview, setIcsPreview] = useState(null);
  const [icsLoading, setIcsLoading] = useState(false);
  const [icsReport, setIcsReport] = useState(null);
  
  // Estado Google Calendar
  const [googleAuth, setGoogleAuth] = useState(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleReport, setGoogleReport] = useState(null);
  const [googleCalendars, setGoogleCalendars] = useState([]);
  const [selectedCalendar, setSelectedCalendar] = useState('primary');
  
  // Carregar status do Google Auth ao montar
  React.useEffect(() => {
    checkGoogleAuthStatus();
  }, []);

  const checkGoogleAuthStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/google/status`);
      const data = await response.json();
      setGoogleAuth(data);
      
      if (data.authenticated) {
        loadGoogleCalendars();
      }
    } catch (error) {
      console.error('Erro ao verificar auth:', error);
    }
  };

  const loadGoogleCalendars = async () => {
    try {
      const response = await fetch(`${API_BASE}/sync/google-calendar/calendars`);
      const data = await response.json();
      if (data.success) {
        setGoogleCalendars(data.calendars);
      }
    } catch (error) {
      console.error('Erro ao carregar calendários:', error);
    }
  };

  // ===== VAGARO EXCEL =====
  
  const handleVagaroFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setVagaroFile(file);
    setVagaroReport(null);
    
    // Gerar preview
    setVagaroLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_BASE}/imports/vagaro/excel/preview?type=${vagaroType}`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      if (data.success) {
        setVagaroPreview(data.preview);
      } else {
        alert(`Erro no preview: ${data.message}`);
      }
    } catch (error) {
      alert(`Erro ao fazer preview: ${error.message}`);
    } finally {
      setVagaroLoading(false);
    }
  };

  const handleVagaroImport = async (mapping) => {
    if (!vagaroFile) return;
    
    setVagaroLoading(true);
    setVagaroReport(null);
    
    try {
      const formData = new FormData();
      formData.append('file', vagaroFile);
      formData.append('mapping', JSON.stringify(mapping));
      formData.append('skipDuplicates', 'false');
      
      const response = await fetch(`${API_BASE}/imports/vagaro/excel?type=${vagaroType}`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      if (data.success) {
        setVagaroReport(data.report);
        setVagaroPreview(null);
        setVagaroFile(null);
      } else {
        alert(`Erro na importação: ${data.message}`);
      }
    } catch (error) {
      alert(`Erro ao importar: ${error.message}`);
    } finally {
      setVagaroLoading(false);
    }
  };

  // ===== ICS =====
  
  const handleIcsFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIcsFile(file);
    setIcsReport(null);
    
    // Gerar preview
    setIcsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_BASE}/imports/calendar/ics/preview`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      if (data.success) {
        setIcsPreview(data.preview);
      } else {
        alert(`Erro no preview: ${data.message}`);
      }
    } catch (error) {
      alert(`Erro ao fazer preview: ${error.message}`);
    } finally {
      setIcsLoading(false);
    }
  };

  const handleIcsImport = async () => {
    if (!icsFile) return;
    
    setIcsLoading(true);
    setIcsReport(null);
    
    try {
      const formData = new FormData();
      formData.append('file', icsFile);
      formData.append('skipDuplicates', 'false');
      formData.append('autoLinkClients', 'true');
      
      const response = await fetch(`${API_BASE}/imports/calendar/ics`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      if (data.success) {
        setIcsReport(data.report);
        setIcsPreview(null);
        setIcsFile(null);
      } else {
        alert(`Erro na importação: ${data.message}`);
      }
    } catch (error) {
      alert(`Erro ao importar: ${error.message}`);
    } finally {
      setIcsLoading(false);
    }
  };

  // ===== GOOGLE CALENDAR =====
  
  const handleGoogleConnect = () => {
    window.location.href = `${API_BASE}/auth/google`;
  };

  const handleGoogleSync = async () => {
    setGoogleLoading(true);
    setGoogleReport(null);
    
    try {
      const response = await fetch(`${API_BASE}/sync/google-calendar/now`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          calendarId: selectedCalendar,
          daysBack: 30,
          daysForward: 90,
          skipDuplicates: false
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setGoogleReport(data.report);
      } else {
        alert(`Erro na sincronização: ${data.message}`);
      }
    } catch (error) {
      alert(`Erro ao sincronizar: ${error.message}`);
    } finally {
      setGoogleLoading(false);
    }
  };

  const ReportCard = ({ report, title }) => {
    if (!report) return null;
    
    const hasErrors = report.errors && report.errors.length > 0;
    
    return (
      <Card className="p-6 mt-4" data-testid="import-stats">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          {hasErrors ? (
            <AlertCircle className="w-5 h-5 text-yellow-500" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          )}
          {title}
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{report.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{report.created}</div>
            <div className="text-sm text-gray-600">Criados</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{report.updated}</div>
            <div className="text-sm text-gray-600">Atualizados</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">{report.skipped}</div>
            <div className="text-sm text-gray-600">Ignorados</div>
          </div>
        </div>
        
        {hasErrors && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-semibold mb-2">
                {report.errors.length} erro(s) encontrado(s)
              </div>
              <div className="max-h-40 overflow-y-auto text-sm">
                {report.errors.slice(0, 10).map((error, idx) => (
                  <div key={idx} className="mb-1">
                    Linha {error.row || error.event}: {error.reason}
                  </div>
                ))}
                {report.errors.length > 10 && (
                  <div className="text-gray-500 mt-2">
                    + {report.errors.length - 10} erros adicionais
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl" data-testid="import-wizard">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Importar Dados</h1>
        <p className="text-gray-600">
          Importe clientes e agendamentos do Vagaro, arquivos ICS ou sincronize com Google Calendar
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="vagaro" className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            Excel Vagaro
          </TabsTrigger>
          <TabsTrigger value="ics" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            ICS/iCalendar
          </TabsTrigger>
          <TabsTrigger value="google" className="flex items-center gap-2">
            <Cloud className="w-4 h-4" />
            Google Calendar
          </TabsTrigger>
        </TabsList>

        {/* TAB: VAGARO EXCEL */}
        <TabsContent value="vagaro" className="mt-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Importar Excel do Vagaro</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Tipo de Dados</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="clients"
                    checked={vagaroType === 'clients'}
                    onChange={(e) => setVagaroType(e.target.value)}
                    disabled={vagaroLoading || vagaroPreview !== null}
                  />
                  <span>Clientes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="appointments"
                    checked={vagaroType === 'appointments'}
                    onChange={(e) => setVagaroType(e.target.value)}
                    disabled={vagaroLoading || vagaroPreview !== null}
                  />
                  <span>Agendamentos</span>
                </label>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="vagaro-file" className="block text-sm font-medium mb-2">
                Arquivo Excel (.xlsx)
              </label>
              <input
                id="vagaro-file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleVagaroFileChange}
                disabled={vagaroLoading}
                data-testid="input-upload-excel"
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  disabled:opacity-50"
              />
            </div>

            {vagaroLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <span className="ml-2">Processando...</span>
              </div>
            )}

            {vagaroPreview && (
              <ExcelFieldMapper
                preview={vagaroPreview}
                type={vagaroType}
                onImport={handleVagaroImport}
                onCancel={() => {
                  setVagaroPreview(null);
                  setVagaroFile(null);
                }}
              />
            )}

            {vagaroReport && <ReportCard report={vagaroReport} title="Relatório de Importação" />}
          </Card>
        </TabsContent>

        {/* TAB: ICS */}
        <TabsContent value="ics" className="mt-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Importar Arquivo ICS/iCalendar</h2>
            
            <Alert className="mb-6">
              <AlertDescription>
                Importe eventos de calendários exportados em formato ICS (Google Calendar, Outlook, Apple Calendar, etc.)
              </AlertDescription>
            </Alert>

            <div className="mb-6">
              <label htmlFor="ics-file" className="block text-sm font-medium mb-2">
                Arquivo ICS (.ics, .ical)
              </label>
              <input
                id="ics-file"
                type="file"
                accept=".ics,.ical"
                onChange={handleIcsFileChange}
                disabled={icsLoading}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  disabled:opacity-50"
              />
            </div>

            {icsLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <span className="ml-2">Processando...</span>
              </div>
            )}

            {icsPreview && (
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Preview: {icsPreview.totalEvents} eventos encontrados
                </h3>
                
                <div className="max-h-96 overflow-y-auto mb-4 border rounded-lg">
                  {icsPreview.preview.map((event, idx) => (
                    <div key={idx} className="p-4 border-b last:border-b-0 hover:bg-gray-50">
                      <div className="font-medium">{event.mapped?.title || event.original.summary}</div>
                      <div className="text-sm text-gray-600">
                        {event.mapped?.date} às {event.mapped?.time}
                      </div>
                      {event.mapped?.client_name && (
                        <div className="text-sm text-blue-600">Cliente: {event.mapped.client_name}</div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-4">
                  <Button onClick={handleIcsImport} disabled={icsLoading}>
                    <Upload className="w-4 h-4 mr-2" />
                    Importar {icsPreview.totalEvents} Eventos
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIcsPreview(null);
                      setIcsFile(null);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            {icsReport && <ReportCard report={icsReport} title="Relatório de Importação ICS" />}
          </Card>
        </TabsContent>

        {/* TAB: GOOGLE CALENDAR */}
        <TabsContent value="google" className="mt-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Sincronizar com Google Calendar</h2>
            
            {!googleAuth?.authenticated ? (
              <div className="text-center py-8">
                <Cloud className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Conectar Google Calendar</h3>
                <p className="text-gray-600 mb-6">
                  Conecte sua conta Google para sincronizar eventos automaticamente
                </p>
                <Button onClick={handleGoogleConnect} size="lg">
                  <Cloud className="w-4 h-4 mr-2" />
                  Conectar com Google
                </Button>
              </div>
            ) : (
              <div>
                <Alert className="mb-6">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    ✅ Conectado ao Google Calendar
                  </AlertDescription>
                </Alert>

                {googleCalendars.length > 0 && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">
                      Selecione o Calendário
                    </label>
                    <select
                      value={selectedCalendar}
                      onChange={(e) => setSelectedCalendar(e.target.value)}
                      className="w-full p-2 border rounded-lg"
                    >
                      {googleCalendars.map((cal) => (
                        <option key={cal.id} value={cal.id}>
                          {cal.summary} {cal.primary && '(Principal)'}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <Button
                  onClick={handleGoogleSync}
                  disabled={googleLoading}
                  size="lg"
                >
                  {googleLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Cloud className="w-4 h-4 mr-2" />
                  )}
                  Sincronizar Agora
                </Button>

                {googleReport && <ReportCard report={googleReport} title="Relatório de Sincronização" />}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
