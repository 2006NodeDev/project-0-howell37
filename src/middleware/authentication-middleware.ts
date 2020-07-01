import { Response, NextFunction } from "express";

export function authenticationMiddleware(
  req: any,
  res: Response,
  next: NextFunction
) {
  if (!req.session.user) {
    res.status(401).send("Please Login");
  } else {
    next();
  }
}
