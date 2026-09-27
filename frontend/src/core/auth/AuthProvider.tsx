import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { secureStorage, tokenStorage } from '@/src/utils/storage';
import { IAuthContextValue, IAuthSession, IAuthUser } from '@/src/types/auth';
import { StorageKeys } from '@/src/constants/config';
import { useLoginMutation, useRegisterMutation, useRequestResetPasswordMutation } from '@/src/store/api/authApi';
import { googleAuth } from '@/src/services/googleAuth';


const AuthContext = createContext<IAuthContextValue | null>(null);
const SESSION_KEY = StorageKeys.AUTH_SESSION;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<IAuthSession | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [login] = useLoginMutation();
  const [register] = useRegisterMutation();
  const [requestResetPassword] = useRequestResetPasswordMutation();


  useEffect(() => {
    secureStorage.get<IAuthSession>(SESSION_KEY).then((restored) => {
      if (restored) setSession(restored);
      setInitializing(false);
    });
  }, []);

  const persistSession = useCallback(async (s: IAuthSession | null) => {
    setSession(s);
    if (s) {
      secureStorage.set(SESSION_KEY, s);
      await tokenStorage.set({ accessToken: s.accessToken, });
    } else {
      secureStorage.remove(SESSION_KEY);
      await tokenStorage.clear();
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {

    if (!email || !password){
      throw new Error('E-posta veya şifre hatalı');
    }

    try{
      const result = await login({ email, password, }).unwrap();
      const user: IAuthUser = {
        id: result.user.id!,
        name: result.user.name,
        surname: result.user.surname,
        username: result.user.username,
        email: result.user.email!,
      };

      const newSession: IAuthSession = { user, accessToken: result.accessToken };

      await persistSession(newSession);
    }catch(error: any){
      const message = error?.data?.message || error?.message || "Giriş yapılamadı!";
      throw new Error(message);
    }
  },
  [login, persistSession],
);


  const signUp = useCallback(async (
    name: string,
    surname: string,
    username: string,
    email: string,
    password: string,
    birth_date?: string,
  ) => {
    if (!email || !password || !name || !surname || !username) {
      throw new Error('Lütfen gerekli alanları doldurun.');
    }

    try{
      const result = await register({ name, surname, username, email, password, birth_date }).unwrap();

      return result;

    }catch(error: any){
     
      const message = error?.data?.message || error?.message || "Kayıt oluşturulamadı!";
      throw new Error(message);
    }

    
  }, [register]);


  const signOut = useCallback(async () => {
    await persistSession(null);
  }, [persistSession]);


  const resetPassword = useCallback(async (email: string) => {
    if (!email) {
      throw new Error('Sıfırlama e-postası gönderilemedi.');
    }

    try{
      const result = await requestResetPassword({email}).unwrap();
      return result;
     
    }catch(error: any){
      const message = error?.data?.message || error?.message || "Sıfırlama e-postası gönderilemedi.";
      throw new Error(message);
    }

  }, [requestResetPassword]);


  const googleSignIn = useCallback(async () => {

    try{
      const result = await googleAuth();

      const user: IAuthUser = {
        id: Number(result.user.id),
        name: result.user.name,
        surname: result.user.surname,
        username: result.user.username,
        email: result.user.email,
        profile_photo: result.user.profile_photo,
      }
      
      const session = { user, accessToken: result.token }
      await persistSession(session);

    }catch(error){
      console.error('Google sign in error:', error);
      throw error;
    }

  }, [persistSession]);



  const value: IAuthContextValue = {
    session,
    user: session?.user ?? null,
    initializing,
    signIn,
    signUp,
    signOut,
    resetPassword,
    googleSignIn,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): IAuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
