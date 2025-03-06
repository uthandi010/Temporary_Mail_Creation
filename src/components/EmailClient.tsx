import React, { useState } from 'react';
import { useMail } from '../context/MailContext';
import { WavyBackground } from './ui/aceternity/wavy-background';
import { HoverEffect, Card, CardTitle, CardDescription } from './ui/aceternity/card-hover-effect';
import { RefreshCw, Copy, Trash2, LogOut, Mail, Clock, AlertCircle, ChevronLeft } from 'lucide-react';
import { formatDistanceToNow } from '../utils/dateUtils';
import { BackgroundGradient } from './ui/aceternity/background-gradient';

const EmailClient: React.FC = () => {
  const { 
    account, 
    messages, 
    selectedMessage, 
    loading, 
    refreshMessages, 
    selectMessage, 
    removeMessage,
    copyToClipboard 
  } = useMail();

  const [showMobileMessageView, setShowMobileMessageView] = useState(false);

  const handleCopyEmail = () => {
    if (account) {
      copyToClipboard(account.address);
    }
  };

  const handleRefresh = () => {
    refreshMessages();
  };

  const handleLogout = () => {
    localStorage.removeItem('tempMailAccount');
    window.location.reload();
  };

  const handleSelectMessage = (messageId: string) => {
    selectMessage(messageId);
    setShowMobileMessageView(true);
  };

  const handleBackToInbox = () => {
    setShowMobileMessageView(false);
  };

  if (!account) return null;

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-4 sm:mb-6">
        <BackgroundGradient
          className="rounded-xl p-1 bg-zinc-900/80"
          animate={false}
          gradientBackgroundStart="rgb(20, 20, 40)"
          gradientBackgroundEnd="rgb(0, 0, 20)"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 sm:p-4 bg-zinc-900/90 rounded-xl">
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-1.5 sm:p-2 rounded-full">
                <Mail size={16} className="text-white sm:hidden" />
                <Mail size={20} className="text-white hidden sm:block" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base sm:text-lg font-medium text-white">Your Temporary Email</h2>
                <div className="flex items-center gap-1 sm:gap-2">
                  <p className="text-gray-300 font-mono text-xs sm:text-sm truncate">{account.address}</p>
                  <button 
                    onClick={handleCopyEmail}
                    className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
                    title="Copy to clipboard"
                  >
                    <Copy size={14} className="sm:hidden" />
                    <Copy size={16} className="hidden sm:block" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="bg-zinc-800 hover:bg-zinc-700 text-white p-1.5 sm:p-2 rounded-lg transition-colors"
                title="Refresh inbox"
              >
                <RefreshCw size={16} className={`sm:hidden ${loading ? 'animate-spin' : ''}`} />
                <RefreshCw size={18} className={`hidden sm:block ${loading ? 'animate-spin' : ''}`} />
              </button>
              
              <button
                onClick={handleLogout}
                className="bg-zinc-800 hover:bg-zinc-700 text-white p-1.5 sm:p-2 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut size={16} className="sm:hidden" />
                <LogOut size={18} className="hidden sm:block" />
              </button>
            </div>
          </div>
        </BackgroundGradient>
      </div>
      
      {/* Desktop Layout */}
      <div className="hidden md:grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-zinc-900/80 backdrop-blur-sm rounded-xl overflow-hidden border border-zinc-800/50 shadow-xl">
          <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
            <h3 className="text-white font-medium">Inbox</h3>
            <span className="bg-blue-600/20 text-blue-400 text-xs font-medium px-2 py-1 rounded-full">
              {messages.length} messages
            </span>
          </div>
          
          <div className="overflow-y-auto max-h-[calc(100vh-250px)]">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Mail size={40} className="text-gray-600 mb-2" />
                <p className="text-gray-400">No messages yet</p>
                <p className="text-gray-500 text-sm mt-1">
                  New messages will appear here
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => selectMessage(message.id)}
                  className={`p-4 border-b border-zinc-800 cursor-pointer transition-colors ${
                    selectedMessage?.id === message.id
                      ? 'bg-blue-600/10'
                      : 'hover:bg-zinc-800/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-white font-medium truncate max-w-[180px]">
                      {message.from.name || message.from.address}
                    </h4>
                    <span className="text-gray-400 text-xs flex items-center">
                      <Clock size={12} className="mr-1" />
                      {formatDistanceToNow(new Date(message.createdAt))}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm font-medium mb-1 truncate">
                    {message.subject || '(No subject)'}
                  </p>
                  <p className="text-gray-500 text-xs truncate">
                    {message.intro || 'No preview available'}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="md:col-span-2 bg-zinc-900/80 backdrop-blur-sm rounded-xl overflow-hidden border border-zinc-800/50 shadow-xl">
          {selectedMessage ? (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                <h3 className="text-white font-medium truncate max-w-[300px]">
                  {selectedMessage.subject || '(No subject)'}
                </h3>
                <button
                  onClick={() => removeMessage(selectedMessage.id)}
                  className="text-gray-400 hover:text-red-400 transition-colors"
                  title="Delete message"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              
              <div className="p-4 border-b border-zinc-800">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium">From:</span>
                      <span className="text-gray-300">
                        {selectedMessage.from.name} {' '}
                        &lt;{selectedMessage.from.address}&gt;
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">To:</span>
                      <span className="text-gray-300">
                        {selectedMessage.to[0].address}
                      </span>
                    </div>
                  </div>
                  <span className="text-gray-400 text-sm">
                    {new Date(selectedMessage.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 bg-white">
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedMessage.html || selectedMessage.text }}
                />
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
              <Mail size={60} className="text-gray-600 mb-4" />
              <h3 className="text-white text-xl font-medium mb-2">No message selected</h3>
              <p className="text-gray-400 max-w-md">
                Select a message from your inbox to view its contents here
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile Layout */}
      <div className="md:hidden">
        {!showMobileMessageView ? (
          <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl overflow-hidden border border-zinc-800/50 shadow-xl">
            <div className="p-3 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="text-white font-medium text-sm">Inbox</h3>
              <span className="bg-blue-600/20 text-blue-400 text-xs font-medium px-2 py-0.5 rounded-full">
                {messages.length} messages
              </span>
            </div>
            
            <div className="overflow-y-auto max-h-[calc(100vh-220px)]">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <Mail size={32} className="text-gray-600 mb-2" />
                  <p className="text-gray-400 text-sm">No messages yet</p>
                  <p className="text-gray-500 text-xs mt-1">
                    New messages will appear here
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => handleSelectMessage(message.id)}
                    className="p-3 border-b border-zinc-800 cursor-pointer transition-colors hover:bg-zinc-800/50 active:bg-zinc-800/70"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-white font-medium truncate max-w-[180px] text-sm">
                        {message.from.name || message.from.address}
                      </h4>
                      <span className="text-gray-400 text-xs flex items-center">
                        <Clock size={10} className="mr-1" />
                        {formatDistanceToNow(new Date(message.createdAt))}
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs font-medium mb-1 truncate">
                      {message.subject || '(No subject)'}
                    </p>
                    <p className="text-gray-500 text-xs truncate">
                      {message.intro || 'No preview available'}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : selectedMessage ? (
          <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl overflow-hidden border border-zinc-800/50 shadow-xl h-[calc(100vh-220px)] flex flex-col">
            <div className="p-3 border-b border-zinc-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleBackToInbox}
                  className="text-gray-400 hover:text-white"
                >
                  <ChevronLeft size={18} />
                </button>
                <h3 className="text-white font-medium truncate max-w-[200px] text-sm">
                  {selectedMessage.subject || '(No subject)'}
                </h3>
              </div>
              <button
                onClick={() => removeMessage(selectedMessage.id)}
                className="text-gray-400 hover:text-red-400 transition-colors"
                title="Delete message"
              >
                <Trash2 size={16} />
              </button>
            </div>
            
            <div className="p-3 border-b border-zinc-800">
              <div className="flex flex-col">
                <div className="flex items-start gap-2 mb-1">
                  <span className="text-white font-medium text-xs">From:</span>
                  <span className="text-gray-300 text-xs break-all">
                    {selectedMessage.from.name} {' '}
                    &lt;{selectedMessage.from.address}&gt;
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-white font-medium text-xs">To:</span>
                  <span className="text-gray-300 text-xs break-all">
                    {selectedMessage.to[0].address}
                  </span>
                </div>
                <div className="mt-1 text-right">
                  <span className="text-gray-400 text-xs">
                    {new Date(selectedMessage.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 bg-white">
              <div 
                className="prose max-w-none prose-sm"
                dangerouslySetInnerHTML={{ __html: selectedMessage.html || selectedMessage.text }}
              />
            </div>
          </div>
        ) : null}
      </div>
      
      <WavyBackground 
        className="mt-8 sm:mt-10 py-6 sm:py-10" 
        backgroundFill="#0f0f13"
        colors={["#0ea5e9", "#6366f1", "#8b5cf6", "#d946ef", "#0ea5e9"]}
        blur={5}
        speed="slow"
        waveOpacity={0.2}
      >
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-2 text-white">Features</h2>
          <p className="text-gray-400 text-sm sm:text-base px-4">Everything you need for temporary email communication</p>
        </div>
        
        <div className="px-3 sm:px-0">
          <HoverEffect
            items={[
              {
                title: "Instant Email Creation",
                description: "Create a disposable email address in seconds with no registration required.",
                icon: <div className="bg-blue-500/20 p-2 rounded-full"><Mail size={18} className="text-blue-500" /></div>,
              },
              {
                title: "Auto-Refresh Inbox",
                description: "Your inbox automatically refreshes every 10 seconds to show new messages.",
                icon: <div className="bg-green-500/20 p-2 rounded-full"><RefreshCw size={18} className="text-green-500" /></div>,
              },
              {
                title: "Copy to Clipboard",
                description: "Easily copy your temporary email address to use on other websites.",
                icon: <div className="bg-purple-500/20 p-2 rounded-full"><Copy size={18} className="text-purple-500" /></div>,
              },
              {
                title: "Message Management",
                description: "View and delete messages with a simple, intuitive interface.",
                icon: <div className="bg-yellow-500/20 p-2 rounded-full"><Trash2 size={18} className="text-yellow-500" /></div>,
              },
              {
                title: "Privacy Protection",
                description: "Keep your real email address private when signing up for services.",
                icon: <div className="bg-red-500/20 p-2 rounded-full"><AlertCircle size={18} className="text-red-500" /></div>,
              },
              {
                title: "No Registration",
                description: "No personal information required. Create and use immediately.",
                icon: <div className="bg-indigo-500/20 p-2 rounded-full"><LogOut size={18} className="text-indigo-500" /></div>,
              },
            ]}
          />
        </div>
      </WavyBackground>
    </div>
  );
};

export default EmailClient;