import path from 'path';
import { defineConfig } from 'vite';
import Vue from '@vitejs/plugin-vue';
import { presetAttributify, presetWind } from 'unocss';
import Unocss from 'unocss/vite';
import transformerDirective from '@unocss/transformer-directives';

export default defineConfig({
    server: {},
    base: './',
    resolve: {
        alias: {
            '@/': `${path.resolve(__dirname, 'src')}/`,
        },
    },
    plugins: [
        Vue(),
        Unocss({
            shortcuts: {
                'flex-center': 'flex items-center justify-center',
            },
            theme: {
                colors: {
                    primary: '#1F76E5',
                },
            },
            presets: [
                presetAttributify(),
                presetWind(),
            ],
            transformers: [
                transformerDirective(),
            ],
        }),
    ],
});
