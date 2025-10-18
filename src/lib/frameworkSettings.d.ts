declare module '../lib/frameworkSettings' {
  export interface FrameworkSettings {
    errors: string[];
    warnings: string[];
    sites: any[];
  }
  export function getSettings(): FrameworkSettings;
}
