import { HttpError } from "./HttpErrors";

export class AuthenticationFailureError extends HttpError {
  constructor() {
    super(400, "Invalid Credentials");
  }
}
