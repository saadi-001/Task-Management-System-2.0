const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

async function testUpload() {
  // We need a valid token to test the upload endpoint.
  // I will just send a random file and see what error it returns (maybe 401 Unauthorized first, which means it's reachable).
  
  const form = new FormData();
  form.append('image', Buffer.from('test'), { filename: 'test.txt', contentType: 'text/plain' });
  
  try {
    const res = await fetch('https://20.6.104.150.sslip.io/api/tickets/9/attachments', {
      method: 'POST',
      body: form
    });
    console.log(res.status);
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error("Fetch error:", err);
  }
}
testUpload();
