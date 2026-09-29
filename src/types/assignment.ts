export type AssignmentSource =
  | { type: "direct" }
  | { type: "team"; teamId: string; teamName: string };
