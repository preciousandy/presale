// src/types/global.d.ts


declare global {
    interface Window {
      Telegram?: {
        WebApp: any;
        // You can add more specific types here for better type safety if you know the Telegram WebApp object's structure.
        // For now, `any` is a quick fix to resolve the error.
      };
    }
  }
  
 
  export {};