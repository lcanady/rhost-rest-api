import { config } from "dotenv";
import { exec } from "child_process";
import cache, { CurlCache } from "./cache";

// load the .env file
config();

export interface curlOptions {
  method?: string;
  time?: string;
  parse?: string;
  encode?: string;
}

export interface curlResponse {
  status: string;
  ok: boolean;
  message: string;
  data: string;
}

export class API {
  private user: string;
  private password: string;
  private port: number;
  private address: string;
  private url: string;
  private cache: CurlCache;

  constructor() {
    this.cache = cache;
    this.user = process.env.API_DBREF || "";
    this.password = process.env.API_PASSWORD || "";
    this.port = parseInt(process.env.API_PORT || "2222");
    this.address = process.env.API_ADDRESS || "127.0.0.1";
    this.url = `http://${this.address}:${this.port}`;
  }

  /**
   * Make an http call to the fetch api.
   * @param options The settings passed to the fetch call.
   * @param options.time (POST) The time to queue the action before
   * it's handled.
   * @param options.method
   */
  private async _curl(
    command: string,
    options?: curlOptions
  ): Promise<curlResponse> {
    const { time, parse, encode, method = "GET" } = options || {};
    const curlString = `curl -X ${method} --user "${this.user}:${
      this.password
    }" -H "Exec: ${command}" ${encode ? "Encode: " + encode : ""} ${
      time ? "Time: " + time : ""
    } ${parse ? "Parse: " + parse : ""} --head ${this.url}`;

    if (this.cache.has(curlString)) {
      return this.cache.get(curlString);
    } else {
      return new Promise((resolve, reject) => {
        exec(curlString, (error, stdout) => {
          if (error) reject(error);

          const RegexStatus = stdout.match(/HTTP\/1.1\s(\d+)/);
          const RegexExec = stdout.match(/Exec:\s(.*)/);
          const RegexReturn = stdout.match(/Return:\s(.*)/);

          resolve({
            status: RegexStatus ? RegexStatus[1] : "",
            ok: RegexStatus[1] === "200" ? true : false,
            message: RegexExec[1],
            data: RegexReturn ? RegexReturn[1] : ""
          });

          this.cache.set(curlString, {
            ttl: 10000,
            payload: {
              status: RegexStatus ? RegexStatus[1] : "",
              ok: RegexStatus[1] === "200" ? true : false,
              message: RegexExec[1],
              data: RegexReturn ? RegexReturn[1] : ""
            }
          });
        });
      });
    }
  }

  /**
   * make a get request from the Rhost HTTP API
   * @param command The command to be passed to the server.
   */
  async get(command: string): Promise<curlResponse> {
    const results = await this._curl(command);

    if (!results.ok) throw new Error(results.message);
    return results;
  }

  /**
   * make a get request from the Rhost HTTP API
   * @param command The command to be passed to the server.
   */
  async post(command: string): Promise<curlResponse> {
    const results = await this._curl(command, { method: "POST" });

    if (!results.ok) throw new Error(results.message);
    return results;
  }

  /**
   * Authorize a user and get some basic information about their
   * account.
   * @param user The user to authorize
   * @param password The user's password
   */
  async auth(user: string, password: string): Promise<curlResponse> {
    return await this.get(
      `[u(${process.env.API_DBREF}/fn.auth,${user},${password})]`
    );
  }
}

export default new API();
