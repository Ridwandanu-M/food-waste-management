import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { Role } from "../generated/prisma/enums";

const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.nativeEnum(Role),
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.nativeEnum(Role).optional(),
  isActive: z.boolean().optional(),
});

const SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
};

export async function getUsers(req: Request, res: Response): Promise<void> {
  const search =
    typeof req.query.search === "string" ? req.query.search : undefined;
  const role = typeof req.query.role === "string" ? req.query.role : undefined;

  const users = await prisma.user.findMany({
    where: {
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(role && role !== "ALL" ? { role: role as Role } : {}),
    },
    select: SELECT,
    orderBy: { createdAt: "asc" },
  });

  res.json(users);
}

export async function createUser(req: Request, res: Response): Promise<void> {
  const data = createSchema.parse(req.body);
  const hashed = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: { ...data, password: hashed },
    select: SELECT,
  });

  res.status(201).json(user);
}

export async function updateUser(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  const data = updateSchema.parse(req.body);

  const user = await prisma.user.update({
    where: { id },
    data,
    select: SELECT,
  });

  res.json(user);
}
