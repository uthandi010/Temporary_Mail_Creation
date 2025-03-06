import React, { useState } from 'react';
import { useMail } from '../context/MailContext';
import { TextGenerateEffect } from './ui/aceternity/text-generate-effect';
import { BackgroundGradient } from './ui/aceternity/background-gradient';
import { SparklesCore } from './ui/aceternity/sparkles';
import { RefreshCw, Copy, Shuffle } from 'lucide-react';

const CreateAccount: React.FC = () => {
  const { domains, createNewAccount, loading, error, copyToClipboard, generateRandomUsername } = useMail();
  
  const [username, setUsername] = useState<string>(generateRandomUsername());
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [password, setPassword] = useState<string>('password123');

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !selectedDomain) return;
    
    createNewAccount(username, selectedDomain, password);
  };

  const handleGenerateUsername = () => {
    setUsername(generateRandomUsername());
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-6 sm:mb-8 relative">
        <div className="absolute inset-0 z-0">
          <SparklesCore
            id="title-sparkles"
            background="transparent"
            minSize={0.6}
            maxSize={1.4}
            particleDensity={20}
            className="w-full h-full"
            particleColor="#FFFFFF"
          />
        </div>
        <div className="relative z-10">
          <TextGenerateEffect
            words="Create Your Temporary Email"
            className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-2 sm:mb-4"
          />
          <p className="text-gray-300 text-sm sm:text-base md:text-lg px-4">
            Get a disposable email address in seconds. No registration required.
          </p>
        </div>
      </div>
      
      <BackgroundGradient 
        className="rounded-[18px] sm:rounded-[22px] p-3 sm:p-6 md:p-10 bg-zinc-900/80 backdrop-blur-sm mx-2 sm:mx-4 md:mx-auto"
        gradientBackgroundStart="rgb(20, 20, 40)"
        gradientBackgroundEnd="rgb(0, 0, 20)"
        firstColor="18, 113, 255"
        secondColor="221, 74, 255"
        thirdColor="100, 220, 255"
        fourthColor="200, 50, 50"
        fifthColor="180, 180, 50"
        animate={false}
      >
        <form onSubmit={handleCreateAccount} className="relative z-10">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-white p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}
          
          <div className="mb-5 sm:mb-6">
            <label className="block text-gray-300 mb-2 text-xs sm:text-sm font-medium">Email Address</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-zinc-800/70 border border-zinc-700 text-white rounded-lg p-2.5 sm:p-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="username"
                  required
                />
                <button
                  type="button"
                  onClick={handleGenerateUsername}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  title="Generate random username"
                >
                  <Shuffle size={16} className="sm:hidden" />
                  <Shuffle size={18} className="hidden sm:block" />
                </button>
              </div>
              
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="bg-zinc-800/70 border border-zinc-700 text-white rounded-lg p-2.5 sm:p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                required
              >
                <option value="">Select domain</option>
                {domains.map((domain) => (
                  <option key={domain} value={domain}>
                    @{domain}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mb-5 sm:mb-6">
            <label className="block text-gray-300 mb-2 text-xs sm:text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-800/70 border border-zinc-700 text-white rounded-lg p-2.5 sm:p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              placeholder="Password"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              This is only used to access your temporary mailbox. We recommend using a simple password.
            </p>
          </div>
          
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2.5 sm:py-3 px-5 sm:px-6 rounded-lg flex items-center gap-2 transition-all duration-200 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-blue-500/20 text-sm sm:text-base w-full sm:w-auto justify-center"
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Email Address'
              )}
            </button>
          </div>
        </form>
      </BackgroundGradient>
      
      <div className="mt-6 sm:mt-8 text-center text-gray-400 text-xs sm:text-sm px-4">
        <p>Your temporary email will be automatically deleted after 24 hours of inactivity.</p>
      </div>
    </div>
  );
};

export default CreateAccount;