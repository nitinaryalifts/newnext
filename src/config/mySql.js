import mysql from "mysql2/promise";

// Create a connection pool
export const pool = mysql.createPool({
  host: "sponsor-book-site-db-do-user-4374572-0.m.db.ondigitalocean.com",
  //   ssl: true,
  user: "doadmin",
  password: "AVNS_dnCgoS9ia2PQDZjqTJo",
  database: "defaultdb",
  port: "25060",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
