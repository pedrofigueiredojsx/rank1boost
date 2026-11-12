import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const total = await prisma.service.count();
  console.log("Conexão ok. Serviços cadastrados:", total);
}

main().finally(() => prisma.$disconnect());
