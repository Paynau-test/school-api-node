import jwt from "jsonwebtoken";
import { error } from "./response.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";

/**
 * Sign a JWT token with user payload.
 * @param {Object} payload - { user_id, email, role }
 * @returns {string} Signed JWT
 */
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify and decode a JWT token.
 * @param {string} token
 * @returns {Object} Decoded payload
 * @throws {Error} If token is invalid or expired
 */
export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/**
 * Extract the Bearer token from the Authorization header.
 * @param {Object} event - API Gateway event
 * @returns {string|null} Token or null
 */
function extractToken(event) {
  const header = event.headers?.Authorization || event.headers?.authorization;
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
}

/**
 * Auth middleware for Lambda handlers.
 * Wraps a handler and injects event.auth with the decoded user.
 *
 * @param {Function} handler - The actual Lambda handler
 * @param {Object} [options]
 * @param {string[]} [options.roles] - Allowed roles (e.g. ["admin", "teacher"])
 * @returns {Function} Wrapped Lambda handler
 */
export function withAuth(handler, options = {}) {
  return async (event, context) => {
    const token = extractToken(event);

    if (!token) {
      return error("Missing or invalid Authorization header. Use: Bearer <token>", 401);
    }

    try {
      const decoded = verifyToken(token);
      event.auth = decoded;
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return error("Token expired, please login again", 401);
      }
      return error("Invalid token", 401);
    }

    // Role check
    if (options.roles && options.roles.length > 0) {
      if (!options.roles.includes(event.auth.role)) {
        return error(`Access denied. Required role: ${options.roles.join(" or ")}`, 403);
      }
    }

    return handler(event, context);
  };
}
