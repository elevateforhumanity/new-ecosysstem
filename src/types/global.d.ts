// Global type declarations for the project

// Allow importing .jsx files in TypeScript
declare module '*.jsx' {
  import { ComponentType } from 'react';
  const component: ComponentType<any>;
  export default component;
}

// Allow importing .js files
declare module '*.js' {
  const content: any;
  export default content;
}

// Missing module declarations
declare module 'sitemap' {
  export class SitemapStream {
    constructor(options?: any);
    write(item: any): void;
    end(): void;
  }
  export function streamToPromise(stream: any): Promise<Buffer>;
}

declare module 'dotenv' {
  export function config(options?: any): void;
}

declare module 'web-vitals' {
  export function getCLS(callback: (metric: any) => void): void;
  export function getFID(callback: (metric: any) => void): void;
  export function getFCP(callback: (metric: any) => void): void;
  export function getLCP(callback: (metric: any) => void): void;
  export function getTTFB(callback: (metric: any) => void): void;
}

declare module '@sentry/browser' {
  export function init(options: any): void;
  export function captureException(error: any): void;
}

declare module 'recharts' {
  export const LineChart: any;
  export const Line: any;
  export const XAxis: any;
  export const YAxis: any;
  export const CartesianGrid: any;
  export const Tooltip: any;
  export const Legend: any;
  export const ResponsiveContainer: any;
  export const BarChart: any;
  export const Bar: any;
  export const PieChart: any;
  export const Pie: any;
  export const Cell: any;
}

declare module '../../../google-classroom-autopilot/src/email-resend' {
  export const emailResend: any;
}

// Extend Window interface
declare global {
  interface Window {
    __EFH_MONITOR__?: any;
  }
}

export {};
