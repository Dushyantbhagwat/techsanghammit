import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    assetsInclude: ['**/*.jpg', '**/*.png', '**/*.gif'],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
            '@mui/material': path.resolve(__dirname, 'node_modules/@mui/material'),
            '@mui/icons-material': path.resolve(__dirname, 'node_modules/@mui/icons-material'),
        },
    },
    // Ensure proper handling of environment variables
    envPrefix: 'VITE_',
    build: {
        sourcemap: true
    }
});
