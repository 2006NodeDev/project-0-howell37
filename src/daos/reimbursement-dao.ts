import { PoolClient } from "pg";
import { Reimbursement } from "../models/Reimbursement";
import { connectionPool } from ".";
import { ReimbursementDTOtoReimbursementConvertor } from "../utils/reimbursementConverter";
import { AuthError, NotFoundError, UnhandledError } from "../errors/authFailed";

export async function getReimbursementsByUser(
  userId: number
): Promise<Reimbursement[]> {
  let client: PoolClient;
  try {
    client = await connectionPool.connect();
    let results = await client.query(
      `select r.reimbursementId, 
                                              r.author, r.amount, 
                                              r.date_submitted,
                                              r.date_resolved,
                                              r.description, r.resolver,
                                              r.statusId,
                                               r.type
                                          from expense_reimbursement.reimbursements r 
                                          on r."author" = u."user_id"
                                                  where u."user_id" = $1
                                          order by r.date_submitted;`,
      [userId]
    );
    if (results.rowCount === 0) {
      throw new Error(NotFoundError());
    }
    return results.rows.map(ReimbursementDTOtoReimbursementConvertor);
  } catch (e) {
    if (e) {
      throw new Error(UnhandledError());
    }
    console.log(e);
    throw new Error(UnhandledError());
  } finally {
    client && client.release();
  }
}

export async function getReimbursementsByStatus(
  statusId: number
): Promise<Reimbursement[]> {
  let client: PoolClient;
  try {
    client = await connectionPool.connect();
    let results = await client.query(
      `select * from expense_reimbursement.reimbursements r where status = $1`,
      [statusId]
    );

    if (results.rowCount === 0) {
      throw new Error(AuthError());
    } else {
      return results.rows;
    }
  } catch (e) {
    throw new Error(AuthError());
  } finally {
    client.release();
    console.log("disconnected");
  }
}
