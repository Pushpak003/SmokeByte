import { verifyAccessToken } from './../utils/jwtUtils.js';

export const authMiddleware =(req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(!token){ res.status(401).json({message:"NO Token "});
    }
    try{
        const decoded = verifyAccessToken(token);
        req.user = decoded;
        next();
    }catch(err){
       res.status(403).json({message:"Invalid Token"}); 
    }
 };