import { callProcedure } from "../lib/db.js";
import { success, error, serverError } from "../lib/response.js";

export async function handler(event) {
  try {
    const params = event.queryStringParameters || {};

    const term = params.term || null;
    const status = params.status || null;
    const limit = parseInt(params.limit || "20");
    const offset = parseInt(params.offset || "0");

    const result = await callProcedure("sp_search_students", [
      term,
      status,
      limit,
      offset,
    ]);

    return success(result);
  } catch (err) {
    console.error("search-students error:", err);
    return serverError();
  }
}
