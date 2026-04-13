import { callProcedure } from "../lib/db.js";
import { success, error, serverError } from "../lib/response.js";

export async function handler(event) {
  try {
    const studentId = event.pathParameters?.id;
    const body = JSON.parse(event.body || "{}");

    if (!studentId) {
      return error("Student ID is required");
    }

    const {
      first_name,
      last_name_father,
      last_name_mother,
      date_of_birth,
      gender,
      grade_id,
      status,
    } = body;

    if (!first_name || !last_name_father || !date_of_birth || !gender || !grade_id || !status) {
      return error("Missing required fields: first_name, last_name_father, date_of_birth, gender, grade_id, status");
    }

    const result = await callProcedure("sp_update_student", [
      studentId,
      first_name,
      last_name_father,
      last_name_mother || null,
      date_of_birth,
      gender,
      grade_id,
      status,
    ]);

    return success({ rows_affected: result[0].rows_affected });
  } catch (err) {
    if (err.sqlState === "45000") {
      return error(err.message);
    }
    console.error("update-student error:", err);
    return serverError();
  }
}
