const puppeteer = require('puppeteer');
const axios = require('axios');

const BACKEND = process.env.BACKEND || 'http://localhost:3000';
const FRONTENDS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
];

async function findFrontend() {
  for (const url of FRONTENDS) {
    try {
      const res = await axios.get(url + '/', { timeout: 2000, responseType: 'text' });
      const body = (res.data || '').toString();
      if (typeof body === 'string' && (body.includes('<div id="root"') || body.toLowerCase().includes('<!doctype html') || body.includes('react-scripts'))) {
        return url;
      }
    } catch (e) {
      // ignore
    }
  }
  throw new Error('Không kết nối được tới frontend dev server trên các cổng: ' + FRONTENDS.join(', '));
}

async function run() {
  console.log('Tìm frontend dev server...');
  const frontend = await findFrontend();
  console.log('Frontend trên', frontend);

  const testEmail = `e2e_${Date.now()}@example.com`;
  const password = 'Password123!';
  const name = 'E2E Tester';

  console.log('Tạo user thử nghiệm...', testEmail);
  try {
    await axios.post(`${BACKEND}/api/auth/signup`, { name, email: testEmail, password });
  } catch (e) {
    // ignore if already exists or server returns non-200
    console.log('Signup response:', e.response?.data || e.message);
  }

  console.log('Đăng nhập để nhận tokens...');
  const loginRes = await axios.post(`${BACKEND}/api/auth/login`, { email: testEmail, password });
  const data = loginRes.data || {};
  const accessToken = data.accessToken || data.token;
  const refreshToken = data.refreshToken;
  const user = data.user || { name, email: testEmail };

  if (!accessToken) {
    console.error('Không nhận được access token từ backend. Dữ liệu trả về:', data);
    process.exit(1);
  }

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Set localStorage with tokens and user, then navigate to dashboard
  await page.goto(frontend, { waitUntil: 'networkidle2' });
  await page.evaluate((t, rt, u) => {
    localStorage.setItem('token', t);
    if (rt) localStorage.setItem('refreshToken', rt);
    localStorage.setItem('user', JSON.stringify(u));
  }, accessToken, refreshToken, user);

  await page.goto(frontend + '/dashboard', { waitUntil: 'networkidle2' });

  // Remove access token to simulate expiry
  await page.evaluate(() => localStorage.removeItem('token'));

  // Click Test Refresh button
  console.log('Bấm Test Refresh...');
  try {
    await page.click('button:has-text("Test Refresh")');
  } catch (e) {
    // fallback: find by text via evaluate
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => /Test Refresh/i.test(b.innerText));
      if (btn) btn.click();
    });
  }

  // Wait for result element (look for "Test result:")
  try {
    await page.waitForFunction(() => {
      return Array.from(document.querySelectorAll('div')).some(d => /Test result:/i.test(d.innerText));
    }, { timeout: 5000 });
  } catch (e) {
    // ignore timeout
  }

  const result = await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('div')).find(d => /Test result:/i.test(d.innerText));
    return el ? el.innerText : document.body.innerText.slice(0, 400);
  });

  console.log('Kết quả test:', result);

  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
