class APPError {
  constructor(message, statusCode) {
    this.message = message;
    this.statusCode = statusCode;
    this.isOptional = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = APPError;
