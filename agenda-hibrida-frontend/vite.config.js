import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  // ============================================
  // OTIMIZAÇÕES DE BUILD
  // ============================================
  build: {
    // Minificação com terser para melhor compressão
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs em produção
        drop_debugger: true, // Remove debuggers
        pure_funcs: ['console.log', 'console.info', 'console.debug'], // Remove chamadas específicas
      },
      mangle: {
        safari10: true, // Compatibilidade com Safari 10
      },
    },
    
    // Target browsers modernos para melhor otimização
    target: 'es2015',
    
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    
    // Source maps apenas em desenvolvimento
    sourcemap: process.env.NODE_ENV !== 'production',
    
    // Rollup options para code splitting
    rollupOptions: {
      output: {
        // Manual chunks para vendors grandes
        manualChunks: {
          // Vendor principal (React)
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          
          // UI Components (Radix UI)
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-popover',
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-label',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-switch',
          ],
          
          // Icons e utilitários
          'vendor-utils': [
            'lucide-react',
            'clsx',
            'tailwind-merge',
            'class-variance-authority',
          ],
          
          // Data e forms
          'vendor-data': [
            'date-fns',
            'react-hook-form',
            '@hookform/resolvers',
            'zod',
          ],
          
          // Real-time e networking
          'vendor-network': ['socket.io-client'],
          
          // Charts (se usado)
          'vendor-charts': ['recharts'],
        },
        
        // Nomes de chunks mais legíveis
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()
            : 'chunk';
          return `assets/js/[name]-[hash].js`;
        },
        
        // Assets separados
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          let extType = info[info.length - 1];
          
          if (/\.(png|jpe?g|gif|svg|webp|avif)$/i.test(assetInfo.name)) {
            extType = 'images';
          } else if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            extType = 'fonts';
          } else if (/\.css$/i.test(assetInfo.name)) {
            extType = 'css';
          }
          
          return `assets/${extType}/[name]-[hash][extname]`;
        },
      },
    },
    
    // CSS code splitting
    cssCodeSplit: true,
    
    // Reportar tamanho dos chunks comprimidos
    reportCompressedSize: true,
  },
  
  // ============================================
  // OTIMIZAÇÕES DE DEV SERVER
  // ============================================
  server: {
    port: 5173,
    strictPort: true,
    open: false,
    cors: true,
    // HMR otimizado
    hmr: {
      overlay: true,
    },
  },
  
  // ============================================
  // OTIMIZAÇÕES DE PREVIEW
  // ============================================
  preview: {
    port: 4173,
    strictPort: true,
    open: false,
  },
  
  // ============================================
  // OTIMIZAÇÕES DE DEPENDÊNCIAS
  // ============================================
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'socket.io-client',
      'date-fns',
      'lucide-react',
    ],
    exclude: ['@tailwindcss/vite'],
  },
})
