import authRoute from "./src/routes/authRoute";
import auth from "./src/middleware/auth";
import statsRoute from "./src/routes/statsRoute";
import db from "./src/db/database";
import { connect } from "./src/bridge/bridge";
import { Server } from "ws";

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
  // Websocket Setup
  const wss = new Server({ port: 4040 }, () =>
    console.log("Websocket service running!")
  );
  wss.on("connection", ws => {
    const tSocket = connect({
      host: "localhost",
      port: 4202,
      id: "1234",
      wSocket: ws
    });

    ws.on("message", data => tSocket.write(data.toString() + "\r\n"));
    ws.on("close", () => tSocket.end());
  });
})();
