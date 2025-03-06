import axios from 'axios';

const API_URL = 'https://api.mail.tm';

export interface Account {
  id: string;
  address: string;
  password: string;
  token: string;
}

export interface Message {
  id: string;
  from: {
    address: string;
    name: string;
  };
  to: {
    address: string;
    name: string;
  }[];
  subject: string;
  intro: string;
  seen: boolean;
  isDeleted: boolean;
  hasAttachments: boolean;
  downloadUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MessageDetails extends Message {
  html: string;
  text: string;
}

// Get available domains
export const getDomains = async () => {
  try {
    const response = await axios.get(`${API_URL}/domains`);
    return response.data['hydra:member'];
  } catch (error) {
    console.error('Error fetching domains:', error);
    throw error;
  }
};

// Create a new account
export const createAccount = async (address: string, password: string): Promise<Account> => {
  try {
    const response = await axios.post(`${API_URL}/accounts`, {
      address,
      password,
    });
    
    // Get token after creating account
    const tokenResponse = await axios.post(`${API_URL}/token`, {
      address,
      password,
    });
    
    return {
      id: response.data.id,
      address: response.data.address,
      password,
      token: tokenResponse.data.token,
    };
  } catch (error) {
    console.error('Error creating account:', error);
    throw error;
  }
};

// Login to existing account
export const login = async (address: string, password: string): Promise<string> => {
  try {
    const response = await axios.post(`${API_URL}/token`, {
      address,
      password,
    });
    return response.data.token;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

// Get messages
export const getMessages = async (token: string): Promise<Message[]> => {
  try {
    const response = await axios.get(`${API_URL}/messages`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data['hydra:member'];
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

// Get message details
export const getMessageDetails = async (token: string, messageId: string): Promise<MessageDetails> => {
  try {
    const response = await axios.get(`${API_URL}/messages/${messageId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching message details:', error);
    throw error;
  }
};

// Delete message
export const deleteMessage = async (token: string, messageId: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/messages/${messageId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

// Delete account
export const deleteAccount = async (token: string, accountId: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/accounts/${accountId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
};