
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isOwner: boolean;
  isOrderManager: boolean;
  isProductsAdder: boolean;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (fullName: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isOrderManager, setIsOrderManager] = useState(false);
  const [isProductsAdder, setIsProductsAdder] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkUserRole = useCallback(async (role: 'admin' | 'user' | 'owner' | 'order_manager' | 'products_adder') => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', role)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking user role:', error);
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error('Error checking user role:', error);
      return false;
    }
  }, [user]);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const checkRoles = async () => {
      if (user) {
        const [admin, owner, orderManager, productsAdder] = await Promise.all([
          checkUserRole('admin'),
          checkUserRole('owner'),
          checkUserRole('order_manager'),
          checkUserRole('products_adder')
        ]);
        
        setIsAdmin(admin);
        setIsOwner(owner);
        setIsOrderManager(orderManager);
        setIsProductsAdder(productsAdder);
      } else {
        setIsAdmin(false);
        setIsOwner(false);
        setIsOrderManager(false);
        setIsProductsAdder(false);
      }
    };

    checkRoles();
  }, [user, checkUserRole]);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName
        }
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  };

  const signOut = async () => {
    console.log('SignOut called in AuthContext');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase signOut error:', error);
        throw error;
      }
      
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setIsOwner(false);
      setIsOrderManager(false);
      setIsProductsAdder(false);
      
      console.log('SignOut completed successfully');
    } catch (error) {
      console.error('Error in signOut:', error);
      throw error;
    }
  };

  const updateProfile = async (fullName: string) => {
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: fullName
      }
    });
    return { error };
  };

  const value = {
    user,
    session,
    isAdmin,
    isOwner,
    isOrderManager,
    isProductsAdder,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
