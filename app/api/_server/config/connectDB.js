import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

const isProduction = process.env.NODE_ENV === "production";

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host:    process.env.DB_HOST || "localhost",
    port:    parseInt(process.env.DB_PORT) || 3306,
    dialect: "mysql",
    logging: false,

    // Connection pool — sized for single-instance Node.js on shared hosting
    pool: {
      max:     isProduction ? 5 : 3,
      min:     0,
      acquire: 30000,
      idle:    10000,
    },

    dialectOptions: {
      connectTimeout: 10000,
    },

    define: {
      underscored: false,
      timestamps:  true,
    },
  }
);

// Shared across ALL Next.js API routes in the same Node.js process
const globalDbState = globalThis.__infixmartDbState || (globalThis.__infixmartDbState = {
  readyPromise: null,
  synced:       false,
});

const connectDB = async () => {
  // Create the promise once and share it — parallel requests all await the
  // same promise, preventing duplicate connection attempts (race condition fix)
  if (!globalDbState.readyPromise) {
    globalDbState.readyPromise = (async () => {
      try {
        await sequelize.authenticate();
        console.log("MySQL connected");

        if (!globalDbState.synced) {
          // Development: optionally auto-alter tables when models change.
          // Production:  NEVER auto-alter — schema changes must be done manually.
          const syncOptions =
            isProduction
              ? {}
              : process.env.DB_SYNC_ALTER === "true"
                ? { alter: true }
                : {};

          await sequelize.sync(syncOptions);
          globalDbState.synced = true;
          console.log("Database synced");
        }
      } catch (error) {
        // Reset so the next request retries instead of waiting forever
        globalDbState.readyPromise = null;
        console.error("MySQL connection error:", error.message);
        throw error;
      }
    })();
  }

  return globalDbState.readyPromise;
};

export { sequelize };
export default connectDB;
