const nodemailer = require('nodemailer');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const cron = require('node-cron');
const fs = require('fs-extra');
const path = require('path'); // Adicionado - usado em linha 630
require('dotenv').config();

class NotificationManager {
  constructor() {
    this.db = new sqlite3.Database('./agenda_hibrida.db');
    this.emailTransporter = null;
    this.whatsappConfig = {
      apiUrl: process.env.WHATSAPP_API_URL,
      token: process.env.WHATSAPP_API_TOKEN
    };
    
    this.initializeEmailTransporter();
    this.scheduleNotifications();
  }

  initializeEmailTransporter() {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.emailTransporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      console.log('✅ Transporter de email configurado');
    } else {
      console.log('⚠️ Configurações de email não encontradas');
    }
  }

  // Agendar notificações automáticas
  scheduleNotifications() {
    // Lembretes 24h antes dos agendamentos
    cron.schedule('0 9 * * *', async () => {
      await this.sendAppointmentReminders24h();
    });

    // Lembretes 2h antes dos agendamentos
    cron.schedule('*/30 * * * *', async () => {
      await this.sendAppointmentReminders2h();
    });

    // Lembretes de cuidados pós-tatuagem
    cron.schedule('0 10 * * *', async () => {
      await this.sendAfterCareReminders();
    });

    // Notificações de backup
    cron.schedule('0 8 * * 1', async () => {
      await this.sendWeeklyBackupReport();
    });

    console.log('⏰ Notificações automáticas agendadas');
  }

  // Lembretes 24h antes
  async sendAppointmentReminders24h() {
    console.log('📅 Enviando lembretes de 24h...');
    
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const appointments = await this.getAppointmentsByDate(tomorrowStr);
      
      for (const appointment of appointments) {
        const client = await this.getClientById(appointment.client_id);
        if (client) {
          await this.sendAppointmentReminder(client, appointment, '24h');
        }
      }

      console.log(`✅ ${appointments.length} lembretes de 24h enviados`);
    } catch (error) {
      console.error('❌ Erro ao enviar lembretes de 24h:', error);
    }
  }

  // Lembretes 2h antes
  async sendAppointmentReminders2h() {
    console.log('⏰ Verificando lembretes de 2h...');
    
    try {
      const now = new Date();
      const in2Hours = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      
      const appointments = await this.getAppointmentsInTimeRange(now, in2Hours);
      
      for (const appointment of appointments) {
        const client = await this.getClientById(appointment.client_id);
        if (client) {
          await this.sendAppointmentReminder(client, appointment, '2h');
        }
      }

      if (appointments.length > 0) {
        console.log(`✅ ${appointments.length} lembretes de 2h enviados`);
      }
    } catch (error) {
      console.error('❌ Erro ao enviar lembretes de 2h:', error);
    }
  }

  // Lembretes de cuidados pós-tatuagem
  async sendAfterCareReminders() {
    console.log('🩹 Enviando lembretes de cuidados pós-tatuagem...');
    
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const completedAppointments = await this.getCompletedAppointmentsByDate(yesterdayStr);
      
      for (const appointment of completedAppointments) {
        const client = await this.getClientById(appointment.client_id);
        if (client) {
          await this.sendAfterCareMessage(client, appointment);
        }
      }

      console.log(`✅ ${completedAppointments.length} lembretes de cuidados enviados`);
    } catch (error) {
      console.error('❌ Erro ao enviar lembretes de cuidados:', error);
    }
  }

  // Relatório semanal de backup
  async sendWeeklyBackupReport() {
    console.log('📊 Enviando relatório semanal...');
    
    try {
      const stats = await this.getWeeklyStats();
      const backupStatus = await this.getBackupStatus();
      
      const report = this.generateWeeklyReport(stats, backupStatus);
      
      if (this.emailTransporter) {
        await this.emailTransporter.sendMail({
          from: process.env.SMTP_USER,
          to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
          subject: '📊 Relatório Semanal - Agenda Híbrida',
          html: report
        });
        console.log('✅ Relatório semanal enviado por email');
      }

    } catch (error) {
      console.error('❌ Erro ao enviar relatório semanal:', error);
    }
  }

  // Enviar lembrete de agendamento
  async sendAppointmentReminder(client, appointment, timing) {
    const messages = this.getAppointmentReminderMessages(timing);
    const message = messages.replace('{clientName}', client.name)
                           .replace('{appointmentTime}', this.formatAppointmentTime(appointment.start_datetime))
                           .replace('{appointmentTitle}', appointment.title);

    // Tentar WhatsApp primeiro, depois email
    let sent = false;

    if (client.phone && this.whatsappConfig.apiUrl) {
      sent = await this.sendWhatsAppMessage(client.phone, message);
    }

    if (!sent && client.email && this.emailTransporter) {
      sent = await this.sendEmailReminder(client.email, client.name, appointment, timing);
    }

    // Registrar notificação enviada
    if (sent) {
      await this.logNotification(client.id, appointment.id, 'reminder', timing);
    }

    return sent;
  }

  // Enviar mensagem de cuidados pós-tatuagem
  async sendAfterCareMessage(client, appointment) {
    const message = this.getAfterCareMessage(client.name, appointment.title);

    let sent = false;

    if (client.phone && this.whatsappConfig.apiUrl) {
      sent = await this.sendWhatsAppMessage(client.phone, message);
    }

    if (!sent && client.email && this.emailTransporter) {
      sent = await this.sendAfterCareEmail(client.email, client.name, appointment);
    }

    if (sent) {
      await this.logNotification(client.id, appointment.id, 'aftercare', 'day1');
    }

    return sent;
  }

  // Enviar mensagem via WhatsApp
  async sendWhatsAppMessage(phone, message) {
    if (!this.whatsappConfig.apiUrl || !this.whatsappConfig.token) {
      return false;
    }

    try {
      const cleanPhone = phone.replace(/\D/g, '');
      
      const response = await axios.post(this.whatsappConfig.apiUrl, {
        phone: cleanPhone,
        message: message
      }, {
        headers: {
          'Authorization': `Bearer ${this.whatsappConfig.token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.status === 200;
    } catch (error) {
      console.error('❌ Erro ao enviar WhatsApp:', error);
      return false;
    }
  }

  // Enviar lembrete por email
  async sendEmailReminder(email, clientName, appointment, timing) {
    if (!this.emailTransporter) return false;

    try {
      const subject = timing === '24h' 
        ? '📅 Lembrete: Seu agendamento é amanhã!'
        : '⏰ Lembrete: Seu agendamento é em 2 horas!';

      const html = this.generateReminderEmailHTML(clientName, appointment, timing);

      await this.emailTransporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: subject,
        html: html
      });

      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar email:', error);
      return false;
    }
  }

  // Enviar email de cuidados pós-tatuagem
  async sendAfterCareEmail(email, clientName, appointment) {
    if (!this.emailTransporter) return false;

    try {
      const html = this.generateAfterCareEmailHTML(clientName, appointment);

      await this.emailTransporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: '🩹 Cuidados com sua nova tatuagem',
        html: html
      });

      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar email de cuidados:', error);
      return false;
    }
  }

  // Templates de mensagens
  getAppointmentReminderMessages(timing) {
    const messages = {
      '24h': `Olá {clientName}! 😊

Lembrando que você tem um agendamento amanhã:
📅 {appointmentTitle}
🕐 {appointmentTime}

Algumas dicas importantes:
• Tenha uma boa noite de sono
• Evite bebidas alcoólicas
• Coma bem antes de vir
• Traga um documento com foto

Nos vemos em breve! 🎨`,

      '2h': `Oi {clientName}! ⏰

Seu agendamento é em 2 horas:
📅 {appointmentTitle}
🕐 {appointmentTime}

Já está a caminho? 
Lembre-se de trazer documento com foto.

Te esperamos! 😊`
    };

    return messages[timing] || messages['24h'];
  }

  getAfterCareMessage(clientName, appointmentTitle) {
    return `Oi ${clientName}! 🎨

Sua tatuagem "${appointmentTitle}" ficou incrível! 

Agora é importante seguir os cuidados:

🧼 PRIMEIROS DIAS:
• Lave com sabonete neutro 2-3x ao dia
• Seque com papel toalha (sem esfregar)
• Passe pomada cicatrizante fina

❌ EVITE:
• Sol direto por 30 dias
• Piscina/mar por 15 dias
• Coçar ou arrancar casquinhas
• Roupas apertadas no local

⚠️ ATENÇÃO:
Se notar vermelhidão excessiva, inchaço ou pus, entre em contato imediatamente!

Qualquer dúvida, estou aqui! 😊`;
  }

  // Gerar HTML para emails
  generateReminderEmailHTML(clientName, appointment, timing) {
    const timeText = timing === '24h' ? 'amanhã' : 'em 2 horas';
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .appointment-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8B5CF6; }
            .tips { background: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎨 Lembrete de Agendamento</h1>
                <p>Olá, ${clientName}!</p>
            </div>
            <div class="content">
                <p>Lembrando que você tem um agendamento <strong>${timeText}</strong>:</p>
                
                <div class="appointment-card">
                    <h3>📅 ${appointment.title}</h3>
                    <p><strong>🕐 Data e Hora:</strong> ${this.formatAppointmentTime(appointment.start_datetime)}</p>
                    ${appointment.description ? `<p><strong>📝 Detalhes:</strong> ${appointment.description}</p>` : ''}
                </div>

                ${timing === '24h' ? `
                <div class="tips">
                    <h4>💡 Dicas importantes:</h4>
                    <ul>
                        <li>Tenha uma boa noite de sono</li>
                        <li>Evite bebidas alcoólicas</li>
                        <li>Coma bem antes de vir</li>
                        <li>Traga um documento com foto</li>
                    </ul>
                </div>
                ` : `
                <div class="tips">
                    <h4>⏰ Seu agendamento é em 2 horas!</h4>
                    <p>Já está a caminho? Lembre-se de trazer documento com foto.</p>
                </div>
                `}

                <p>Nos vemos em breve! 😊</p>
            </div>
            <div class="footer">
                <p>Agenda Híbrida - Sistema Visual para Tatuadores</p>
            </div>
        </div>
    </body>
    </html>`;
  }

  generateAfterCareEmailHTML(clientName, appointment) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .care-section { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .do-section { border-left: 4px solid #10B981; }
            .dont-section { border-left: 4px solid #EF4444; }
            .warning-section { border-left: 4px solid #F59E0B; background: #FEF3C7; }
            .footer { text-align: center; margin-top: 30px; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🩹 Cuidados Pós-Tatuagem</h1>
                <p>Olá, ${clientName}!</p>
            </div>
            <div class="content">
                <p>Sua tatuagem "<strong>${appointment.title}</strong>" ficou incrível! 🎨</p>
                <p>Agora é importante seguir os cuidados para uma cicatrização perfeita:</p>

                <div class="care-section do-section">
                    <h3>🧼 PRIMEIROS DIAS - O QUE FAZER:</h3>
                    <ul>
                        <li>Lave com sabonete neutro 2-3 vezes ao dia</li>
                        <li>Seque com papel toalha (sem esfregar)</li>
                        <li>Passe pomada cicatrizante em camada fina</li>
                        <li>Use roupas limpas e folgadas</li>
                        <li>Mantenha a área sempre limpa e seca</li>
                    </ul>
                </div>

                <div class="care-section dont-section">
                    <h3>❌ O QUE EVITAR:</h3>
                    <ul>
                        <li>Sol direto por 30 dias</li>
                        <li>Piscina, mar ou banheira por 15 dias</li>
                        <li>Coçar ou arrancar casquinhas</li>
                        <li>Roupas apertadas no local</li>
                        <li>Exercícios intensos nos primeiros 3 dias</li>
                        <li>Bebidas alcoólicas nas primeiras 48h</li>
                    </ul>
                </div>

                <div class="care-section warning-section">
                    <h3>⚠️ SINAIS DE ALERTA:</h3>
                    <p>Entre em contato <strong>imediatamente</strong> se notar:</p>
                    <ul>
                        <li>Vermelhidão excessiva ou que se espalha</li>
                        <li>Inchaço que aumenta após 48h</li>
                        <li>Pus ou secreção com mau cheiro</li>
                        <li>Febre ou dor intensa</li>
                        <li>Listras vermelhas saindo da tatuagem</li>
                    </ul>
                </div>

                <p><strong>Lembre-se:</strong> A cicatrização completa leva de 2 a 4 semanas. Tenha paciência e siga as orientações!</p>
                
                <p>Qualquer dúvida, estou aqui para ajudar! 😊</p>
            </div>
            <div class="footer">
                <p>Agenda Híbrida - Sistema Visual para Tatuadores</p>
            </div>
        </div>
    </body>
    </html>`;
  }

  generateWeeklyReport(stats, backupStatus) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .stat-card { background: white; padding: 20px; border-radius: 8px; margin: 10px 0; display: inline-block; width: 45%; text-align: center; }
            .status-ok { border-left: 4px solid #10B981; }
            .status-warning { border-left: 4px solid #F59E0B; }
            .status-error { border-left: 4px solid #EF4444; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📊 Relatório Semanal</h1>
                <p>Agenda Híbrida - Sistema de Tatuagem</p>
            </div>
            <div class="content">
                <h2>📈 Estatísticas da Semana</h2>
                
                <div class="stat-card">
                    <h3>${stats.newAppointments}</h3>
                    <p>Novos Agendamentos</p>
                </div>
                
                <div class="stat-card">
                    <h3>${stats.completedAppointments}</h3>
                    <p>Agendamentos Concluídos</p>
                </div>
                
                <div class="stat-card">
                    <h3>${stats.newClients}</h3>
                    <p>Novos Clientes</p>
                </div>
                
                <div class="stat-card">
                    <h3>${stats.filesUploaded}</h3>
                    <p>Arquivos Enviados</p>
                </div>

                <h2>💾 Status do Backup</h2>
                <div class="care-section ${backupStatus.status === 'ok' ? 'status-ok' : 'status-warning'}">
                    <p><strong>Último backup:</strong> ${backupStatus.lastBackup}</p>
                    <p><strong>Tamanho:</strong> ${backupStatus.size}</p>
                    <p><strong>Status:</strong> ${backupStatus.message}</p>
                </div>

                <h2>☁️ Status da Sincronização</h2>
                <ul>
                    <li>Google Drive: ${stats.googleDriveStatus}</li>
                    <li>Google Calendar: ${stats.googleCalendarStatus}</li>
                    <li>QNAP: ${stats.qnapStatus}</li>
                </ul>
            </div>
        </div>
    </body>
    </html>`;
  }

  // Métodos auxiliares do banco de dados
  async getAppointmentsByDate(date) {
    return new Promise((resolve, reject) => {
      this.db.all(
        "SELECT * FROM appointments WHERE date(start_datetime) = ?",
        [date],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  async getAppointmentsInTimeRange(startTime, endTime) {
    return new Promise((resolve, reject) => {
      this.db.all(
        "SELECT * FROM appointments WHERE start_datetime BETWEEN ? AND ?",
        [startTime.toISOString(), endTime.toISOString()],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  async getCompletedAppointmentsByDate(date) {
    return new Promise((resolve, reject) => {
      this.db.all(
        "SELECT * FROM appointments WHERE date(start_datetime) = ? AND status = 'concluido'",
        [date],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  async getClientById(clientId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        "SELECT * FROM clients WHERE id = ?",
        [clientId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  async logNotification(clientId, appointmentId, type, timing) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO notifications (client_id, appointment_id, type, timing, sent_at) 
         VALUES (?, ?, ?, ?, ?)`,
        [clientId, appointmentId, type, timing, new Date().toISOString()],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  // Métodos de estatísticas
  async getWeeklyStats() {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Implementar consultas de estatísticas
    return {
      newAppointments: 5,
      completedAppointments: 3,
      newClients: 2,
      filesUploaded: 15,
      googleDriveStatus: 'Conectado',
      googleCalendarStatus: 'Conectado',
      qnapStatus: 'Offline'
    };
  }

  async getBackupStatus() {
    try {
      const backupDir = './backups';
      if (await fs.pathExists(backupDir)) {
        const files = await fs.readdir(backupDir);
        const backupFiles = files.filter(f => f.includes('backup_'));
        
        if (backupFiles.length > 0) {
          const latestBackup = backupFiles.sort().reverse()[0];
          const stats = await fs.stat(path.join(backupDir, latestBackup));
          
          return {
            status: 'ok',
            lastBackup: stats.mtime.toLocaleDateString('pt-BR'),
            size: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
            message: 'Backup funcionando normalmente'
          };
        }
      }
      
      return {
        status: 'warning',
        lastBackup: 'Nunca',
        size: '0 MB',
        message: 'Nenhum backup encontrado'
      };
    } catch (error) {
      return {
        status: 'error',
        lastBackup: 'Erro',
        size: 'N/A',
        message: 'Erro ao verificar backups'
      };
    }
  }

  formatAppointmentTime(datetime) {
    return new Date(datetime).toLocaleString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

module.exports = NotificationManager;
