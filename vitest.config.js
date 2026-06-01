import { defineConfig } from 'vitest/config';

// ----------------------------------------------------------------------
// پیکربندی حداقلی Vitest برای تست‌های واحد منطق خالص (مثل helperهای envelope).
// alias `src` برای حل importهای داخلی پروژه تعریف شده است.
// ----------------------------------------------------------------------

export default defineConfig({
  resolve: {
    alias: {
      src: new URL('./src', import.meta.url).pathname,
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{js,jsx}'],
  },
});
