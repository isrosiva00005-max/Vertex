const https = require('https');

// Read netlify auth token from CLI config
const os = require('os');
const path = require('path');
const fs = require('fs');

// Find the netlify config
const possiblePaths = [
  path.join(os.homedir(), 'AppData', 'Roaming', 'netlify', 'config.json'),
  path.join(os.homedir(), 'AppData', 'Local', 'netlify', 'config.json'),
  path.join(os.homedir(), '.netlify', 'config.json'),
  path.join(os.homedir(), '.config', 'netlify', 'config.json'),
];

let token = null;
for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(p, 'utf-8'));
      const users = cfg.users || {};
      const userKeys = Object.keys(users);
      if (userKeys.length) token = users[userKeys[0]].auth?.token;
      if (token) { console.log('Found config at:', p); break; }
    } catch (_) {}
  }
}

if (!token) {
  console.error('Could not find Netlify auth token. Showing environment:');
  // Try env var
  token = process.env.NETLIFY_AUTH_TOKEN;
  if (!token) {
    console.error('No NETLIFY_AUTH_TOKEN env var either.');
    process.exit(1);
  }
}

const SITE_ID = '77bc6cf9-cf57-45f1-aab7-7c794333d493';
const namesToTry = [
  'vertex', 'vertexapp', 'vertex-app', 'vertexglobal',
  'vertex-global', 'vertex-site', 'the-vertex', 'vertexhq',
  'vertex-hq', 'vertex-excellence', 'vertexexcellence'
];

async function tryRename(name) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ name });
    const opts = {
      hostname: 'api.netlify.com',
      path: `/api/v1/sites/${SITE_ID}`,
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(d) }); }
        catch(_) { resolve({ status: res.statusCode, data: d }); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

(async () => {
  for (const name of namesToTry) {
    process.stdout.write(`Trying "${name}"... `);
    const r = await tryRename(name);
    if (r.status === 200) {
      console.log(`✅ SUCCESS!`);
      console.log(`\n🌐 New URL: https://${r.data.default_domain}`);
      console.log(`   Admin:   https://app.netlify.com/projects/${name}`);
      break;
    } else {
      console.log(`❌ ${r.data?.message || r.data?.errors?.name || r.status}`);
    }
  }
})();
