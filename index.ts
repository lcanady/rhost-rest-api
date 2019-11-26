import authRoute from "./src/routes/authRoute";
import auth from "./src/middleware/auth";
import statsRoute from "./src/routes/statsRoute";
import db from "./src/db/database";

const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.HTTP_PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/v1/auth/", authRoute);
app.use("/api/v1/stats/", auth, statsRoute);

// Start the server
(async () => {
  await db.start();
  app.listen(port, () => console.log("API Service running on port:", port));
})();
