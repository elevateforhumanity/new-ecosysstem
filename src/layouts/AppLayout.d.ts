declare module '../layouts/AppLayout' {
  import { FC, ReactNode } from 'react';
  
  interface AppLayoutProps {
    children: ReactNode;
  }
  
  const AppLayout: FC<AppLayoutProps>;
  export default AppLayout;
}
