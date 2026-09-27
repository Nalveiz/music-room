import * as WebbBrowser from 'expo-web-browser'
import * as AuthSession from 'expo-auth-session'


WebbBrowser.maybeCompleteAuthSession();

const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL

export interface GoogleAuthResult {

    token: string;
    user: {
        id: string;
        name: string;
        surname: string;
        username: string;
        email: string;
        profile_photo: string | null;
    };

}


export const googleAuth = async (): Promise<GoogleAuthResult> => {

    const redirectURI = AuthSession.makeRedirectUri({
        scheme: 'musicroom',
        path: 'auth/google',
    });

    const result = await WebbBrowser.openAuthSessionAsync(`${API_URL}/auth/google`, redirectURI);

    if (result.type !== 'success'){
        console.log('Google Auth Result:', result);
        throw new Error('Google ile giriş başarısız.');
    }

    const url = new URL(result.url);
    const token = url.searchParams.get('token');
    const userData = url.searchParams.get('user');

    if (!token || !userData){
        throw new Error('Google authentication bilgileri alınamadı.');
    }

    let user;

    try{
        user = JSON.parse(userData);
    }catch{
        throw new Error("Google kullanıcı bilgileri okunamadı.");
    }

    return {token, user};

};
