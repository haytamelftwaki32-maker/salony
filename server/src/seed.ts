import { PrismaClient } from '@prisma/client';
import { hashPassword } from './utils/auth';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding ...');

    const password = await hashPassword('123456');

    // Create Client
    const client = await prisma.user.upsert({
        where: { phone: '0555555555' },
        update: { password }, // Force update password
        create: {
            phone: '0555555555',
            name: 'Test Client',
            password,
            role: 'CLIENT',
        },
    });
    console.log(`Created/Updated client: ${client.phone}`);

    // Create Barber
    const barberUser = await prisma.user.upsert({
        where: { phone: '0666666666' },
        update: { password }, // Force update password
        create: {
            phone: '0666666666',
            name: 'Test Barber',
            password,
            role: 'BARBER',
        },
    });

    // Create Admin
    const adminUser = await prisma.user.upsert({
        where: { phone: '0000000000' },
        update: { password },
        create: {
            phone: '0000000000',
            name: 'Admin User',
            password,
            role: 'ADMIN',
        },
    });
    console.log(`Created/Updated admin: ${adminUser.phone}`);

    // Create Barber Profile
    const barberProfile = await prisma.barberProfile.upsert({
        where: { userId: barberUser.id },
        update: {},
        create: {
            userId: barberUser.id,
            specialties: '["Haircut", "Beard Trim"]',
            priceRange: '$$',
            isAvailable: true,
            bio: 'Expert barber with 5 years of experience.',
            portfolio: JSON.stringify([
                'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=500&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=500&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1503951914875-befbb6470523?w=500&auto=format&fit=crop&q=60'
            ])
        },
    });

    console.log(`Created barber: ${barberUser.phone}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
