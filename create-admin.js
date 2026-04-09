import crypto from 'crypto';

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'delivr_salt_2024').digest('hex');
}

const password = 'M@1dasilva';
const hashedPassword = hashPassword(password);

console.log('INSERT INTO users (username, password, name, role, status)');
console.log("VALUES ('marianodasilva', '" + hashedPassword + "', 'marianodasilva', 'admin', 'approved');");
