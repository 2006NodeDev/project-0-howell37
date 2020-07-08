import express, { Request, Response, NextFunction } from "express";
import { authorizationMiddleware } from "../middleware/authorization-middleware";
import { authenticationMiddleware } from "../middleware/authentication-middleware";
import {
  getReimbursementsByStatus,
  updateReimbursement,
  submitReimbursement,
} from "../daos/reimbursement-dao";
import { Reimbursement } from "src/models/Reimbursement";
import { UserNotFoundError } from "../errors/UserNotFoundError";

export let reimbursementRouter = express.Router();

reimbursementRouter.get(
  "/status/:statusId",
  authenticationMiddleware,

  authorizationMiddleware(["financeManager"]),
  async (req, res, next) => {
    let statusId = parseInt(req.params.statusId);
    if (isNaN(statusId)) {
      res.status(400).send("please enter a number");
    } else {
      try {
        let allReimbursementsByStatus = await getReimbursementsByStatus(
          statusId
        );
        res.json(allReimbursementsByStatus);
      } catch (e) {
        next(e);
      }
    }
  }
);

reimbursementRouter.patch(
  "/",
  authenticationMiddleware,
  authorizationMiddleware(["financeManager"]),
  async (req: Request, res: Response, next: NextFunction) => {
    let {
      reimbursementId,
      author,
      amount,
      dateSubmitted,
      dateResolved,
      description,
      resolver,
      status,
      type,
    } = req.body;
    if (!reimbursementId) {
      console.log("update reimbursement");

      res
        .status(400)
        .send(
          "Reimbursement Updates Require ReimbursementId and at Least One Other Field"
        );
    } else if (isNaN(+reimbursementId)) {
      //check if reimbursementId is valid
      res.status(400).send("Id Needs to be a Number");
    } else {
      let updatedReim: Reimbursement = {
        reimbursementId,
        author,
        amount,
        dateSubmitted,
        dateResolved,
        description,
        resolver,
        status,
        type,
      };
      updatedReim.author = author || undefined;
      updatedReim.amount = amount || undefined;
      updatedReim.dateSubmitted = dateSubmitted || undefined;
      updatedReim.dateResolved = dateResolved || undefined;
      updatedReim.description = description || undefined;
      updatedReim.resolver = resolver || undefined;
      updatedReim.status = status || undefined;
      updatedReim.type = type || undefined;
      try {
        let results = await updateReimbursement(updatedReim);
        res.json(results);
      } catch (e) {
        next(e);
      }
    }
  }
);
reimbursementRouter.post(
  "/",
  authenticationMiddleware,
  authorizationMiddleware(["Admins", "financeManager", "Users"]),
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body);
    let { author, amount, dateSubmitted, description, type } = req.body;
    if (author && amount && dateSubmitted && description && type) {
      let newReim: Reimbursement = {
        reimbursementId: 0,
        author,
        amount,
        dateSubmitted,
        dateResolved: null,
        description,
        resolver: null,
        //status is automatically 1:"Pending"
        status: {
          status: "Pending",
          statusId: 1,
        },
        type,
      };
      newReim.type = type || null;
      try {
        let savedReim = await submitReimbursement(newReim);
        res.json(savedReim);
      } catch (e) {
        next(e);
      }
    } else {
      throw new UserNotFoundError();
    }
  }
);
