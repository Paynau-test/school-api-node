import { callProcedure } from "../lib/db.js";
import { success, error, serverError } from "../lib/response.js";

export async function handler(event) {
  try {
    const body = JSON.parse(event.body || "{}");

    const { first_name, last_name_father, last_name_mother, date_of_birth, gender, grade_id } = body;

    // Basic validation
    if (!first_name || !last_name_father || !date_of_birth || !gender || !grade_id) {
      return error("Missing required fields: first_name, last_name_father, date_of_birth, gender, grade_id");
    }

    const result = await callProcedure("sp_create_student", [
      first_name,
      last_name_father,
      last_name_mother || null,
      date_of_birth,
      gender,
      grade_id,
    ]);

    return success({ student_id: result[0].student_id }, 201);
  } catch (err) {
    // Catch SP validation errors (SQLSTATE 45000)
    if (err.sqlState === "45000") {
      return error(err.message);
    }
    console.error("create-student error:", err);
    return serverError();
  }
}
