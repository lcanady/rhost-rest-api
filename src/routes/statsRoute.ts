import { Router, Request, Response } from "express";
import db from "../db/database";
import { get, set, unset } from "lodash";
import { decode } from "punycode";

const router = Router();

router.post("/:dbref/:statPath?", async (req: Request, res: Response) => {
  // @ts-ignore
  if (res.account.isImmortal) {
    // format the key from a dbref by snipping off the #.
    const key = parseInt(req.params.dbref)
      ? req.params.dbref
      : req.params.dbref.slice(1);

    let stats: Object;
    if (req.params.statPath) {
      stats = set({}, req.params.statPath, req.query.value);
    } else {
      try {
        stats = JSON.parse(req.body.stats);
      } catch (error) {
        return res.status(500).json({
          error: true,
          success: false,
          message: error.message
        });
      }
    }

    const record = {
      _key: key,
      ...stats
    };

    // Attempt to save a new record under the dbref.
    await db.stats.save(record).catch(async () => {
      // Failed.  Record probably exists.  Attempt to update instead.
      await db.stats.update(key, stats).catch((error: Error) =>
        res.status(500).json({
          error: true,
          success: false,
          message: error.message
        })
      );
    });

    res.status(200).json({
      error: false,
      success: true,
      message: `%chDone.%cn [cname(#${key})] stats set.`,
      value: await db.stats.firstExample({ _key: key })
    });
  } else {
    res.status(403);
    res.json({
      error: true,
      success: false,
      message: "Permission deined."
    });
  }
});

router.get("/:dbref/:statPath?", async (req: Request, res: Response) => {
  const key = parseInt(req.params.dbref)
    ? req.params.dbref
    : req.params.dbref.slice(1);

  // @ts-ignore
  if (res.account.isImmortal) {
    try {
      const stats = await db.stats.firstExample({ _key: key });
      const output = req.params.statPath
        ? get(stats, req.params.statPath)
        : stats;

      if (stats._key && output) {
        return res.status(200).json({
          error: false,
          success: true,
          dbref: "#" + req.params.dbref,
          message: "Stats found.",
          value: output
        });
      } else {
        return res.status(404).json({
          error: true,
          success: false,
          message: "Stats not found."
        });
      }
    } catch (error) {
      return res.status(500).json({
        error: true,
        success: false,
        message: error.message
      });
    }
  } else {
    return res.status(401).json({
      error: true,
      success: false,
      message: "Permission denied."
    });
  }
});

router.delete("/:dbref/:statPath", async (req: Request, res: Response) => {
  const key = parseInt(req.params.dbref)
    ? req.params.dbref
    : req.params.dbref.slice(1);

  // @ts-ignore
  if (res.account.isImmortal) {
    try {
      const stats = await db.stats.firstExample({ _key: key });
      unset(stats, req.params.statPath);

      // Remove the current stat and replace it with the new value.
      await db.stats.remove(key);
      db.stats.save(stats);

      return res.status(200).json({
        error: false,
        success: true,
        message: "Stat Deleted",
        value: await db.stats.firstExample({ _key: key })
      });
    } catch (error) {
      return res.status(500).json({
        error: true,
        success: false,
        message: error.message
      });
    }
  } else {
    return res.status(401).json({
      error: true,
      success: false,
      message: "Permission denied."
    });
  }
});

export default router;
