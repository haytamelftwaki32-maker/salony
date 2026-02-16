import { PrismaClient } from '@prisma/client';
import { hashPassword } from './src/utils/auth';

const prisma = new PrismaClient();

async function createTestAccount() {
    try {
        console.log('🔄 إنشاء حسابات تجريبية...\n');

        // Create a test barber account
        const hashedPassword = await hashPassword('123456');

        // Check if phone exists
        const existingBarber = await prisma.user.findUnique({
            where: { phone: '0612345678' }
        });

        if (!existingBarber) {
            const user = await prisma.user.create({
                data: {
                    phone: '0612345678',
                    name: 'Expert Barber',
                    role: 'BARBER',
                    password: hashedPassword
                }
            });

            // Create barber profile
            await prisma.barberProfile.create({
                data: {
                    userId: user.id,
                    specialties: JSON.stringify(['Haircut', 'Beard Trim']),
                    priceRange: '$$',
                    isAvailable: true,
                    district: 'Maarif, Casablanca'
                }
            });

            console.log('✅ حساب الحلاق تم إنشاؤه بنجاح!');
            console.log('📱 الهاتف: 0612345678');
            console.log('🔑 كلمة المرور: 123456');
            console.log('👤 الدور: حلاق (BARBER)\n');
        } else {
            console.log('⚠️  الحساب 0612345678 موجود بالفعل\n');
        }

        // Create a test client account
        const existingClient = await prisma.user.findUnique({
            where: { phone: '0698765432' }
        });

        if (!existingClient) {
            const clientPassword = await hashPassword('123456');
            await prisma.user.create({
                data: {
                    phone: '0698765432',
                    name: 'Demo Client',
                    role: 'CLIENT',
                    password: clientPassword
                }
            });

            console.log('✅ حساب العميل تم إنشاؤه بنجاح!');
            console.log('📱 الهاتف: 0698765432');
            console.log('🔑 كلمة المرور: 123456');
            console.log('👤 الدور: عميل (CLIENT)\n');
        } else {
            console.log('⚠️  الحساب 0698765432 موجود بالفعل\n');
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎉 الحسابات التجريبية جاهزة للاستخدام!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n💡 جرب تسجيل الدخول الآن على: http://localhost:5173');

    } catch (error) {
        console.error('❌ خطأ:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createTestAccount();
