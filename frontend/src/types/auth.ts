export interface IAuthUser {
  id: number;
  name: string;
  surname: string;
  username: string;
  email: string;
  profile_photo?: string | null;
}

export interface IAuthSession {
  user: IAuthUser;
  accessToken: string;
  // refreshToken: string;
}

export interface ILoginResponse {
  token: string;
  user: IAuthUser;
}


export interface IAuthContextValue {
  session: IAuthSession | null;
  user: IAuthUser | null;
  initializing: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, surname: string, username: string, email: string, password: string, birth_date?: string,) => Promise<{message:string}>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{message: string}>;
  googleSignIn: () => Promise<void>;
}
