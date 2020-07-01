import express, { Request, Response, NextFunction } from "express";
import { authorizationMiddleware } from "../middleware/authorization-middleware";
import { authenticationMiddleware } from "../middleware/authentication-middleware";
import {
  getReimbursementsByStatus,
  getReimbursementsByUser,
} from "../daos/reimbursement-dao";

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

reimbursementRouter.get(
  "/author/userId/:userId",
  authenticationMiddleware,
  authorizationMiddleware(["financeManager"]),
  async (req: Request, res: Response, next: NextFunction) => {
    let userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      res.send("Enter a number");
    } else {
      try {
        let reimbursement = await getReimbursementsByUser(userId);
        res.json(reimbursement);
      } catch (e) {
        next(e);
      }
    }
  }
);

// reimbursementRouter.patch(
//   "/",
//   authenticationMiddleware,
//   authorizationMiddleware(["financeManager"]),
//   async (req: Request, res: Response, next: NextFunction) => {
//     let {
//       reimbursementId,
//       author,
//       amount,
//       dateSubmitted,
//       dateResolved,
//       description,
//       resolver,
//       status,
//       type,
//     } = req.body;
//     if (reimbursementId) {
//       let newReimbursement: (string | number | undefined)[] = [
//         reimbursementId,
//         author,
//         amount,
//         dateSubmitted,
//         dateResolved,
//         description,
//         resolver,
//         status,
//         type,
//       ];
//       try {
//         let updatedReimbursement = await UpdateReimbursement(newReimbursement);
//         res.json(updatedReimbursement);
//       } catch (e) {
//         next(e);
//       }
//     } else {
//       res.status(400).send("invalid input");
//     }
//   }
// );
