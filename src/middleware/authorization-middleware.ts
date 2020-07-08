import { Request, Response, NextFunction } from "express";

export function authorizationMiddleware(roles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    let allowed = false;
    let currentId = req.path.substr(1);
    let currentUser = req.session.user.userId == currentId;
    for (const role of roles) {
      if (req.session.user.role.role === role) {
        allowed = true;
        console.log(role);
        next();
      } else if (currentUser) {
        console.log(currentUser);
        allowed = true;
        next();
      }
    }
    if (!allowed) {
      res.send("not authorized");
    }
  };
}
