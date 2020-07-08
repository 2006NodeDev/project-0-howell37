import { HttpError } from "./HttpErrors";

export class ReimbursementNotFoundError extends HttpError {
  constructor() {
    super(400, "Reimbursement Not Found");
  }
}
