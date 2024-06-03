const { PrismaClient } = require('@prisma/client')
const pico = require('picocolors')

const prisma = new PrismaClient()

async function main() {
    console.log(pico.green('Connected to db...'))
    await prisma.items.create({
        data: {
            itemId: 123456,
            title: 'Test',
            price: 10,
            fav_count: 2,
            hidden: false,
        },
      })
}

async function search() {
    console.log(pico.green('Connected to db...'))
    const allItems = await prisma.items.findMany()
    console.log(allItems)
}

try {
    search()
    prisma.$disconnect()
} catch (err) {
    console.error(err)
    prisma.$disconnect()
    process.exit(1)
}
