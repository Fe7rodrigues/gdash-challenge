import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import axios from 'axios';

interface User {
  name: string;
  email: string;
}

interface AuthContextData {
  signed: boolean;
  user: User | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storagedUser = localStorage.getItem('@GDASH:user');
    const storagedToken = localStorage.getItem('@GDASH:token');

    if (storagedUser && storagedToken) {
      setUser(JSON.parse(storagedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${storagedToken}`;
    }
    setLoading(false);
  }, []);

  const login = (userData: User, token: string) => {
    setUser(userData);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('@GDASH:user', JSON.stringify(userData));
    localStorage.setItem('@GDASH:token', token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('@GDASH:user');
    localStorage.removeItem('@GDASH:token');
  };

  return (
    <AuthContext.Provider value={{ signed: !!user, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}