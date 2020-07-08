import { HttpError } from "./HttpErrors";

export class AuthorizationFailureError extends HttpError {
  constructor() {
    super(401, "The Incoming Token Has Expired");
  }
}
