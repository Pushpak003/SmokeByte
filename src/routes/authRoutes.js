import {register,login} from "../controllers/authController.js";
import {Router} from "express";

const Router = Router();

Router.post('/signup',register);
Router.post('/login',login);

export default Router;