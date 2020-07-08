import { User } from "../models/User";
import { PoolClient } from "pg";
import { connectionPool } from ".";
import { UserDTOtoUserConvertor } from "../utils/userConverter";
import { error } from "console";
import { NotFoundError } from "../errors/NotFoundError";
import { AuthenticationFailureError } from "../errors/AuthenticationFailedError";
import { UserNotFoundError } from "../errors/UserNotFoundError";

export async function getUserByUsernameAndPassword(
  username: string,
  password: string
): Promise<User> {
  let client: PoolClient;
  try {
    client = await connectionPool.connect();
    let results = await client.query(
      `select u.user_id, 
      u.username, 
      u."password" ,
      u.firstname,
      u.lastname, 
      u.email ,
      r.role_id , 
      r.role 
      from expense_reimbursement.users u left join expense_reimbursement.roles r on u.role = r.role_id 
      where u.username = $1 and u.password = $2;`,
      [username, password]
    );
    if (results.rowCount === 0) {
      throw new AuthenticationFailureError();
    }
    return UserDTOtoUserConvertor(results.rows[0]);
  } catch (error) {
    console.log(error);
    throw new AuthenticationFailureError();
  } finally {
    client && client.release();
  }
}

export async function getAllUsers(): Promise<User[]> {
  let client: PoolClient;
  try {
    client = await connectionPool.connect();
    let results = await client.query(
      `select * from expense_reimbursement.users`
    );
    return results.rows.map(UserDTOtoUserConvertor);
  } catch (e) {
    console.log("Error 3", e);
    throw new NotFoundError();
  } finally {
    client && client.release();
  }
}

export async function getUserById(userId: number): Promise<User> {
  let client: PoolClient;
  try {
    client = await connectionPool.connect();
    let results = await client.query(
      `select * from expense_reimbursement.users where user_id = $1`,
      [userId]
    );

    if (results.rowCount === 0) {
      console.log("error: 8", error);
    }
    return UserDTOtoUserConvertor(results.rows[0]);
  } catch (error) {
    if (error) throw new UserNotFoundError();
    console.log("Error 4", error);
    throw new Error("UnhandledError");
  } finally {
    client && client.release();
  }
}

export async function getUpdatedUser(updatedUser: User): Promise<User> {
  let client: PoolClient;
  try {
    console.log("lets try and update user");
    client = await connectionPool.connect();
    await client.query("BEGIN;");

    if (updatedUser.username) {
      await client.query(
        `update expense_reimbursement.users set "username" = $1 
                                  where "user_id" = $2;`,
        [updatedUser.username, updatedUser.userId]
      );
    }
    if (updatedUser.password) {
      await client.query(
        `update expense_reimbursement.users set "password" = $1 
                                  where "user_id" = $2;`,
        [updatedUser.password, updatedUser.userId]
      );
    }
    if (updatedUser.firstname) {
      await client.query(
        `update expense_reimbursemnt.users set "firstname" = $1 
                                  where "user_id" = $2;`,
        [updatedUser.firstname, updatedUser.userId]
      );
    }
    if (updatedUser.lastname) {
      await client.query(
        `update expense_reimbursement.users set "lastname" = $1 
                                  where "user_id" = $2;`,
        [updatedUser.lastname, updatedUser.userId]
      );
    }
    if (updatedUser.email) {
      await client.query(
        `update expense_reimbursement.users set "email" = $1 
                                  where "user_id" = $2;`,
        [updatedUser.email, updatedUser.userId]
      );
    }
    if (updatedUser.role) {
      let roleId = await client.query(
        `select r.roleId from expense_reimbursement.roles 
                                      where "role" = $1`,
        [updatedUser.role]
      );
      if (roleId.rowCount === 0) {
        throw new UserNotFoundError();
      }
      roleId = roleId.rows[0].role_id;
      await client.query(
        `update expense_reimbursement.users set "role" = $1 
                                  where "user_id" = $2;`,
        [roleId, updatedUser.userId]
      );
    }
    //save all changes
    await client.query("COMMIT;");
    return updatedUser;
  } catch (e) {
    client && client.query("ROLLBACK;");
    if (e.message === "Role Not Found") {
      throw new NotFoundError();
    }
    console.log(e);
    throw new Error("Unhandled Error");
  } finally {
    client && client.release();
  }
}
//Create New Users
export async function saveUser(newUser: User): Promise<User> {
  let client: PoolClient;
  try {
    client = await connectionPool.connect();
    await client.query("BEGIN;");
    let roleId = await client.query(
      `select r."role_id" 
                                      from expense_reimbursement.roles r 
                                      where r."role" = $1`,
      [newUser.role]
    );
    if (roleId.rowCount === 0) {
      throw new Error("Role Not Found");
    }
    roleId = roleId.rows[0].role_id;
    let results = await client.query(
      `insert into expense_reimbursement.users 
                                      ("username", "password", 
                                          "firstname", "lastname", 
                                          "email", "role")
                                      values($1,$2,$3,$4,$5,$6) 
                                      returning "user_id"`,
      [
        newUser.username,
        newUser.password,
        newUser.firstname,
        newUser.lastname,
        newUser.email,
        roleId,
      ]
    );
    newUser.userId = results.rows[0].user_id;
    await client.query("COMMIT;");
    return newUser;
  } catch (error) {
    client && client.query("ROLLBACK;");
    if (error.message === "Role Not Found") {
      throw new UserNotFoundError();
    }
    console.log("could not create a user");
    console.log(error);
    throw new Error("Unhandled Error Occured");
  } finally {
    client && client.release();
  }
}
