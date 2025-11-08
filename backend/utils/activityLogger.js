const ActivityLog = require('../models/ActivityLog');

/**
 * Log an activity. Non-blocking: errors are caught and logged to console.
 * @param {Object} options { userId, action, ip, meta }
 */
async function logActivity(options = {}) {
  try {
    const doc = new ActivityLog({
      userId: options.userId || undefined,
      action: options.action || 'unknown',
      ip: options.ip || (options.req && options.req.ip) || undefined,
      meta: options.meta || undefined,
    });
    await doc.save();
  } catch (err) {
    console.error('activityLogger.logActivity error:', err?.message || err);
  }
}

module.exports = { logActivity };
