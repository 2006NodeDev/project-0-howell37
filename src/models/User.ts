import { Role } from "./Role";

export class User {
  userId: number;
  username: string;
  password: string;
  firstname: string;
  lastname: string;
  email: string;
  role: Role;
}
