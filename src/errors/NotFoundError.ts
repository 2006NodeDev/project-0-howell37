import { HttpError } from "./HttpErrors";

export class NotFoundError extends HttpError {
  constructor() {
    super(404, " Not Found");
  }
}
