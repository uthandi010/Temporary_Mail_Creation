import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { Account, Message, MessageDetails, createAccount, deleteAccount, getMessages, getMessageDetails, deleteMessage, getDomains } from '../services/mailApi';

interface MailContextType {
  account: Account | null;
  messages: Message[];
  selectedMessage: MessageDetails | null;
  domains: string[];
  /** Foreground work: initial load, creating an account, opening or deleting. */
  loading: boolean;
  /** True only during a manual refresh; background polling is silent. */
  refreshing: boolean;
  error: string | null;
  createNewAccount: (username: string, domain: string, password: string) => Promise<void>;
  refreshMessages: () => Promise<void>;
  selectMessage: (messageId: string) => Promise<void>;
  removeMessage: (messageId: string) => Promise<void>;
  logout: () => void;
  deleteCurrentAccount: () => Promise<void>;
  copyToClipboard: (text: string) => void;
  generateRandomUsername: () => string;
}

// Only the token and address are kept (never the password), and only for this tab session.
const SESSION_KEY = 'tempMailSession';
const LEGACY_STORAGE_KEY = 'tempMailAccount';

const loadSession = (): Account | null => {
  try {
    // Older versions stored the plaintext password in localStorage; remove it.
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (!saved) return null;
    const { id, address, token } = JSON.parse(saved);
    return id && address && token ? { id, address, token } : null;
  } catch {
    return null;
  }
};

const saveSession = (account: Account | null) => {
  try {
    if (account) {
      const { id, address, token } = account;
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ id, address, token }));
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
  } catch {
    // Storage unavailable; the session simply won't survive a reload.
  }
};

const POLL_INTERVAL_MS = 10000;
const MAX_BACKOFF_MS = 120000;

const MailContext = createContext<MailContextType | undefined>(undefined);

export const MailProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<Account | null>(loadSession);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<MessageDetails | null>(null);
  const [domains, setDomains] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch domains on initial render
  useEffect(() => {
    fetchDomains();
  }, []);

  // Load messages when the session changes, then poll silently. The effect only
  // depends on the token and keeps its own backoff state, so it never reads stale values.
  const token = account?.token;
  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let delay = POLL_INTERVAL_MS;

    const poll = async (initial: boolean) => {
      if (initial) setLoading(true);
      try {
        const fetched = await getMessages(token);
        if (cancelled) return;
        setMessages(fetched);
        setError(null);
        delay = POLL_INTERVAL_MS;
      } catch (err) {
        if (cancelled) return;
        if (axios.isAxiosError(err) && err.response?.status === 429) {
          // Rate limited: back off exponentially instead of hammering the API.
          delay = Math.min(delay * 2, MAX_BACKOFF_MS);
        } else {
          setError('Failed to fetch messages');
        }
      } finally {
        if (initial && !cancelled) setLoading(false);
      }
      if (!cancelled) timer = setTimeout(() => poll(false), delay);
    };

    poll(true);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [token]);

  const fetchDomains = async () => {
    try {
      setLoading(true);
      const domainsData = await getDomains();
      setDomains(domainsData.map((domain: { domain: string }) => domain.domain));
      setLoading(false);
    } catch {
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
      saveSession(newAccount);
      
      setLoading(false);
    } catch (err) {
      const description = axios.isAxiosError(err) ? err.response?.data?.['hydra:description'] : undefined;
      setError(description || 'Failed to create account');
      setLoading(false);
    }
  };

  const refreshMessages = async () => {
    if (!account) return;

    try {
      setRefreshing(true);
      const fetchedMessages = await getMessages(account.token);
      setMessages(fetchedMessages);
      setError(null);
    } catch {
      setError('Failed to fetch messages');
    } finally {
      setRefreshing(false);
    }
  };

  const selectMessage = async (messageId: string) => {
    if (!account) return;
    
    try {
      setLoading(true);
      const details = await getMessageDetails(account.token, messageId);
      setSelectedMessage(details);
      setError(null);
      setLoading(false);
    } catch {
      setError('Failed to fetch message details');
      setLoading(false);
    }
  };

  const removeMessage = async (messageId: string) => {
    if (!account) return;
    
    try {
      setLoading(true);
      await deleteMessage(account.token, messageId);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
      setError(null);
      setLoading(false);
    } catch {
      setError('Failed to delete message');
      setLoading(false);
    }
  };

  const logout = () => {
    saveSession(null);
    setAccount(null);
    setMessages([]);
    setSelectedMessage(null);
    setError(null);
  };

  const deleteCurrentAccount = async () => {
    if (!account) return;

    try {
      setLoading(true);
      await deleteAccount(account.token, account.id);
      logout();
    } catch {
      setError('Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        // Could add a toast notification here
      })
      .catch(() => {
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
        refreshing,
        error,
        createNewAccount,
        refreshMessages,
        selectMessage,
        removeMessage,
        logout,
        deleteCurrentAccount,
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