import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: false,
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("MySQL connected");

    // In development: alter=true keeps schema in sync with models automatically.
    // In production: alter=false (default) — never auto-modify live tables.
    // Run migrations manually before deploying schema changes.
    const syncOptions = process.env.NODE_ENV === "production"
      ? {}
      : { alter: true };

    await sequelize.sync(syncOptions);
    console.log("Database synced");
  } catch (error) {
    console.error("MySQL connection error:", error);
    process.exit(1);
  }
};

export { sequelize };
export default connectDB;
