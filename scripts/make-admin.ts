import "dotenv/config";
import { prisma } from "../src/lib/prisma";

// Uso: npm run make-admin -- voce@email.com
// A conta precisa já ter sido criada em /signup.
async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Uso: npm run make-admin -- voce@email.com");
    process.exitCode = 1;
    return;
  }
  const user = await prisma.user.update({ where: { email }, data: { role: "ADMIN" } });
  console.log(`${user.email} agora é ADMIN.`);
}

main()
  .catch((e) => {
    console.error("Não foi possível promover. A conta existe?", e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
