import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../../db";
import { users } from "../schema";
import { eq } from "drizzle-orm";

// REGISTER
export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // check if user exists
    const existing = await db.select().from(users).where(eq(users.email, email));
    if (existing.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // insert new user
    const result = await db
      .insert(users)
      .values({ name, email, password: hashedPassword })
      .returning();

    const newUser = result[0];

    // issue JWT
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not set");
      return res.status(500).json({ message: "Server configuration error" });
    }

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    return res.status(201).json({
      message: "User registered successfully",
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
      token,
    });
  } catch (error: any) {
    console.error("Register error:", error);
    return res.status(500).json({ message: error?.message || "Internal server error" });
  }
}

// LOGIN
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // find user by email
    const result = await db.select().from(users).where(eq(users.email, email));
    const user = result[0];
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not set");
      return res.status(500).json({ message: "Server configuration error" });
    }

    // issue JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    return res.json({
      message: "Login successful",
      user: { id: user.id, name: user.name, email: user.email },
      token,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return res.status(500).json({ message: error?.message || "Internal server error" });
  }
}

// LOGOUT
export const logout = (req: Request, res: Response) => {
  if (req.session) {
    req.session.destroy((error: any) => {
      if (error) {
        return res.status(500).json({ message: "Logout failed" });
      }
      return res.json({ message: "Logged out successfully" });
    });
  } else {
    return res.json({ message: "No active session" });
  }
};

// VERIFY EMAIL
export const verifyEmail = (req: Request, res: Response) => {
  return res.json({ message: "Email verification endpoint" });
};

// RESET PASSWORD
export const resetPassword = (req: Request, res: Response) => {
  return res.json({ message: "Password reset endpoint" });
};
