class Logger {

    getCurrentTimestamp() {
      const now = new Date();
      return now.toISOString();
    }
  
    log(level, message) {
      console.log(`[${this.getCurrentTimestamp()}] [${level}] ${message}`);
    }
  
    info(message) {
      this.log('INFO', message);
    }
    
    error(message) {
      this.log(`ERROR: ${this.getCurrentTimestamp()}`, message);
    }
  
  }
  
  module.exports = new Logger();
  