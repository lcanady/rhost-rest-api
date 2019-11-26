import * as jwt from "jsonwebtoken";
import api from "../api/api";
import { Router, Request, Response, NextFunction } from "express";

const router = Router();

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  const results: any = await api
    .auth(req.body.user, req.body.password)
    .catch(error => {
      res.status(500);
      res.json({
        error: true,
        success: false,
        message: error.message
      });
    });

  if (!results.ok) {
    res.status(parseInt(results.status));
    res.json({
      error: true,
      message: results.message
    });
  } else {
    const data = JSON.parse(results.data);
    console.log(data);
    if (data.auth) {
      let token = jwt.sign({ data }, process.env.SECRET, {
        expiresIn: "24h"
      });

      res.json({
        error: false,
        success: true,
        message: "Authentication Successful!",
        token
      });
    } else {
      res.status(403);
      res.json({
        error: true,
        success: false,
        message: "Authentication failed."
      });
    }
  }
});

export default router;
