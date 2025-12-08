const http = require('http');

// Datos de prueba para actualizar el perfil
const updateData = JSON.stringify({
  names: 'Diego Actualizado',
  lastnames: 'Cabrera Sánchez',
  description: 'Perfil actualizado mediante stored procedure sp_user_update_profile. ¡Funciona correctamente!',
  profilePhoto: '/images/updated-profile.jpg',
  age: 24
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/users/diegoGo@runner.com/profile',
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(updateData)
  }
};

console.log('🔄 Enviando solicitud PUT para actualizar perfil...');
console.log('📧 Email: diegoGo@runner.com');
console.log('📋 Datos:', JSON.parse(updateData));
console.log('');

const req = http.request(options, (res) => {
  let data = '';

  console.log(`✅ Status Code: ${res.statusCode}`);
  console.log('');

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('📥 Response:');
    try {
      const json = JSON.parse(data);
      console.log(JSON.stringify(json, null, 2));
      
      if (res.statusCode === 200) {
        console.log('');
        console.log('✅ ¡Perfil actualizado exitosamente!');
        console.log('');
        console.log('📊 Cambios aplicados:');
        console.log('  - Nombres:', json.data?.names);
        console.log('  - Apellidos:', json.data?.lastNames);
        console.log('  - Descripción:', json.data?.description);
        console.log('  - Edad:', json.data?.age);
      } else {
        console.log('');
        console.log('❌ Error al actualizar perfil');
      }
    } catch (e) {
      console.log(data);
      console.log('⚠️ Could not parse as JSON');
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Error: ${e.message}`);
  console.log('');
  console.log('⚠️ Asegúrate de que el servidor esté corriendo en el puerto 3000');
});

req.write(updateData);
req.end();
