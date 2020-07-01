import session, { SessionOptions } from "express-session";

const sessionConfig: SessionOptions = {
  secret: "secret",
  cookie: {
    secure: false,
  },
  resave: false,
  saveUninitialized: false,
};
//unique seesion object for each unique connection to the server
export const sessionMiddleware = session(sessionConfig);
