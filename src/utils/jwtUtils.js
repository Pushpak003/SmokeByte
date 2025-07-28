import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();    

export const generateAccessToken =(payload) =>{
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '15m' // Token expires in 7 days
    });
};

export const generateRefreshToken = (payload) =>{
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET,{expiresIn:'7d'});
};
export const verifyAccessToken = (token) => {
        return jwt.verify(token,process.env.JWT_SECRET);   
};

export const verifyRefreshToken =(token) => {
    console.log('Refresh Secret Used:', process.env.JWT_REFRESH_SECRET);

    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};