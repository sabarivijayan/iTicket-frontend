import { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { User } from '../types/types';  // Import the User interface

// Define the shape of our context
interface StoreContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

// Create the context with a default value
export const StoreContext = createContext<StoreContextType>({
  token: null,
  setToken: () => {},
  user: null,
  setUser: () => {},
  logout: () => {},
});

interface StoreProviderProps {
  children: ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUserState] = useState<User | null>(null);  // Use User type here
  const router = useRouter();

  // This function will handle setting the token both in state and localStorage
  const setToken = (token: string | null) => {
    try {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
      setTokenState(token);
    } catch (error) {
      console.error('Error storing token:', error);
      toast.error('Error storing authentication token.');
    }
  };

  // This function will handle setting the user both in state and localStorage
  const setUser = (user: User | null) => {  // Use User type here
    try {
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.removeItem('user');
      }
      setUserState(user);
    } catch (error) {
      console.error('Error storing user:', error);
      toast.error('Error storing user details.');
    }
  };

  // This function handles user logout
  const logout = () => {
    try {
      setToken(null);
      setUser(null);
      localStorage.removeItem('googleProfilePic'); // Remove Google profile picture if any
      toast.success('Successfully logged out.');
      router.push('/'); // Redirect to home after logout
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('An error occurred during logout.');
    }
  };

  // On component mount, we check if there's a token and user in localStorage and set them in state
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (storedToken) {
        setTokenState(storedToken);
      }
      if (storedUser) {
        setUserState(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error retrieving data from localStorage:', error);
      toast.error('Error retrieving authentication data.');
    }
  }, []);

  return (
    <StoreContext.Provider value={{ token, setToken, user, setUser, logout }}>
      {children}
    </StoreContext.Provider>
  );
};
