import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";



passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: process.env.GOOGLE_REDIRECT_URI!
        },
        async (accessToken, refreshToken, profile, cb) => {
            
            try{
                const userRepo = AppDataSource.getRepository(User);
                const email = profile.emails?.[0]?.value;

                if (!email) return cb(new Error("Google email alınamadı"), false);

                let user = await userRepo.findOneBy({email});
    
                if (!user){
    
                    const new_user: Partial<User> = {
    
                        name: profile.name?.givenName || "",
                        surname: profile.name?.familyName || "",
                        username: email?.split("@")[0] + "_" + profile.id.slice(0,5),
                        email,
                        google_id : profile.id,
                        auth_provider: "google",
                        is_email_verified: true,
                        profile_photo: profile.photos?.[0]?.value,
    
                    };
                    user = await userRepo.save(userRepo.create(new_user));
                }else if (user && !user.google_id){
                    user.google_id = profile.id;
                    user = await userRepo.save(user);
                }

                return cb(null, user);

            }catch(err){
                return cb(err as Error, false);
            }

        }

    )
);

export default passport;