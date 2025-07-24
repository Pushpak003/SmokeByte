import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();    

export const generateToken =(payload) =>{
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '7d' // Token expires in 7 days
    });
};
export const verifyToken = (token) => {
        return jwt.verify(token,process.env.JWT_SECRET);
    
};
