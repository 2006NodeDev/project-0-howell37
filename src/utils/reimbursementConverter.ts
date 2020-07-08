import { reimbursementDTO } from "../dtos/reimbursement-dto";
import { Reimbursement } from "../models/Reimbursement";

export function ReimbursementDTOtoReimbursementConverter(
  rdto: reimbursementDTO
): Reimbursement {
  return {
    reimbursementId: rdto.reimbursement_id,
    author: rdto.author,
    amount: rdto.amount,
    dateSubmitted: rdto.date_submitted,
    dateResolved: rdto.date_resolved,
    description: rdto.description,
    resolver: rdto.resolver,
    status: {
      status: rdto.status,
      statusId: rdto.status_id,
    },
    type: {
      type: rdto.type,
      typeId: rdto.type_id,
    },
  };
}
