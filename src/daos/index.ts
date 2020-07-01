import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

//build a connection pool to our database
export const connectionPool: Pool = new Pool({
  host: process.env.HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 5432, //DEFAULT PORT FOR POSTGRES
  max: 5,
});
