import { Request, Response, NextFunction, request } from "express";
import e = require("express");

const jwt = require("jsonwebtoken");

export default (req: Request, res: Response, next: NextFunction) => {
  let token: any =
    req.headers["x-access-token"] || req.headers["authorization"];
  let bypass = req.headers["api-key"];

  if (token && token.startsWith("Bearer ")) {
    // remove 'Bearer ' from the token
    token = token.slice(7, token.length);
  }

  if (token) {
    jwt.verify(token, process.env.SECRET, (err: Error, decoded: string) => {
      if (err && bypass === process.env.API_KEY) {
        //@ts-ignore
        res.account = {
          name: "API",
          isImmortal: 1,
          isAdmin: 1
        };
        next();
      } else {
        res.status(401).json({
          error: true,
          success: false,
          message: "Permission deined."
        });
      }

      if (decoded) {
        // @ts-ignore
        res.account = decoded.data;
        next();
      }
    });
  } else {
    if (bypass === process.env.API_KEY) {
      //@ts-ignore
      res.account = {
        name: "API",
        isImmortal: 1,
        isAdmin: 1
      };
      next();
    } else {
      res.status(401).json({
        error: true,
        success: false,
        message: "Permission deined."
      });
    }
  }
};
