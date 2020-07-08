import express, { Request, Response, NextFunction } from "express";
import { authorizationMiddleware } from "../middleware/authorization-middleware";
import { authenticationMiddleware } from "../middleware/authentication-middleware";
import { getReimbursementByUser } from "../daos/reimbursement-dao";

export let reimbursementAuthorRouter = express.Router();

reimbursementAuthorRouter.get(
  //must remove /author from /author/:userId to get the the substr of url
  "/:userId",
  authenticationMiddleware,
  authorizationMiddleware(["financeManager"]),
  async (req: Request, res: Response, next: NextFunction) => {
    let userId = parseInt(req.params.userId);
    console.log("get reimbursement by author");
    if (isNaN(userId)) {
      res.status(400).send("UserId Needs to be a Number");
    } else {
      try {
        let reimByUserId = await getReimbursementByUser(userId);
        res.json(reimByUserId);
      } catch (e) {
        next(e);
      }
    }
  }
);
