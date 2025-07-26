import jwt from jsonwebtoken;
import dotenv, { configDotenv } from 'dotenv';
dotenv.config();

export const authMiddleware =(req, res, next) => {
    const token =req.header.authrorization?.split(' ');
    if(!token) res.status(401).json({message:"NO Token "});

    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }catch(err){
       res.status(401).json({message:"Invalid Token"}); 
    }
 };