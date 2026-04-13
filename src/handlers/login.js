import bcrypt from "bcryptjs";
import { callProcedure } from "../lib/db.js";
import { signToken } from "../lib/auth.js";
import { success, error, serverError } from "../lib/response.js";

export async function handler(event) {
  try {
    const body = JSON.parse(event.body || "{}");
    const { email, password } = body;

    if (!email || !password) {
      return error("Missing required fields: email, password");
    }

    // sp_get_user_by_email returns: id, email, password_hash, role, is_active
    const rows = await callProcedure("sp_get_user_by_email", [email]);

    if (!rows.length) {
      return error("Invalid email or password", 401);
    }

    const user = rows[0];

    if (!user.is_active) {
      return error("Account is disabled, contact your administrator", 403);
    }

    // Verify password against bcrypt hash
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return error("Invalid email or password", 401);
    }

    // Sign JWT with user info (SP returns "id", not "user_id")
    const token = signToken({
      user_id: user.id,
      email: user.email,
      role: user.role,
    });

    return success({
      token,
      user: {
        user_id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("login error:", err);
    return serverError();
  }
}
