import { PrismaClient } from "@prisma/client";

// add a prisma instance to global access
declare global {
  var prisma: PrismaClient | undefined;
}
// keep same prisma client in development despite hot reloading
const prismadb = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalThis.prisma = prismadb;

export default prismadb;
