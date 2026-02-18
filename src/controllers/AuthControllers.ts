import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../../db";
import { users } from "../schema";
import { eq } from "drizzle-orm";

// REGISTER
export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;

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
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "User registered successfully",
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
      token,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}

// LOGIN
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    // find user
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

    // issue JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      user: { id: user.id, name: user.name, email: user.email },
      token,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}
