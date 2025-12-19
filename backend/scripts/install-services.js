const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const servicesDir = path.join(__dirname, '..', 'apps');
const services = fs.readdirSync(servicesDir).filter(f => fs.statSync(path.join(servicesDir, f)).isDirectory());

if (services.length === 0) {
  console.error('No services found in apps/.');
  process.exit(1);
}

console.log('Found services:', services.join(', '));

for (const svc of services) {
  const svcPath = path.join(servicesDir, svc);
  const pkgPath = path.join(svcPath, 'package.json');

  if (!fs.existsSync(pkgPath)) {
    console.warn(`Skipping ${svc} — no package.json found at ${pkgPath}`);
    continue;
  }

  console.log(`\n➡ Installing dependencies for ${svc}...`);
  const res = spawnSync('npm', ['install'], { cwd: svcPath, stdio: 'inherit', shell: true });
  if (res.status !== 0) {
    console.error(`npm install failed for ${svc} (exit code ${res.status}).`);
    process.exit(res.status || 1);
  }
}

console.log('\n✅ All service dependencies installed successfully.');
