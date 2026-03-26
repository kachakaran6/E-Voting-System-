/**
 * Wraps a promise in a timeout.
 * @param {Promise} promise - The promise to wrap
 * @param {number} ms - Timeout in milliseconds
 * @param {string} message - Error message on timeout
 */
async function sendWithTimeout(promise, ms = 7000, message = "Operation timed out") {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(message)), ms)
    ),
  ]);
}

module.exports = { sendWithTimeout };
