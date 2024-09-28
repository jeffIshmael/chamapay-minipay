import { Prisma, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const chamas: Prisma.ChamaCreateInput[] = [
  {
    name: 'Friends',
    type: 'Private',
    amount: 200,
    cycleTime: 14,
    maxNo: 0,
    slug: 'friends',
    startDate: new Date(Date.now()),
    payDate: new Date(Date.now()),
    admin: {
      connectOrCreate: {
        where: {
          address: '0x765', 
        },
        create: {
          address: '0x765',
          name: 'Ian',
          role: 'drool',
        },
      },
    },
  },
  {
    name: 'Grinders',
    type: 'Public',
    amount: 500,
    cycleTime: 30,
    maxNo: 5,
    slug: 'grinders',
    startDate: new Date(Date.now()),
    payDate: new Date(Date.now()),
    admin: {
      connectOrCreate: {
        where: {
          address: '0x3452', // Try to connect Jeff as the admin
        },
        create: {
          address: '0x3452',
          name: 'Jeff',
          role: 'happiness',
        },
      },
    },
  },
]

async function main() {
  console.log('start seeding...')
  
  for (const chama of chamas) {
    const newChama = await prisma.chama.create({
      data: chama,
    })
    console.log(`created chama with id ${newChama.id}`)
  }

  console.log('Seeding ended.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
