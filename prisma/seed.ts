import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const senhaHash = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@imobiliaria.com" },
    update: {},
    create: {
      nome: "Administrador",
      email: "admin@imobiliaria.com",
      senhaHash,
      role: "ADMIN",
    },
  });

  await prisma.imobiliaria.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      nome: "Minha Imobiliária",
      endereco: "Endereço da imobiliária",
      telefone: "(00) 0000-0000",
      email: "contato@imobiliaria.com",
    },
  });

  console.log("Seed concluído. Login: admin@imobiliaria.com / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
