import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User, Visibility } from "../entities/User";
import bcrypt from "bcryptjs";
import * as crypto from "crypto";
import { sendVerificationEmail, sendResetPassword } from "../services/EmailService";
import jwt from "jsonwebtoken";
import { signToken } from "../utils/token";
import { areFriends, findFriendship, statusFriendship } from "../services/FriendshipService";
import { Friendship } from "../entities/Friendship";
import path from "path";
import fs from "fs";


export const createUser = async (req: Request, res: Response) => {

    const { name, surname, username, email, password, birth_date } = req.body;
    
    if (!email || !password){
        return res.status(400).json({ message: "Email and password is required!"})
    }
    

    try{
        const userRepo = AppDataSource.getRepository(User);
        const hashed_pass = await bcrypt.hash(password, 10);

        const token = crypto.randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 24*60*60*1000);

        const saved = await userRepo.save({ 
            name,
            surname,
            username,
            email,
            password: hashed_pass,
            birth_date,
            email_verification_token: token,
            email_verification_expires: expires
        });

        await sendVerificationEmail(email, token);

        res.status(201).json({ message: "Registration successful. Please verify your email." });

    }catch (err: any){
        if (err.code === "23505"){
            return res.status(409).json({ message: "Email or username already exsist!"});
        }
        console.log(err);
        res.status(500).json({ message: "Registiration failed"});
    }

};


export const verifyEmail = async (req: Request, res: Response) => {

    const { token } = req.query;

    if (!token){
        return res.status(400).json({ message: "Token is required!"});
    }

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ email_verification_token: token as string});

    if (!user){
        return res.status(400).json({ message: "Invalid token!"});
    }

    if (user.email_verification_expires < new Date()){
        return res.status(400).json({ message: "Token has expired!"});
    }

    user.is_email_verified = true;
    user.email_verification_token = null as any;
    user.email_verification_expires = null as any;

    await userRepo.save(user);
    console.log("Email verified succesfully!");
    res.json({ message: "Email verified successfully!"});
};


export const changePassword = async (req: Request, res: Response) => {

    const { email } = req.body;

    if (!email){
        return res.status(400).json({ message: "Email is required!"})
    }

    try{

        const userRepo = AppDataSource.getRepository(User);
        const user = await userRepo.findOneBy({ email: email });

        if (!user){
            return res.status(400).json({ message: "Invalid email address!"});
        }

        if (!user.is_email_verified){
            return res.status(400).json({ message: "You should validate your email address first!"});
        }

        const token = crypto.randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 24*60*60*1000);

        user.password_reset_token = token,
        user.password_reset_expires = expires

        console.log("PASS TOKEN: ", token); // postman
        await userRepo.save(user);
        
        await sendResetPassword(email, token);
        res.json({ message: "Password reset email sent!"});

    }catch (err: any){
        console.log(err);
        res.status(500).json({ message: "Reset password failed." });
    }

};


export const savePassword = async (req: Request, res: Response) => {

    const { token } = req.query;
    const { new_password } = req.body;

    if (!token || !new_password){
        return res.status(400).json({ message: "Token and new password is required!"});
    }

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ password_reset_token: token as string});
    
    if (!user){
        return res.status(400).json({ message: "Invalid token!"});
    }
    
    if (user.password_reset_expires < new Date()){
        return res.status(400).json({ message: "Token has expired!"});
    }
    
    const hashed_pass = await bcrypt.hash(new_password as string, 10);
    
    user.password = hashed_pass;
    user.password_reset_expires = null as any;
    user.password_reset_token = null as any;

    await userRepo.save(user);
    console.log("Password successfully changed!");
    res.json({ message: "Password successfully changed!"});

};

export const showResetPasswordPage = async ( req: Request, res: Response) => {
  
    const token = req.query.token as string;

  if (!token) {
    return res.status(400).send("Invalid reset link.");
  }

  const filePath = path.join(process.cwd(), "views", "reset-password.html");
  let html = fs.readFileSync(filePath, "utf-8");

  html = html.replace("{{RESET_TOKEN}}",token);
  res.send(html);

};


export const googleCallback = async (req: Request, res: Response) => {

    const user = req.user as User;

    if (!user){
        return res.status(401).json({ message: "Google authentication failed."});
    }

    const token = signToken(user);
    const userData = {
        id: String(user.id),
        name: user.name,
        surname: user.surname,
        username: user.surname,
        email: user.email,
        profile_photo: user.profile_photo ?? null,
    };

    const redirectURI = `musicroom://auth/google?token=${encodeURIComponent(token)}&user=${encodeURIComponent(JSON.stringify(userData))}`;

    console.log("GOOGLE CALLBACK ÇALIŞTI");
    console.log("REDIRECT:", redirectURI);

    return res.redirect(redirectURI);
};


export const getInfos = async (req: Request, res: Response) => {

    const viewerId = req.userId;
    const targetId = Number(req.params.id);
    
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({id: Number(targetId)});

    if (!user){
        return res.status(404).json({message: "User not found!"});
    }

    const public_info = { name: user.name, surname: user.surname, username: user.username};

    const friendship_info = { profile_photo: user.profile_photo, birth_date: user.birth_date};

    const private_info = { email: user.email, auth_provider: user.auth_provider};

    if (viewerId === targetId){
        return res.status(200).json({ ...public_info, ...friendship_info, ...private_info})
    }

    if (await areFriends(Number(viewerId), targetId)){
        return res.status(200).json({ ...public_info, ...friendship_info})
    }

    return res.status(200).json({ ...public_info });

};


export const updateProfile = async (req: Request, res: Response) => {

    const UPDATABLE_FIELDS = ["name", "surname", "username", "profile_photo", "birth_date"] as const;
    type UpdatableField = typeof UPDATABLE_FIELDS[number];

    const userId = req.userId;
    const updates: Partial<Record<UpdatableField, any>> = {};

    for (const field of UPDATABLE_FIELDS){
        if (req.body[field] !== undefined){
            updates[field] = req.body[field]
        }
    }

    if (Object.keys(updates).length === 0){
        return res.status(400).json({ message: "No valid fields to update"});
    }

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ id: userId });

    if (!user){
        return res.status(404).json({message: "User not found!"});
    }

    Object.assign(user, updates);
    await userRepo.save(user);

    return res.status(200).json({
        name: user.name,
        surname: user.surname,
        username: user.username,
        profile_photo: user.profile_photo,
        birth_date: user.birth_date
    })

};


export const updateProfileVisibility = async (req: Request, res: Response) => {

    const visibilityFields = ["name_visibility", "surname_visibility", "username_visibility", "email_visibility", "created_date_visibility", "profile_photo_visibility", "birth_date_visibility"] as const;

    type visibilityField = typeof visibilityFields[number];
    const userId = req.userId;
    const updates: Partial<Record<visibilityField, Visibility>> = {};

    for (const field of visibilityFields){
        if (req.body[field] !== "undifined"){

            const value = req.body[field];

            if (!Object.values(Visibility).includes(value)){
                return res.status(400).json({ message: `Invalid visibility value for ${field}`});
            }

            updates[field] = value;
        }
    }

    if (Object.keys(updates).length === 0){
        return res.status(400).json({ message: "No valid visibility fields to update."});
    }

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({id:userId});

    if (!user){
        return res.status(400).json({ message: "User not found."});
    }

    Object.assign(user, updates);
    await userRepo.save(user);

    return res.status(200).json({ message: "Profile visibility updated sucessfully.", visibility: {
        name_visibility: user.name_visibility,
        surname_visibility: user.surname_visibility,
        username_visibility: user.username_visibility,
        created_date_visibility: user.created_date_visibility,
        profile_photo_visibility: user.profile_photo_visibility,
        birth_date_visibility: user.birth_date_visibility,
        email_visibility: user.email_visibility
        }
    })

}


export const login = async (req: Request, res: Response) => {

    const {email, password} = req.body;

    if (!email || !password){
        return res.status(400).json({message: "Email and password are required."});
    }

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.createQueryBuilder("user").addSelect("user.password").where("user.email = :email", {email}).getOne();

    if (!user || !user.password || !await bcrypt.compare(password, user.password)){
        return res.status(401).json({message: "Invalid credentials!"});
    }

    if (!user.is_email_verified){
        return res.status(401).json({message: "Please verify your email first."});
    }

    const token = signToken(user);

    return res.status(200).json({ token,
        user: { id: user.id, name: user.name, surname: user.surname, username: user.username, email: user.email },
     });

};


export const sendFriendRequest = async (req: Request, res: Response) => {

    const requestSender = req.userId;
    const requestReceiver = Number(req.params.id);

    if (requestSender === requestReceiver){
        return res.status(409).json({message: "You can't send a request to yourself."});
    }

    const userRepo = AppDataSource.getRepository(User);
    const targetUser = await userRepo.findOneBy({id: requestReceiver});

    const exsist = await findFriendship(Number(requestSender), requestReceiver);

    if (exsist){
        return res.status(409).json({ message: "Request already exsist or you are already friends."});
    }

    await AppDataSource.getRepository(Friendship).save({ sender: {id: requestSender}, receiver: {id: requestReceiver} });

    return res.status(201).json({ message: "Friendship request sent."});
};


export const acceptFriendsRequest = async (req: Request, res: Response) => {

    const requestReceiver = req.userId;
    const requestSender = Number(req.params.id);

    const requestStatus = await statusFriendship(Number(requestReceiver), requestSender);

    if (!requestStatus){
        return res.status(404).json({message: "No pending request!"});
    }
    
    requestStatus.status = "accepted";
    await AppDataSource.getRepository(Friendship).save(requestStatus);

    return res.status(200).json({message: "Friendship request accepted."});

}


export const getUsers = async (req: Request, res: Response) => {

    const userRepo = AppDataSource.getRepository(User);
    const users = await userRepo.find();
    res.json(users);

};
