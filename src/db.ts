import sql from "mssql";

const conStr =
  "workstation id=foodmgmt.mssql.somee.com;packet size=4096;user id=corvinto_SQLLogin_1;pwd=wp1v32e881;data source=foodmgmt.mssql.somee.com;persist security info=False;initial catalog=foodmgmt;TrustServerCertificate=True";

export async function connectToDatabase() {
  try {
    const pool = await sql.connect(conStr);
    return pool;
  } catch (err) {
    console.error("Database connection failed:", err);
    throw err;
  }
}
