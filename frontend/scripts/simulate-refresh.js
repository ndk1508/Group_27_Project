const axios = require('axios');

const BACKEND = process.env.BACKEND || 'http://localhost:3000';

async function run() {
  console.log('Backend base URL:', BACKEND);

  const testEmail = `sim_${Date.now()}@example.com`;
  const password = 'Password123!';
  const name = 'Sim Tester';

  // 1) Signup (ignore errors)
  try {
    const s = await axios.post(`${BACKEND}/api/auth/signup`, { name, email: testEmail, password });
    console.log('Signup response:', s.status);
  } catch (e) {
    console.log('Signup skipped/failed (may already exist):', e.response?.data || e.message);
  }

  // 2) Login
  console.log('Logging in...');
  const loginRes = await axios.post(`${BACKEND}/api/auth/login`, { email: testEmail, password });
  const data = loginRes.data || {};
  const accessToken = data.accessToken || data.token;
  const refreshToken = data.refreshToken;
  console.log('Login tokens received. accessToken present?', !!accessToken, 'refreshToken present?', !!refreshToken);

  // 3) Call protected endpoint with valid token
  try {
    const ok = await axios.get(`${BACKEND}/api/profile`, { headers: { Authorization: `Bearer ${accessToken}` } });
    console.log('Protected call with valid token succeeded. status:', ok.status);
  } catch (e) {
    console.error('Protected call with valid token failed:', e.response?.status, e.response?.data || e.message);
    return;
  }

  // 4) Simulate expired token: modify token (make invalid)
  const badToken = accessToken.slice(0, -5) + 'xxxxx';
  console.log('Calling protected endpoint with invalid token to trigger 401...');
  let got401 = false;
  try {
    await axios.get(`${BACKEND}/api/profile`, { headers: { Authorization: `Bearer ${badToken}` } });
    console.error('Unexpected success with invalid token');
  } catch (e) {
    const status = e.response?.status;
    console.log('Call with invalid token returned status:', status);
    if (status === 401) got401 = true;
  }

  if (!got401) {
    console.log('Could not reproduce 401 with invalid token; aborting refresh test.');
    return;
  }

  // 5) Call refresh endpoint with refreshToken
  if (!refreshToken) {
    console.error('No refreshToken returned by login; cannot test refresh flow.');
    return;
  }

  console.log('Calling refresh endpoint with refreshToken...');
  try {
    const r = await axios.post(`${BACKEND}/api/auth/refresh`, { refreshToken });
    const newAccess = r.data?.accessToken || r.data?.token;
    console.log('Refresh response status:', r.status, 'new access token present?', !!newAccess);

    if (!newAccess) {
      console.error('Refresh OK but no new access token returned. Response data:', r.data);
      return;
    }

    // 6) Retry protected endpoint with new access token
    const retry = await axios.get(`${BACKEND}/api/profile`, { headers: { Authorization: `Bearer ${newAccess}` } });
    console.log('Retry with refreshed token status:', retry.status, 'data sample:', JSON.stringify(retry.data).slice(0, 200));
  } catch (e) {
    console.error('Refresh failed:', e.response?.status, e.response?.data || e.message);
  }
}

run().catch(err => {
  console.error('Script error:', err.message || err);
  process.exit(1);
});
