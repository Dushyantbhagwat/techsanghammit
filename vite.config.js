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
        },
    },
    // Ensure proper handling of environment variables
    envPrefix: 'VITE_',
    build: {
        sourcemap: true
    }
});
