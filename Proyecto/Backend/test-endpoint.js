const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/trainings/diego.rivera@example.com',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';

  console.log(`Status Code: ${res.statusCode}`);

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response:');
    console.log(data);
    try {
      const json = JSON.parse(data);
      console.log('\nParsed JSON:');
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('Could not parse as JSON');
    }
  });
});

req.on('error', (e) => {
  console.error(`Error: ${e.message}`);
});

req.end();
