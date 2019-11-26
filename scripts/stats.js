#!/usr/bin/env node

const { exec } = require("child_process");

// Gather our variables.
// You'll probably want to change these to match your setup.
const address = "http://localhost:3000";
const apiKey = "xxxxxxxxx";

// This ugly line gets rid of everything after the first '?', then breaks the
// rest of it up into segments based on '/'.
const path = process.argv[2].split("?")[0].split("/") || "";
let params = process.argv[2].split("?")[1];
params = params.split("&");

const paramMap = new Map();
// We don't need anything before the first '?' for params.
params.forEach(param => {
  const parts = param.split("=");
  paramMap.set(parts[0].toLowerCase(), parts[1]);
});

// Remove thet hash from the start of the dbref.
const key = parseInt(path[0]) ? path[0] : path[0].slice(1);

// Actions.
let curlString;
if (paramMap.has("value") && paramMap.get("value")) {
  // The value should be set in the statpath location. More Post request.
  if (!path[0]) return process.stdout.write("#-1 dbref required.");
  if (!path[1]) return process.stdout.write("#-2 Statpath required.");
  curlString = `curl  -X POST -H "api-key: ${apiKey}"  ${address}/api/v1/stats/${key}/${
    path[1]
  }?value=${paramMap.get("value")}`;
} else if (paramMap.has("value") && !paramMap.get("value")) {
  curlString = `curl  -X DELETE -H "api-key: ${apiKey}"  ${address}/api/v1/stats/${key}/${path[1]}`;
} else {
  // Probably just a get request.  Make sure dbref is at least defined before sending off the request.
  if (!key) return process.stdout.write("#-1 dbref required.");
  curlString = `curl  -X GET -H "api-key: ${apiKey}"  ${address}/api/v1/stats/${key}${
    path[1] ? "/" + path[1] : ""
  }`;
}

// Launch the curl command!
exec(curlString, (err, stdout) => {
  if (err) return process.stdout.write("#-4 Connection error.");

  try {
    const output = JSON.parse(stdout);
    if (output.error) return process.stdout.write(`#-3 ${output.message}`);

    if (!output.value) {
      process.stdout.write("0");
    } else {
      process.stdout.write(
        typeof output.value === "object"
          ? JSON.stringify(output.value, {}, 2)
          : output.value || "0"
      );
    }
  } catch (error) {
    process.stdout.write(stdout);
  }
});
