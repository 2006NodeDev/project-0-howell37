export class Reimbursement {
  reimbursementId: number;
  author: number;
  amount: number;
  dateSubmitted: bigint;
  dateResolved: bigint;
  description: string;
  resolver: number;
  status: number;
  type: number;
}
