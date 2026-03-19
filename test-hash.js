const bcrypt = require('bcryptjs');

const password = '123456';
const hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

bcrypt.compare(password, hash).then(result => {
  console.log('RESULTADO:', result);
}).catch(err => {
  console.error('ERRO:', err.message);
});
