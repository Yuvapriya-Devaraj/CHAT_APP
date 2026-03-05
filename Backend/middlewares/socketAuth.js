const jwt = require("jsonwebtoken");

module.exports = (socket, next) => {
  const token = socket.handshake.auth.token;

  console.log("Socket token:", token); // DEBUG

  if (!token) {
    return next(new Error("Authentication error: No token"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    socket.user = decoded; // attach user info
    next();
  } catch (err) {
    return next(new Error("Authentication error: Invalid token"));
  }
};
