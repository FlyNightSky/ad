// services/ad.ERRSYS.js
function logError(error) {
  console.error("Error:", error);

  // You can add additional error handling logic here, such as sending alerts or saving error details to a file or database.

  // In a production environment, consider using a logging library like Winston to log errors in a structured manner.
}

module.exports = {
  logError,
};
