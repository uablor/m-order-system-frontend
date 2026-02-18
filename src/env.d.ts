/// <reference types="vite/client" />

// ให้ TypeScript รู้จักการ import ไฟล์ .vue ในไฟล์ .ts/.tsx
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

