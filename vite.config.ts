import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    laravel({
            input: [
                'resources/css/app.css',
                'resources/js/app.jsx',
                'resources/js/company.tsx',
                'resources/js/k1-form.tsx',
                'resources/js/k1-form-streamlined.tsx',
                'resources/js/ownership-interest.tsx',
                'resources/js/ownership-basis-detail.tsx',
                'resources/js/loss-limitation-detail.tsx',
                'resources/js/welcome.tsx',
                'resources/js/companies.tsx',
                'resources/js/navbar.tsx',
                // Auth pages
                'resources/js/auth/sign-in.tsx',
                'resources/js/auth/sign-up.tsx',
                'resources/js/auth/reset-password.tsx',
                'resources/js/auth/verify-email.tsx',
                'resources/js/auth/settings.tsx',
                // Admin pages
                'resources/js/admin/users.tsx',
                'resources/js/admin/edit-user.tsx',
            ],
      refresh: true,
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'resources/js'),
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    },
  },
  build: {
    rollupOptions: {
      external: (id) => /\.test\.[tj]sx?$/.test(id) || id.includes('/__tests__/'),
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          'ui-core': ['@radix-ui/react-slot', 'class-variance-authority', 'clsx', 'tailwind-merge'],
          'ui-components': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-popover',
            '@radix-ui/react-tabs',
            '@radix-ui/react-label',
            '@radix-ui/react-checkbox',
            '@/components/ui/alert-dialog',
            '@/components/ui/alert',
            '@/components/ui/badge',
            '@/components/ui/breadcrumb',
            '@/components/ui/button',
            '@/components/ui/calendar',
            '@/components/ui/card',
            '@/components/ui/checkbox',
            '@/components/ui/dialog',
            '@/components/ui/form',
            '@/components/ui/input',
            '@/components/ui/label',
            '@/components/ui/masonry',
            '@/components/ui/popover',
            '@/components/ui/skeleton',
            '@/components/ui/spinner',
            '@/components/ui/table',
            '@/components/ui/tabs',
            '@/components/ui/textarea',
            '@/components/ui/tooltip'
          ],
          utils: ['lucide-react', 'date-fns', 'currency.js', 'zod'],
          charts: ['recharts'],
          markdown: ['react-markdown']
        }
      }
    }
  }
});
