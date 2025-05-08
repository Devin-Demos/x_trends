import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-brand-800 text-white shadow-md">
        <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="h-8 w-8 text-white"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
              </svg>
              <h1 className="text-xl font-bold">X Discourse Trend Watch</h1>
            </div>
            <div>
              <span className="text-sm opacity-75">For journalists & researchers</span>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
      <footer className="bg-brand-900 text-white py-4 mt-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
          <p>X Discourse Trend Watch — For educational and research purposes only</p>
          <p className="text-xs opacity-75 mt-1">Not affiliated with X Corp. Tweet data is simulated for demonstration.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
