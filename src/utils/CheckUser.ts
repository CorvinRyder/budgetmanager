import { NextRequest } from "next/server";
import { connectToDatabase } from "@/db";
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";

/**
 * A functiont hat check the user ID by checking the x-user-id header
 *
 * The caller must be registered in the middleware to make it works
 * @param req
 * @param headers
 * @returns
 */
export default async function CheckUser(
  req?: NextRequest,
  headers?: ReadonlyHeaders
): Promise<string | undefined> {
  const reqHeaders = req?.headers || headers;

  if (typeof reqHeaders === "undefined") return;

  const userId = reqHeaders.get("x-user-id");

  if (!userId) return;

  const result = await (await connectToDatabase())
    .request()
    .input("userId", userId)
    .query(
      `SELECT count(1) cnt FROM bm_users WHERE userid = @userId AND status = 'T'`
    );

  return result.recordset[0]?.cnt > 0 ? userId : undefined;
}
