import * as dotenv from "dotenv";
dotenv.config();
import express, { Request, Response, NextFunction } from "express";
import { sessionMiddleware } from "./middleware/sessions-middleware";
import { userRouter } from "./routers/userRouter";
import { reimbursementRouter } from "./routers/reimburementRouter";
import { getUserByUsernameAndPassword } from "./daos/user-dao";
import { UserNotFoundError } from "./errors/UserNotFoundError";
import { reimbursementAuthorRouter } from "./routers/reimbursementAuthorRouter";

const app = express(); //app represents entire empress application
app.use(express.json()); //convert request body to js object

app.use(sessionMiddleware);

app.use("/users", userRouter);
app.use("/reimbursements", reimbursementRouter);
app.use("/reimbursements/author", reimbursementAuthorRouter);

app.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  let username = req.body.username;
  let password = req.body.password;
  if (!username || !password) {
    throw new UserNotFoundError();
  } else {
    try {
      let user = await getUserByUsernameAndPassword(username, password);
      req.session.user = user;
      res.json(user);
    } catch (e) {
      next(e);
    }
  }
});

// app.use((err, req, res, next) => {
//   if (err.statusCode) res.status(err.statusCode).send(err.message);
//   res.status(500).send("Houston we have a PROBLEM");
// });

app.listen(3030, () => {
  console.log(`Server is running on 3030`);
});
