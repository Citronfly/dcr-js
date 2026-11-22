import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'modeler',
    include: ['test/spec/**/*.js'],
    root: '.',
    assetsInclude: ['**/*.xml'],
    resolve: { alias: { stream: "stream-browserify" } },
    environment: 'happy-dom',
  },
});