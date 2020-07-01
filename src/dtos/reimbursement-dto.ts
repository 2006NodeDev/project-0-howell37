export class reimbursementDTO {
  reimbursement_id: number;
  author: number;
  amount: number;
  date_submitted: bigint;
  date_resolved: bigint;
  description: string;
  resolver: number;
  status: number;
  type: number;
}
