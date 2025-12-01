import { defineConfig } from 'vite';
import monacoEditorPlugin from 'vite-plugin-monaco-editor';

export default defineConfig({
    plugins: [
        monacoEditorPlugin({
        	languages: ['css', 'html', 'json', 'javascript'],
        })
    ],
    // ... other configuration
});
