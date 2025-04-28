
import React from 'react';
import { Header } from '@/components/Header';
import { ChatContainer } from '@/components/ChatContainer';

const Index = () => {
  return (
    <div className="flex flex-col h-screen bg-iso-dark overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 futuristic-grid-bg opacity-10 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-radial from-iso-purple/5 to-transparent opacity-30 pointer-events-none"></div>
      
      {/* Header */}
      <Header />
      
      {/* Main content */}
      <main className="flex-1 overflow-hidden p-4 relative">
        <div className="max-w-7xl mx-auto h-full rounded-lg border border-iso-purple/20 bg-iso-dark/80 backdrop-blur-sm shadow-lg overflow-hidden">
          <ChatContainer />
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-3 px-6 text-center text-xs text-muted-foreground border-t border-iso-purple/20">
        <p>
          ISO Guardian AI Assistant &copy; {new Date().getFullYear()} | ISO/IEC 27001 Compliance Tool
        </p>
      </footer>
    </div>
  );
};

export default Index;
