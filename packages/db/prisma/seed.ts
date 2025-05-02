import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


async function main() {
  await prisma.tinta.createMany({
    data: [
      {
        nome: 'Suvinil Azul Sereno',
        cor: 'azul claro',
        superficie: 'parede',
        ambiente: 'externo',
        acabamento: 'fosco',
        features: ['lavável', 'anti-mofo'],
        linha: 'Premium',
      },
      {
        nome: 'Suvinil Branco Neve',
        cor: 'branco',
        superficie: 'reboco',
        ambiente: 'interno',
        acabamento: 'acetinado',
        features: ['sem odor'],
        linha: 'Standard',
      },
      {
        nome: 'Suvinil Cinza Urbano',
        cor: 'cinza',
        superficie: 'madeira',
        ambiente: 'interno',
        acabamento: 'brilhante',
        features: ['lavável'],
        linha: 'Premium',
      },
    ],
  });

  console.log('Tinta seed criada.');
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());