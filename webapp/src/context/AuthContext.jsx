import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      // Supabase live session listener
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      // Local fallback session
      const savedUser = localStorage.getItem('margdarshak_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setLoading(false);
    }
  }, []);

  const signUp = async (email, password, fullName, phone) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, phone }
        }
      });
      if (error) throw error;
      return data;
    } else {
      const fakeUser = {
        id: `usr_${Date.now()}`,
        email,
        user_metadata: { full_name: fullName, phone },
        created_at: new Date().toISOString()
      };
      localStorage.setItem('margdarshak_user', JSON.stringify(fakeUser));
      setUser(fakeUser);
      return { user: fakeUser };
    }
  };

  const signIn = async (email, password) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      return data;
    } else {
      const fakeUser = {
        id: `usr_${Date.now()}`,
        email,
        user_metadata: { full_name: email.split('@')[0], phone: '+91 98123 45678' },
        created_at: new Date().toISOString()
      };
      localStorage.setItem('margdarshak_user', JSON.stringify(fakeUser));
      setUser(fakeUser);
      return { user: fakeUser };
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem('margdarshak_user');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, isSupabaseConfigured }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
