import { defineConfig } from 'vitest/config';

export default defineConfig({
  assetsInclude: ['**/*.xml'],
  resolve: { alias: { stream: "stream-browserify" } },
  test: {
    name: 'modeler',
    include: ['test/spec/**/*.js'],
    root: '.',
    environment: 'happy-dom',
  },
});
