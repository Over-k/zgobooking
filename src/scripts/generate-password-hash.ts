import { PasswordManager } from '../lib/utils/password';

async function generateHash() {
  const password = "Qwerty7@";
  const { hash, salt } = await PasswordManager.hashPassword(password);
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('Salt:', salt);
}

generateHash().catch(console.error); 