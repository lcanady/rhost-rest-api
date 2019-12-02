import * as net from "net";
const shortId = require("shortid");
const strip = require("strip-ansi");
import { Base64 } from "js-base64";
export const connect = ({ host, port, id, wSocket }) => {
  const socket = net.connect(port, host);
  // @ts-ignore
  socket.ws = wSocket;
  // @ts-ignore
  socket.id = shortId.generate();

  socket.on("data", buff => {
    const output = buff.filter(byte => byte !== 241 && byte !== 255);

    try {
      const data = JSON.parse(strip(output.toString()));
      // @ts-ignore
      data.id = socket.id;
      wSocket.send(JSON.stringify(data));
    } catch (error) {
      const msg = {
        type: "message",
        // @ts-ignore
        id: socket.id,
        payload: Base64.encode(output.toString())
      };
      wSocket.send(JSON.stringify(msg));
    }
  });

  socket.on("close", () => {
    const msg = {
      type: "message",
      // @ts-ignore
      id: socket.id,
      payload: "*** TCP Connection closed ***"
    };
    wSocket.send(JSON.stringify(msg));
    wSocket.close();
  });
  return socket;
};
