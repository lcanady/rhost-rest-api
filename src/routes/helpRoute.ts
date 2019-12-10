import { Router, Response, NextFunction, Request } from "express";
import db from "../db/database";
const Joi = require("@hapi/joi");
import { Document } from "arangojs/lib/cjs/util/types";
const moment = require("moment");

export interface InterfaceHelp {
  topic: string;
  category: string;
  body: string;
  related?: string[];
  tags?: string[];
  createdBy: string;
  lastUpdate: Date;
  lastUpdateBy: string;
  parent?: string;
  children?: Document[];
}

const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  const records = await (await db.help.all()).all();
  res.status(200).json({
    error: false,
    success: true,
    message: "The following help categories are available.",
    value: records
  });
});

router.get(
  "/:category/:topic?/",
  async (req: Request, res: Response, next: NextFunction) => {
    const records = await (
      await db.query(`
        FOR doc IN help
        FILTER LOWER(doc.category) == "${req.params.category}"
        ${
          req.params.topic
            ? `LOWER(topic.name) == "` + req.params.topic + `"`
            : ""
        }
        RETURN doc
    `)
    ).all();

    if (records.length <= 0) {
      res.status(404).json({
        error: true,
        success: false,
        message: "No topics round."
      });
    } else {
      res.status(200).json({
        error: false,
        success: true,
        message: `Help topics found`,
        value: records
      });
    }
  }
);

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  if (res.account.isAdmin) {
    const date = moment;
    const record = await (
      await db.query(`
        FOR doc IN help
        FILTER LOWER(doc.topic) == "${req.body.topic.toLowerCase()}"
        RETURN doc
    `)
    ).all();

    if (record.length > 0) {
      return res.status(400).json({
        error: true,
        success: false,
        message: "Topic already exists.  Try /update instead."
      });
    }

    const Schema = Joi.object({
      category: Joi.string().default("general"),
      topic: Joi.string().required(),
      body: Joi.string().required(),
      related: Joi.string(),
      tags: Joi.array().default([]),
      createdBy: Joi.string().required(),
      lastUpdate: Joi.date().default(moment().unix()),
      lastUpdateBy: Joi.string().required(),
      parent: Joi.string().default(""),
      children: Joi.array().default([])
    });

    const value = await Schema.validateAsync(req.body).catch((error: Error) => {
      return res.status(400).json({
        error: true,
        success: false,
        message: error.message
      });
    });
    const key = (await db.help.save(value))._key;
    res.status(200).json({
      error: false,
      success: true,
      message: "Help document created",
      value: key
    });
  }
});

router.patch(
  "/update/:id/",
  async (req: Request, res: Response, next: NextFunction) => {
    const results = await db.help
      .update(req.params.id, req.body)
      .catch((error: Error) =>
        res.status(400).json({
          error: true,
          success: false,
          message: error.message
        })
      );

    if (results._key) {
      res.status(200).json({
        error: false,
        success: true,
        message: "Help file updated",
        value: results._key
      });
    }

    res.json();
  }
);

export default router;
