import User from '../models/userModel.js';
import { generateToken } from '../utils/jwtUtils.js';
import bcrypt from 'bcrypt';

export const register = async(req,res) => {
    const{username, password} = req.body;
    try {
        const existingUser = await User.findOne({where: {username}});
        if(existingUser){
            return res.status(400).json({message: 'User already exists'});
        }
        const hashedPassword = await bcrypt.hash(password,10);


        const user = await User.create({username,password: hashedPassword});
        const token = generateToken({id: user.id,username:user.username});

        res.status(201).json({token, user:{id:user.id,username: user.username}});
}catch(err){
   res.status(500).json({message:err.message});
   }
};

export const login = async(req, res) => {
    const {uesrname,password}= req.body;
    try{
        const user = await User.findOne({where: username});
        if(!user)  return res.stauts(401).json({message: "Invalid Credentials"});

        const match = await bcrypt.compare(password, user.password);
        if(!match) return res.status(401).json({messsage:"Invalid Credentials"});
        const token = generateToken({id:user.id,useernamae: user.username});
        res.status(200).json({token,user:{id:user.id,username:user.username}});
    }catch(err){
        res.status(500).json({message:err.message})
    }
};