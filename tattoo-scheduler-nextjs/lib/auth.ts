// Configuração NextAuth
import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from './db';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive.file',
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    })
  ],
  
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          const email = user.email || '';
          const expiresAt = account.expires_at 
            ? new Date(account.expires_at * 1000)
            : new Date(Date.now() + 3600 * 1000); // 1 hora padrão

          // Salvar/atualizar conta Google no banco
          await prisma.googleAccount.upsert({
            where: { email },
            create: {
              email,
              access_token: account.access_token || '',
              refresh_token: account.refresh_token || '',
              expires_at: expiresAt
            },
            update: {
              access_token: account.access_token || '',
              refresh_token: account.refresh_token || '',
              expires_at: expiresAt
            }
          });
          
          console.log('✓ Tokens OAuth salvos para:', email);
        } catch (error) {
          console.error('Erro ao salvar tokens OAuth:', error);
          return false;
        }
      }
      
      return true;
    },
    
    async jwt({ token, account, user }) {
      // Adicionar access_token ao token JWT
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }
      
      if (user) {
        token.id = user.id;
      }
      
      return token;
    },
    
    async session({ session, token }) {
      // Adicionar dados ao session para uso no cliente
      if (session.user) {
        (session.user as any).id = token.id;
        (session as any).accessToken = token.accessToken;
        (session as any).refreshToken = token.refreshToken;
      }
      
      return session;
    }
  },
  
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 dias
  },
  
  secret: process.env.NEXTAUTH_SECRET
};

/**
 * Helper para pegar access token do Google
 */
export async function getGoogleAccessToken(email: string): Promise<string | null> {
  try {
    const account = await prisma.googleAccount.findUnique({
      where: { email }
    });
    
    if (!account) {
      console.error('Conta Google não encontrada para:', email);
      return null;
    }
    
    // Verificar se token está expirado
    if (account.expires_at < new Date()) {
      console.error('Token expirado para:', email);
      // TODO: Implementar renovação automática de token
      return null;
    }
    
    return account.access_token;
  } catch (error) {
    console.error('Erro ao buscar access token:', error);
    return null;
  }
}

