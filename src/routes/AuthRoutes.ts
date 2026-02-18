import express from "express";
import { register, login, logout, verifyEmail, resetPassword } from "../controllers/AuthControllers";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/verify-email", verifyEmail);
authRouter.post("/reset-password", resetPassword);

export default authRouter;
