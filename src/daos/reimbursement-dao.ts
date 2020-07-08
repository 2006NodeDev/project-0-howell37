import { PoolClient } from "pg";
import { Reimbursement } from "../models/Reimbursement";
import { connectionPool } from ".";
import { ReimbursementDTOtoReimbursementConverter } from "../utils/reimbursementConverter";

import { NotFoundError } from "../errors/NotFoundError";
import { ReimbursementNotFoundError } from "../errors/ReimbursementNotFound";

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
      throw new Error("reimbursement not found");
    } else {
      return results.rows;
    }
  } catch (error) {
    if (error.message === "Reimbursement Not Found") {
      throw new ReimbursementNotFoundError();
    }
    console.log(error);
    throw new Error("Unhandled Error Occured");
  } finally {
    client && client.release();
    console.log("disconnected");
  }
}

export async function getReimbursementByUser(
  userId: number
): Promise<Reimbursement[]> {
  let client: PoolClient;
  try {
    client = await connectionPool.connect();
    let results = await client.query(
      `select r."reimbursementId", 
 r."author", r."amount", 
 r."dateSubmitted",
 r."dateResolved",
 r."description", r."resolver",
 rs."statusId", rs."status",
 rt."typeId", rt."type"
from expense_reimbursement.reimbursements r 
left join expense_reimbursement.reimbursementstatuses rs
 on r."status" = rs."statusId" 
left join expense_reimbursement.reimbursementtypes rt
 on r."type" = rt."typeId"
left join expense_reimbursement.users u 
 on r."author" = u."user_id"
     where u."user_id" = $1
order by r."dateSubmitted";`,
      [userId]
    );

    if (results.rowCount === 0) {
      throw new Error("Reimbursement Not Found");
    }
    return results.rows.map(ReimbursementDTOtoReimbursementConverter);
  } catch (e) {
    if (e.message === "Reimbursement Not Found") {
      throw new NotFoundError();
    }
    console.log(e);
    throw new Error("Unhandled Error Occured");
  } finally {
    client && client.release();
  }
}

//Submit Reimbursement
export async function submitReimbursement(
  newReim: Reimbursement
): Promise<Reimbursement> {
  let client: PoolClient;
  try {
    client = await connectionPool.connect();
    await client.query("BEGIN;");
    let typeId = await client.query(
      `select t."typeId" from expense_reimbursement.reimbursementtypes t 
                                          where t."type" = $1;`,
      [newReim.type]
    );
    if (typeId.rowCount === 0) {
      throw new Error("Type Not Found");
    }
    typeId = typeId.rows[0].typeId;

    let results = await client.query(
      `insert into expense_reimbursement.reimbursements ("author", "amount", 
                                      "dateSubmitted", "description", "status", "type")
                                          values($1,$2,$3,$4,$5,$6) 
                                      returning "reimbursementId";`,
      [
        newReim.author,
        newReim.amount,
        newReim.dateSubmitted,
        newReim.description,
        newReim.status.statusId,
        typeId,
      ]
    );
    newReim.reimbursementId = results.rows[0].reimbursementId;

    await client.query("COMMIT;");
    return newReim;
  } catch (e) {
    client && client.query("ROLLBACK;");
    if (e.message === "Type Not Found" || e.message === "Status Not Found") {
      throw new ReimbursementNotFoundError();
    }
    console.log(e);
    throw new Error("Unhandled Error Occured");
  } finally {
    client && client.release();
  }
}

//Update Reimbursements
export async function updateReimbursement(
  updatedReimbursement: Reimbursement
): Promise<Reimbursement> {
  let client: PoolClient;
  try {
    client = await connectionPool.connect();
    await client.query("BEGIN;");

    if (updatedReimbursement.author) {
      await client.query(
        `update expense_reimbursement.reimbursements set "author" = $1 
                              where "reimbursementId" = $2;`,
        [updatedReimbursement.author, updatedReimbursement.reimbursementId]
      );
    }
    if (updatedReimbursement.amount) {
      await client.query(
        `update expense_reimbursement.reimbursements set "amount" = $1 
                              where "reimbursementId" = $2;`,
        [updatedReimbursement.amount, updatedReimbursement.reimbursementId]
      );
    }
    if (updatedReimbursement.dateSubmitted) {
      await client.query(
        `update expense_reimbursement.reimbursements set "dateSubmitted" = $1 
                              where "reimbursementId" = $2;`,
        [
          updatedReimbursement.dateSubmitted,
          updatedReimbursement.reimbursementId,
        ]
      );
    }
    if (updatedReimbursement.dateResolved) {
      await client.query(
        `update expense_reimbursement.reimbursements set "date_resolved" = $1 
                              where "reimbursementId" = $2;`,
        [
          updatedReimbursement.dateResolved,
          updatedReimbursement.reimbursementId,
        ]
      );
    }
    if (updatedReimbursement.description) {
      await client.query(
        `update expense_reimbursement.reimbursements set "description" = $1 
                              where "reimbursementId" = $2;`,
        [updatedReimbursement.description, updatedReimbursement.reimbursementId]
      );
    }
    if (updatedReimbursement.resolver) {
      await client.query(
        `update expense_reimbursement.reimbursements set "resolver" = $1 
                              where "reimbursementId" = $2;`,
        [updatedReimbursement.resolver, updatedReimbursement.reimbursementId]
      );
    }
    if (updatedReimbursement.status) {
      let statusId = await client.query(
        `select rs."statusId" from expense_reimbursement.reimbursementstatuses rs 
                                          where rs."status" = $1;`,
        [updatedReimbursement.status]
      );
      if (statusId.rowCount === 0) {
        throw new Error("Status Not Found");
      }
      statusId = statusId.rows[0].statusId;
      await client.query(
        `update expense_reimbursement.reimbursements set "status" = $1 
                              where "reimbursementId" = $2;`,
        [statusId, updatedReimbursement.reimbursementId]
      );
    }
    if (updatedReimbursement.type) {
      let typeId = await client.query(
        `select rt."typeId" from expense_reimbursement.reimbursementtypes rt 
                                          where rt."type" = $1;`,
        [updatedReimbursement.type]
      );
      if (typeId.rowCount === 0) {
        throw new Error("Type Not Found");
      }
      typeId = typeId.rows[0].typeId;
      await client.query(
        `update expense_reimbursement.reimbursements set "type" = $1 
                              where "reimbursementId" = $2;`,
        [typeId, updatedReimbursement.reimbursementId]
      );
    }

    await client.query("COMMIT;");
    return updatedReimbursement;
  } catch (error) {
    client && client.query("ROLLBACK;");
    if (
      error.message == "Status Not Found" ||
      error.message == "Type Not Found"
    ) {
      throw new ReimbursementNotFoundError();
    }
    console.log(error);
    throw new Error("Unhandled Error");
  } finally {
    client && client.release();
  }
}
