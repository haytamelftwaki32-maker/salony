
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixDatabaseLanguage() {
    try {
        console.log('🔄 Updating database language to English/Standard Keys...');

        // 1. Update Barber User
        const barber = await prisma.user.findUnique({
            where: { phone: '0612345678' }
        });

        if (barber) {
            // Update User Name
            await prisma.user.update({
                where: { id: barber.id },
                data: { name: 'Expert Barber' }
            });

            // Update Profile
            await prisma.barberProfile.update({
                where: { userId: barber.id },
                data: {
                    district: 'Maarif, Casablanca',
                    specialties: JSON.stringify(['Haircut', 'Beard Trim']),
                    // Also clear 'services' if it has hardcoded Arabic, to fallback to specialties logic
                    // Or set it to English structure
                    services: JSON.stringify([
                        { id: '1', name: 'Haircut', price: 70 },
                        { id: '2', name: 'Beard Trim', price: 40 }
                    ])
                }
            });
            console.log('✅ Updated Barber: Expert Barber (0612345678)');
        } else {
            console.log('⚠️ Barber account not found (0612345678)');
        }

        // 2. Update Client User
        const client = await prisma.user.findUnique({
            where: { phone: '0698765432' }
        });

        if (client) {
            await prisma.user.update({
                where: { id: client.id },
                data: { name: 'Demo Client' }
            });
            console.log('✅ Updated Client: Demo Client (0698765432)');
        } else {
            console.log('⚠️ Client account not found (0698765432)');
        }

    } catch (error) {
        console.error('❌ Error updating database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixDatabaseLanguage();
