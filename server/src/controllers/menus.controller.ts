import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const menuSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  unit: z.string().min(1),
  baseCost: z.number().nonnegative(),
  price: z.number().nonnegative(),
  isActive: z.boolean().optional(),
});

const updateSchema = menuSchema.partial();

export async function getMenus(req: Request, res: Response): Promise<void> {
  const search =
    typeof req.query.search === "string" ? req.query.search : undefined;
  const status =
    typeof req.query.status === "string" ? req.query.status : undefined;

  const menus = await prisma.menu.findMany({
    where: {
      ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
      ...(status === "active"
        ? { isActive: true }
        : status === "archived"
          ? { isActive: false }
          : {}),
    },
    orderBy: { createdAt: "asc" },
  });

  res.json(menus);
}

export async function createMenu(req: Request, res: Response): Promise<void> {
  const data = menuSchema.parse(req.body);
  const menu = await prisma.menu.create({ data });
  res.status(201).json(menu);
}

export async function updateMenu(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  const data = updateSchema.parse(req.body);
  const menu = await prisma.menu.update({ where: { id }, data });
  res.json(menu);
}
