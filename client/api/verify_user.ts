import { PrismaClient } from '@prisma/client';
import { comparePasswords } from './utils/auth';

const prisma = new PrismaClient();

async function main() {
    const phone = '0555555555';
    const password = '123456';

    const user = await prisma.user.findUnique({
        where: { phone }
    });

    if (!user) {
        console.log('User not found!');
        return;
    }

    console.log('User found:', user);

    const isValid = await comparePasswords(password, user.password);
    console.log('Password valid:', isValid);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
