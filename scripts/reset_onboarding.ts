import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const { count } = await prisma.consultant.updateMany({
        where: {
            authId: { not: null }
        },
        data: {
            primaryBrandId: null,
            phone: null
        }
    })
    console.log(`Reset ${count} authenticated consultant(s).`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
