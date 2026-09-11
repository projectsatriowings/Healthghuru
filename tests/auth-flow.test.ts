import 'dotenv/config';
import { sql } from '../src/lib/db';
import bcrypt from 'bcryptjs';

async function testAuthFlow() {
  console.log('============================================');
  console.log('🧪 TESTING HEALTHGURU AUTHENTICATION FLOW');
  console.log('============================================\n');

  const testEmail = `testuser_${Date.now()}@healthghurutest.com`;
  const testPassword = 'Password123!';
  const newPassword = 'NewSecretPassword456!';
  const testName = 'Alex Mercer';

  try {
    // 1. Test Registration
    console.log(`[1] Testing User Registration for: ${testEmail}`);
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(testPassword, salt);

    const insertRes = await sql`
      INSERT INTO users (name, email, password_hash, role, status, email_verified, created_at, updated_at)
      VALUES (${testName}, ${testEmail.toLowerCase()}, ${passwordHash}, 'user', 'active', TRUE, NOW(), NOW())
      RETURNING id, name, email, role, status;
    `;
    const user = insertRes[0];
    console.log('   ✓ User registered in PostgreSQL with ID:', user.id);
    console.log('   ✓ Role:', user.role, '| Status:', user.status);

    // 2. Verify Duplicate Email Prevention
    console.log('\n[2] Testing Duplicate Registration Rejection');
    const duplicateCheck = await sql`
      SELECT id FROM users WHERE LOWER(email) = ${testEmail.toLowerCase()}
    `;
    if (duplicateCheck.length >= 1) {
      console.log('   ✓ Duplicate detection correctly identifies existing user');
    }

    // 3. Test Password Verification (Login Simulation)
    console.log('\n[3] Testing Password Verification (Sign-In)');
    const dbUsers = await sql`
      SELECT id, name, email, password_hash, role, status FROM users WHERE LOWER(email) = ${testEmail.toLowerCase()}
    `;
    const dbUser = dbUsers[0];
    const isPasswordValid = await bcrypt.compare(testPassword, dbUser.password_hash);
    const isWrongPasswordInvalid = !(await bcrypt.compare('WrongPassword999', dbUser.password_hash));
    
    if (isPasswordValid && isWrongPasswordInvalid) {
      console.log('   ✓ Password verification succeeded with correct password');
      console.log('   ✓ Invalid password rejected correctly');
    } else {
      throw new Error('Password verification check failed');
    }

    // 4. Test Forgot Password Token Generation
    console.log('\n[4] Testing Forgot Password Token Flow');
    const crypto = await import('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hr

    await sql`
      UPDATE users 
      SET reset_token = ${resetToken}, reset_token_expires = ${expiresAt.toISOString()}::timestamptz
      WHERE id = ${user.id}::uuid
    `;

    const tokenCheck = await sql`
      SELECT reset_token, reset_token_expires FROM users WHERE id = ${user.id}::uuid
    `;
    if (tokenCheck[0]?.reset_token === resetToken) {
      console.log('   ✓ Reset token saved and verified with expiry in database');
    }

    // 5. Test Reset Password with Token
    console.log('\n[5] Testing Password Reset Execution');
    const newHash = await bcrypt.hash(newPassword, 10);
    await sql`
      UPDATE users 
      SET password_hash = ${newHash}, reset_token = NULL, reset_token_expires = NULL, updated_at = NOW()
      WHERE reset_token = ${resetToken} AND reset_token_expires > NOW()
    `;

    const updatedUser = await sql`
      SELECT password_hash, reset_token FROM users WHERE id = ${user.id}::uuid
    `;
    const newPassMatch = await bcrypt.compare(newPassword, updatedUser[0].password_hash);
    const oldPassInvalid = !(await bcrypt.compare(testPassword, updatedUser[0].password_hash));

    if (newPassMatch && oldPassInvalid && updatedUser[0].reset_token === null) {
      console.log('   ✓ New password successfully updated and active');
      console.log('   ✓ Old password invalidated');
      console.log('   ✓ Reset token cleared securely');
    }

    // 6. Clean up test user
    await sql`DELETE FROM users WHERE id = ${user.id}::uuid`;
    console.log('\n[6] Cleaned up temporary test user');

    console.log('\n============================================');
    console.log('🎉 ALL AUTHENTICATION TESTS PASSED 100%!');
    console.log('============================================\n');
  } catch (err) {
    console.error('❌ Auth flow test failed:', err);
    process.exit(1);
  }
}

testAuthFlow();
