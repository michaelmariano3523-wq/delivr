import crypto from 'crypto';

const hashPassword = (password: string): string => {
  return crypto.createHash('sha256').update(password + 'delivr_salt_2024').digest('hex');
};

const password = 'M@1dasilva';
const hashedPassword = hashPassword(password);

console.log('Senha original:', password);
console.log('Hash gerado:', hashedPassword);
console.log('');
console.log('INSERT SQL:');
console.log(`
INSERT INTO users (username, password, name, role, status) 
VALUES ('marianodasilva', '${hashedPassword}', 'marianodasilva', 'admin', 'approved');
`);
