export class reimbursementDTO {
  reimbursement_id: number;
  author: number;
  amount: number;
  date_submitted: bigint;
  date_resolved: bigint;
  description: string;
  resolver: number;
  status: string;
  status_id: number;
  type: string;
  type_id: number;
}
