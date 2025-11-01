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
          // Salvar/atualizar tokens OAuth no banco
          await prisma.oAuthToken.upsert({
            where: { userId: user.id || user.email || '' },
            create: {
              userId: user.id || user.email || '',
              provider: 'google',
              accessToken: account.access_token || '',
              refreshToken: account.refresh_token || null,
              expiresAt: account.expires_at || null
            },
            update: {
              accessToken: account.access_token || '',
              refreshToken: account.refresh_token || null,
              expiresAt: account.expires_at || null
            }
          });
          
          console.log('✓ Tokens OAuth salvos para:', user.email);
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
export async function getGoogleAccessToken(userId: string): Promise<string | null> {
  try {
    const token = await prisma.oAuthToken.findUnique({
      where: { userId }
    });
    
    if (!token) {
      console.error('Token não encontrado para usuário:', userId);
      return null;
    }
    
    // TODO: Verificar se token expirou e renovar se necessário
    
    return token.accessToken;
  } catch (error) {
    console.error('Erro ao buscar access token:', error);
    return null;
  }
}

