const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('../config/db');
const { logActivity } = require('../utils/activityLogger');
const ActivityLog = require('../models/ActivityLog');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function run() {
  try {
    await connectDB();
    console.log('Running activity log test...');

    // insert a few logs
    await logActivity({ action: 'test:login_attempt', meta: { success: false, reason: 'wrong-password' }, ip: '127.0.0.1' });
    await logActivity({ action: 'test:login_attempt', meta: { success: false, reason: 'wrong-password' }, ip: '127.0.0.1' });
    await logActivity({ action: 'test:login_attempt', meta: { success: true }, ip: '127.0.0.1' });

    // give mongoose a moment
    await new Promise((r) => setTimeout(r, 500));

    // query recent logs
    const recent = await ActivityLog.find({ action: /test:login_attempt/ }).sort({ createdAt: -1 }).limit(10).lean();
    console.log('Recent test logs (up to 10):');
    recent.forEach((doc) => {
      console.log(`- ${doc._id} | ${doc.action} | ${doc.ip} | ${JSON.stringify(doc.meta)} | ${doc.createdAt}`);
    });

    console.log('\nActivity log test finished.');
    process.exit(0);
  } catch (err) {
    console.error('Activity test error:', err);
    process.exit(1);
  }
}

run();
