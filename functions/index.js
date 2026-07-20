const { onRequest } = require('firebase-functions/v2/https');
const https = require('https');

const CRM_HOST = 'crmwebapi.oneinsure.com';
const CRM_PATH = '/api/common/util_FreedomEmail';

exports.proxyEmail = onRequest({ cors: true, region: 'us-central1' }, (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const body = JSON.stringify(req.body);

  const options = {
    hostname: CRM_HOST,
    path: CRM_PATH,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
  };

  const proxyReq = https.request(options, (proxyRes) => {
    let data = '';
    proxyRes.on('data', chunk => { data += chunk; });
    proxyRes.on('end', () => {
      res.status(proxyRes.statusCode).send(data);
    });
  });

  proxyReq.on('error', (err) => {
    console.error('CRM proxy error:', err.message);
    res.status(500).json({ error: err.message });
  });

  proxyReq.write(body);
  proxyReq.end();
});
