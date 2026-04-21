
import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import SupportBot from './SupportBot';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-page">{children}</main>
      <Footer />
      <SupportBot />
    </div>
  );
};

export default MainLayout;
