import express, { Request, Response, NextFunction } from "express";
import { authorizationMiddleware } from "../middleware/authorization-middleware";
import { authenticationMiddleware } from "../middleware/authentication-middleware";
import {
  getAllUsers,
  getUserById,
  getUpdatedUser,
  saveUser,
} from "../daos/user-dao";
import { UserNotFoundError } from "../errors/UserNotFoundError";
import { User } from "src/models/User";

export let userRouter = express.Router();

userRouter.get(
  "/",
  authenticationMiddleware,
  authorizationMiddleware(["financeManager"]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let allUsers = await getAllUsers();
      res.json(allUsers);
    } catch (e) {
      next(e);
    }
  }
);

userRouter.get(
  "/:userId",
  authenticationMiddleware,
  authorizationMiddleware(["financeManager"]),
  async (req, res, next) => {
    let userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      res.status(400).send("please enter a number");
    } else {
      try {
        console.log("User id: ", userId);
        let findUser = await getUserById(userId);
        res.json(findUser);
      } catch (err) {
        next(err);
      }
    }
  }
);

userRouter.patch(
  "/",
  authenticationMiddleware,
  authorizationMiddleware(["financeManager", "Admins"]),
  async (req: Request, res: Response, next: NextFunction) => {
    let {
      userId,
      username,
      password,
      firstname,
      lastname,
      email,
      role,
    } = req.body;
    if (!userId) {
      res.send("UserId is the minimum requirements to update");
    } else {
      let updatedUser: User = {
        userId,
        username,
        password,
        firstname,
        lastname,
        email,
        role,
      };
      console.log("updated:", updatedUser);
      updatedUser.username = username || undefined;
      updatedUser.password = password || undefined;
      updatedUser.firstname = firstname || undefined;
      updatedUser.lastname = lastname || undefined;
      updatedUser.email = email || undefined;
      updatedUser.role = role || undefined;

      try {
        let editUser = await getUpdatedUser(updatedUser);
        res.json(editUser);
      } catch (e) {
        next(e);
      }
    }
  }
);

// creating a new user to the database
userRouter.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body);
    let { username, password, firstname, lastname, email, role } = req.body;
    if (username && password && firstname && lastname && email && role) {
      let newUser: User = {
        userId: 0,
        username,
        password,
        firstname,
        lastname,
        email,
        role,
      };
      try {
        let savedUser = await saveUser(newUser);
        res.json(savedUser);
      } catch (e) {
        next(e);
      }
    } else {
      next(new UserNotFoundError());
    }
  }
);
