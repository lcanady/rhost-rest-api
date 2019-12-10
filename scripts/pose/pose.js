#!/usr/bin/env node

const message = process.env.MUSHN_MESSAGE;
let buff = Buffer.from(message);
let txt = buff.toString("Base64");
const msg = {
  enactor: process.env.MUSH_CAUSE,
  id: "",
  avatar: process.env.MUSHN_AVATAR,
  type: "pose",
  cmd: process.env.MUSHN_TYPE,
  payload: txt
};

process.stdout.write(JSON.stringify(msg));
