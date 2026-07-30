import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      'student-registration-6eev.onrender.com'
    ],
    proxy: {
      '/api': 'http://localhost:5000'
    }
  },
  preview: {
    host: '0.0.0.0',
    allowedHosts: [
      'student-registration-6eev.onrender.com'
    ]
  }
});
