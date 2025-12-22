import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { storage, hashPassword, verifyPassword, generateId } from '@/lib/storage';

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (username: string, password: string) => { success: boolean; error?: string };
  register: (data: RegisterData) => { success: boolean; error?: string };
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (requiredRole: UserRole) => boolean;
}

interface RegisterData {
  username: string;
  password: string;
  role: UserRole;
  companyName: string;
  gstState: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const storedUsers = storage.get<User[]>('users', []);
    const currentUserId = storage.get<string>('currentUser', '');
    
    setUsers(storedUsers);
    
    if (currentUserId) {
      const currentUser = storedUsers.find(u => u.id === currentUserId);
      if (currentUser) {
        setUser(currentUser);
      }
    }
  }, []);

  const login = (username: string, password: string) => {
    const foundUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    
    if (!foundUser) {
      return { success: false, error: 'User not found' };
    }

    if (!verifyPassword(password, foundUser.passwordHash)) {
      return { success: false, error: 'Invalid password' };
    }

    const updatedUser = { ...foundUser, lastLogin: new Date().toISOString() };
    const updatedUsers = users.map(u => u.id === foundUser.id ? updatedUser : u);
    
    setUser(updatedUser);
    setUsers(updatedUsers);
    storage.set('users', updatedUsers);
    storage.set('currentUser', updatedUser.id);

    return { success: true };
  };

  const register = (data: RegisterData) => {
    const existingUser = users.find(u => u.username.toLowerCase() === data.username.toLowerCase());
    
    if (existingUser) {
      return { success: false, error: 'Username already exists' };
    }

    if (data.password.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters' };
    }

    const newUser: User = {
      id: generateId(),
      username: data.username,
      passwordHash: hashPassword(data.password),
      role: data.role,
      companyName: data.companyName,
      gstState: data.gstState,
      createdAt: new Date().toISOString(),
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    storage.set('users', updatedUsers);

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    storage.remove('currentUser');
  };

  const hasPermission = (requiredRole: UserRole): boolean => {
    if (!user) return false;
    
    const roleHierarchy: Record<UserRole, number> = {
      admin: 3,
      accountant: 2,
      viewer: 1,
    };

    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
