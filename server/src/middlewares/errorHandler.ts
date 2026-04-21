import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "../generated/prisma/client";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error(err);

  if (err instanceof ZodError) {
    res.status(400).json({
      message: "Validasi gagal.",
      errors: err.flatten().fieldErrors,
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      res.status(409).json({ message: "Data sudah ada (duplikat)." });
      return;
    }
    if (err.code === "P2025") {
      res.status(404).json({ message: "Data tidak ditemukan." });
      return;
    }
  }

  const status = (err as any)?.status ?? 500;
  const message = (err as any)?.message ?? "Terjadi kesalahan server.";
  res.status(status).json({ message });
}
