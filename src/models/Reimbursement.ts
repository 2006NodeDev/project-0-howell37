import { ReimbursementStatus } from "./ReimbursementStatus";
import { ReimbursementType } from "./ReimbursementType";

export class Reimbursement {
  reimbursementId: number;
  author: number;
  amount: number;
  dateSubmitted: bigint;
  dateResolved: bigint;
  description: string;
  resolver: number;
  status: ReimbursementStatus;
  type: ReimbursementType;
}
