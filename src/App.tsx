import React from 'react';
import { MailProvider, useMail } from './context/MailContext';
import CreateAccount from './components/CreateAccount';
import EmailClient from './components/EmailClient';
import { Mail } from 'lucide-react';

const AppContent: React.FC = () => {
  const { account } = useMail();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="relative z-10">
        <header className="py-4 px-3 sm:py-6 sm:px-6 lg:px-8 border-b border-zinc-800/50">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-full">
                <Mail size={20} className="text-white sm:hidden" />
                <Mail size={24} className="text-white hidden sm:block" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                QuickThrowMail
              </h1>
            </div>
            
            <div className="text-xs sm:text-sm text-gray-400 hidden xs:block">
              Secure Email
            </div>
          </div>
        </header>
        
        <main className="py-4 sm:py-8 px-3 sm:px-6 lg:px-8">
          {account ? <EmailClient /> : <CreateAccount />}
        </main>
        
        <footer className="py-4 sm:py-6 px-3 sm:px-6 lg:px-8 border-t border-zinc-800/50 mt-8 sm:mt-12">
          <div className="max-w-7xl mx-auto text-center text-xs sm:text-sm text-gray-500">
            <p>TempMail © {new Date().getFullYear()} - Powered by mail.tm</p>
            <p className="mt-1">Emails deleted after 24h of inactivity</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

function App() {
  return (
    <MailProvider>
      <AppContent />
    </MailProvider>
  );
}

export default App;