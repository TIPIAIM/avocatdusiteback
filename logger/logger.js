// utils/logger.js
const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  level: 'info', // 'info' en prod, 'debug' en dev
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message, ...meta }) => {
      let str = `[${timestamp}] ${level.toUpperCase()} : ${message}`;
      if (Object.keys(meta).length) str += ` | ${JSON.stringify(meta)}`;
      return str;
    })
  ),
  transports: [
    new transports.File({ filename: 'logs/errors.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
  ],
});

// En dev, affiche aussi dans la console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({ format: format.simple() }));
}

module.exports = logger;
