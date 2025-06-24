
const axios = require('axios');

class RenderKeepAlive {
  constructor() {
    this.isRender = process.env.RENDER || process.env.RENDER_SERVICE_ID;
    this.url = process.env.RENDER_EXTERNAL_URL;
    this.interval = null;
  }

  start() {
    if (!this.isRender) return;

    console.log('🚀 Starting Render Keep-Alive system...');

    // Self-ping every 14 minutes to prevent sleeping
    this.interval = setInterval(async () => {
      try {
        if (this.url) {
          await axios.get(`${this.url}/health`, { timeout: 10000 });
          console.log(`💚 Render Keep-Alive ping successful: ${new Date().toISOString()}`);
        }
      } catch (error) {
        console.log(`💛 Render Keep-Alive ping failed (normal): ${error.message}`);
      }
    }, 14 * 60 * 1000); // 14 minutes

    // Memory cleanup every 30 minutes
    setInterval(() => {
      if (global.gc && typeof global.gc === 'function') {
        global.gc();
        console.log('🧹 Render memory cleanup completed');
      }
    }, 30 * 60 * 1000); // 30 minutes

    console.log('✅ Render Keep-Alive system started');
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      console.log('⏹️ Render Keep-Alive system stopped');
    }
  }
}

module.exports = new RenderKeepAlive();
