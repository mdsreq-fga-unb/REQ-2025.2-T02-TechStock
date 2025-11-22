// Shared utility: pick(obj, keys)
// Returns a new object with only the specified keys from the input object, if defined.
function pick(obj, keys) {
  const out = {};
  if (!obj || typeof obj !== 'object') return out;
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key] !== undefined) {
      out[key] = obj[key];
    }
  }
  return out;
}

module.exports = { pick };
