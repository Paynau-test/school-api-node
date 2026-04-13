import { callProcedure } from "../lib/db.js";
import { success, error, serverError } from "../lib/response.js";

export async function handler(event) {
  try {
    const studentId = event.pathParameters?.id;

    if (!studentId) {
      return error("Student ID is required");
    }

    const result = await callProcedure("sp_delete_student", [studentId]);

    return success({ rows_affected: result[0].rows_affected });
  } catch (err) {
    if (err.sqlState === "45000") {
      return error(err.message);
    }
    console.error("delete-student error:", err);
    return serverError();
  }
}
