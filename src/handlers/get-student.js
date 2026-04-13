import { callProcedure } from "../lib/db.js";
import { withAuth } from "../lib/auth.js";
import { success, notFound, error, serverError } from "../lib/response.js";

async function getStudentHandler(event) {
  try {
    const studentId = event.pathParameters?.id;

    if (!studentId) {
      return error("Student ID is required");
    }

    const result = await callProcedure("sp_get_student", [studentId]);

    if (!result.length) {
      return notFound("Student not found");
    }

    return success(result[0]);
  } catch (err) {
    console.error("get-student error:", err);
    return serverError();
  }
}

// Both admin and teacher can view students
export const handler = withAuth(getStudentHandler);
