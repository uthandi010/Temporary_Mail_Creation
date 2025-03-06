import React, { createContext, useContext, useState, useEffect } from 'react';
import { Account, Message, MessageDetails, createAccount, getMessages, getMessageDetails, deleteMessage, getDomains } from '../services/mailApi';

interface MailContextType {
  account: Account | null;
  messages: Message[];
  selectedMessage: MessageDetails | null;
  domains: string[];
  loading: boolean;
  error: string | null;
  createNewAccount: (username: string, domain: string, password: string) => Promise<void>;
  refreshMessages: () => Promise<void>;
  selectMessage: (messageId: string) => Promise<void>;
  removeMessage: (messageId: string) => Promise<void>;
  copyToClipboard: (text: string) => void;
  generateRandomUsername: () => string;
}

const MailContext = createContext<MailContextType | undefined>(undefined);

export const MailProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<Account | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<MessageDetails | null>(null);
  const [domains, setDomains] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load account from localStorage on initial render
  useEffect(() => {
    const savedAccount = localStorage.getItem('tempMailAccount');
    if (savedAccount) {
      setAccount(JSON.parse(savedAccount));
    }
    
    // Fetch available domains
    fetchDomains();
  }, []);

  // Fetch messages when account changes
  useEffect(() => {
    if (account) {
      refreshMessages();
      
      // Set up polling for new messages every 10 seconds
      const interval = setInterval(() => {
        refreshMessages();
      }, 10000);
      
      return () => clearInterval(interval);
    }
  }, [account]);

  const fetchDomains = async () => {
    try {
      setLoading(true);
      const domainsData = await getDomains();
      setDomains(domainsData.map((domain: any) => domain.domain));
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch domains');
      setLoading(false);
    }
  };

  const createNewAccount = async (username: string, domain: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const emailAddress = `${username}@${domain}`;
      const newAccount = await createAccount(emailAddress, password);
      
      setAccount(newAccount);
      localStorage.setItem('tempMailAccount', JSON.stringify(newAccount));
      
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.['hydra:description'] || 'Failed to create account');
      setLoading(false);
    }
  };

  const refreshMessages = async () => {
    if (!account) return;
    
    try {
      setLoading(true);
      const fetchedMessages = await getMessages(account.token);
      setMessages(fetchedMessages);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch messages');
      setLoading(false);
    }
  };

  const selectMessage = async (messageId: string) => {
    if (!account) return;
    
    try {
      setLoading(true);
      const details = await getMessageDetails(account.token, messageId);
      setSelectedMessage(details);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch message details');
      setLoading(false);
    }
  };

  const removeMessage = async (messageId: string) => {
    if (!account) return;
    
    try {
      setLoading(true);
      await deleteMessage(account.token, messageId);
      setMessages(messages.filter(msg => msg.id !== messageId));
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to delete message');
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        // Could add a toast notification here
      })
      .catch(err => {
        setError('Failed to copy to clipboard');
      });
  };

  const generateRandomUsername = () => {
    const adjectives = ['happy', 'clever', 'brave', 'calm', 'eager', 'fair', 'kind', 'proud', 'wise', 'bold'];
    const nouns = ['tiger', 'eagle', 'panda', 'wolf', 'lion', 'fox', 'bear', 'hawk', 'deer', 'owl'];
    const randomNum = Math.floor(Math.random() * 1000);
    
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    
    return `${randomAdjective}${randomNoun}${randomNum}`;
  };

  return (
    <MailContext.Provider
      value={{
        account,
        messages,
        selectedMessage,
        domains,
        loading,
        error,
        createNewAccount,
        refreshMessages,
        selectMessage,
        removeMessage,
        copyToClipboard,
        generateRandomUsername,
      }}
    >
      {children}
    </MailContext.Provider>
  );
};

export const useMail = () => {
  const context = useContext(MailContext);
  if (context === undefined) {
    throw new Error('useMail must be used within a MailProvider');
  }
  return context;
};