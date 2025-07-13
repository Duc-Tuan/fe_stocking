import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    svgr(), // KHÔNG truyền svgrOptions
  ],
  server: {
    allowedHosts: ['.ngrok-free.app'], // 👈 Cho phép domain ngrok
  },
});
