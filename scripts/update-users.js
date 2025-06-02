// Script para actualizar usuarios con nuevos campos
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Función para generar contraseñas seguras
function generatePassword(length = 12) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]\\:;?><,./-=';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

// Leer el archivo actual
const usersPath = path.join(__dirname, '..', 'public', 'data', 'users.json');
const usersData = require(usersPath);

// Actualizar cada usuario
const updatedUsers = usersData.users.map(user => ({
  ...user,
  // Mantener los campos existentes
  phone: '', // Nuevo campo para teléfono
  address: '', // Nuevo campo para dirección
  password: generatePassword(12), // Generar contraseña segura
  // Mantener los campos existentes
  bio: user.bio || '', // Asegurar que bio exista
  role: user.role || 'user', // Asegurar que role exista
  joinDate: user.joinDate || new Date().toISOString(), // Asegurar que joinDate exista
  lastLogin: user.lastLogin || null // Asegurar que lastLogin exista
}));

// Crear el objeto actualizado
const updatedData = {
  users: updatedUsers
};

// Guardar el archivo actualizado
fs.writeFileSync(
  usersPath,
  JSON.stringify(updatedData, null, 2),
  'utf8'
);

console.log('Usuarios actualizados exitosamente!');
console.log('Número de usuarios actualizados:', updatedUsers.length);
