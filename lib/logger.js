const crypto = require('crypto');

class Logger {
  constructor() {
    this.uuid = crypto.randomUUID();
  }

  log(...args) {
    const now = new Date(Date.now());
    console.log(`[${now.toUTCString()}] [${this.uuid}]`, args.join(" "));
  }
}

module.exports = {
  Logger,
}