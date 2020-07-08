import { HttpError } from "./HttpErrors";

export class UserNotFoundError extends HttpError {
  constructor() {
    super(400, "User Not Found");
  }
}
