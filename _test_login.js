var http = require('http');

var body = JSON.stringify({ email: 'support@grandhr.in', password: 'Develop@2212' });

var options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body)
  }
};

console.log('Testing login API at http://localhost:5000/api/auth/login');
console.log('Email: support@grandhr.in');

var req = http.request(options, function(res) {
  var data = '';
  res.on('data', function(chunk) { data += chunk; });
  res.on('end', function() {
    console.log('Status:', res.statusCode);
    try {
      var json = JSON.parse(data);
      if (res.statusCode === 200 && json.token) {
        console.log('LOGIN SUCCESS! Token received.');
        console.log('User:', json.user && json.user.email);
        console.log('Role:', json.user && json.user.role);
      } else {
        console.log('Response:', JSON.stringify(json, null, 2));
        if (res.statusCode === 401) {
          console.log('\nFIX: User does not exist in DB or password is wrong.');
          console.log('Run: cd ~/grandhr/backend && node scripts/create-admin.js');
        }
      }
    } catch(e) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', function(e) {
  console.log('Request failed:', e.message);
});

req.write(body);
req.end();
