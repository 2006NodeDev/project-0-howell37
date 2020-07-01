import { Request, Response, NextFunction } from "express";
import { PoolClient } from "pg";
import { connectionPool } from "../daos/index";

export function authorizationMiddleware(roles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    let allowed = false;

    for (const role of roles) {
      if (req.session.user.role.role === role) {
        allowed = true;
        console.log(role);
        return next();
      }
    }
    if (!allowed) {
      res.send("not authorized");
    }
  };
}

export function authorizedUserMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    let currentUser = parseInt(req.session.user.userId);
    let userId = parseInt(req.params.userId);

    if (currentUser === userId) {
      let client: PoolClient;

      try {
        client = await connectionPool.connect();
        let results = await client.query(
          `select * from expense_reimbursement.users where user_id = $1`,
          [currentUser]
        );
        res.json(results.rows);
      } catch {
        res.send("current user");
      } finally {
        client && client.release();
      }
      return;
    }
  };
}
