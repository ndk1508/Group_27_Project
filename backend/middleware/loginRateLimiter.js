// Simple in-memory rate limiter for login attempts
// Not distributed; suitable for dev or single-server setups.
const attempts = new Map(); // key -> { count, firstTs, blockedUntil }

function cleanupOld(key, windowMs) {
  const entry = attempts.get(key);
  if (!entry) return false;
  if (entry.blockedUntil && entry.blockedUntil > Date.now()) return true;
  if (Date.now() - entry.firstTs > windowMs) {
    attempts.delete(key);
    return false;
  }
  return false;
}

module.exports = function loginRateLimiter(options = {}) {
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes
  const maxAttempts = options.max || 5;
  const blockMs = options.blockMs || 15 * 60 * 1000; // 15 minutes

  return (req, res, next) => {
    try {
      const identifier = (req.ip || req.headers['x-forwarded-for'] || 'unknown') + '|' + (req.body?.email || 'noemail');
      const now = Date.now();
      let entry = attempts.get(identifier);
      if (entry) {
        // if blocked
        if (entry.blockedUntil && entry.blockedUntil > now) {
          const retryAfter = Math.ceil((entry.blockedUntil - now) / 1000);
          res.set('Retry-After', String(retryAfter));
          return res.status(429).json({ message: `Too many login attempts. Try again in ${retryAfter} seconds.` });
        }
        // window expired?
        if (now - entry.firstTs > windowMs) {
          // reset
          entry = { count: 1, firstTs: now };
          attempts.set(identifier, entry);
          return next();
        }
        entry.count++;
        if (entry.count > maxAttempts) {
          entry.blockedUntil = now + blockMs;
          attempts.set(identifier, entry);
          const retryAfter = Math.ceil(blockMs / 1000);
          res.set('Retry-After', String(retryAfter));
          return res.status(429).json({ message: `Too many login attempts. Temporarily blocked for ${Math.ceil(blockMs/60000)} minutes.` });
        }
        attempts.set(identifier, entry);
      } else {
        attempts.set(identifier, { count: 1, firstTs: now });
      }
      next();
    } catch (err) {
      console.error('loginRateLimiter error:', err);
      // fail open
      next();
    }
  };
};
