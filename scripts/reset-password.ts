import { prisma } from '../lib/db/prisma';
import { hashPassword } from '../lib/auth/password';

async function resetPassword() {
  try {
    // Get the new password from command line argument
    const newPassword = process.argv[2];

    if (!newPassword) {
      console.error('❌ Error: Please provide a new password');
      console.log('Usage: npm run reset-password <new-password>');
      process.exit(1);
    }

    if (newPassword.length < 6) {
      console.error('❌ Error: Password must be at least 6 characters');
      process.exit(1);
    }

    // Find the admin user
    const user = await prisma.user.findUnique({
      where: { username: 'admin' },
    });

    if (!user) {
      console.error('❌ Error: Admin user not found');
      process.exit(1);
    }

    // Hash the new password
    const passwordHash = await hashPassword(newPassword);

    // Update the password
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    console.log('✅ Password reset successfully!');
    console.log(`Username: admin`);
    console.log(`New password: ${newPassword}`);
  } catch (error) {
    console.error('❌ Error resetting password:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
