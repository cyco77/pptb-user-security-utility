import { AssignmentSource } from "./assignment";

export type FieldSecurityProfile = {
  fieldsecurityprofileid: string;
  name: string;
  description?: string;
  ismanaged: boolean;
  sources: AssignmentSource[];
};
