import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    // ڕێکخستنی شاشەکان بۆ دیزاینی گۆڕاو
    screens: {
      // شاشەی بچووک (مۆبایل) - بە شێوەیەکی بنەڕەتی کار دەکەین (mobile-first)
      'sm': '640px', 
      // شاشەی مامناوەند
      'md': '768px',
      // شاشەی گەورە (لاپتۆپی بچووک یان تابلێت)
      'lg': '1024px',
      // شاشەی زۆر گەورە (لاپتۆپ) - ئەمە جیاوازی سەرەکی دەبێت
      'xl': '1280px', 
      '2xl': '1536px',
    },
    extend: {
      colors: {
        'ai-primary': '#1A73E8', // شینێکی دیار
        'ai-secondary': '#E8A71A', // زەرد بۆ ئاگادارکردنەوەی Agent
        'ai-bg-dark': '#1C1C1E', // تێمێکی تاریک بۆ دڵنیابوون لە فۆکەسی کۆد
        'ai-code': '#2D2D30',
      },
      animation: {
        // Animationی خێرا بۆ پێشاندانی خێرایی 20x
        'ping-fast': 'ping 0.7s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      zIndex: {
        '100': '100', // بۆ مۆناکۆ ئێدیتۆر و پێشانکار
      }
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
};
export default config;
