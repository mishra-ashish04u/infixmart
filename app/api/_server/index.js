import dotenv from "dotenv";
dotenv.config({ quiet: true });

import app, { initializeServer } from "./app.js";

initializeServer()
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Server startup failed:", error);
    process.exit(1);
  });
