import {  Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

const protect = async ( req: Request, res: Response, next: NextFunction) => {
    const {isLoggesIn,userId} = req.session;
    if(!isLoggesIn || !userId){
        return res.status(401).json({message:"Unauthorized access "});

}
    next();

    export default protect;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }