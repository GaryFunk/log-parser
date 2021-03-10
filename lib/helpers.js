const fetch = require("node-fetch");
const fs = require("fs");
const { Logger } = require("./logger");

// methods : to help avoid typos and use the compiler for autocomplete
const methods = {
  GET: "GET",
  PUT: "PUT",
  POST: "POST",
  DELETE: "DELETE",
}

// ensure() : ensures that a is an instance of b or an array of b's
function ensure(a, b) {
  if (!(a instanceof b)) {
    throw new TypeError(`expected ${b.name}, received ${a.constructor.name}`);
  }

  if (Array.isArray(a)) {
    const notok = a.filter(aa => !(aa instanceof b))
    if (notok) {
      throw new TypeError(`expected array of ${b.name}, received ${a.toString()}`);
    }
  }
}

// api() : simple fetch wrapper to call any API
async function api(method, base, endpoint, body) {
  const logger = new Logger();
  logger.log("request:", method, `${base}${endpoint}`);

  return await fetch(`${base}${endpoint}`, {
    method: method,
    headers: {
      'Authorization': `Basic ${get_api_token()}`,
      'Content-Type': 'application/json',
    },
    ...(method !== "GET" && { body: JSON.stringify(body) }),
  })
  .then(async function(req_response) {
    logger.log("status:", req_response.status);
    return req_response.json()
  })
  .then(function(json) {
    return json;
  })
  .catch(function(error) {
    logger.log("error:", error);
    return error;
  })
}

// __api() : headers + rtype api() call
async function __api(method, headers, base, endpoint, body, rtype) {
  const logger = new Logger();
  logger.log("request:", method, `${base}${endpoint}`);

  return await fetch(`${base}${endpoint}`, {
    method: method,
    headers: {
      'Authorization': `Basic ${get_api_token()}`,
      ...headers,
    },
    body,
  })
  .then(async function(req_response) {
    logger.log("status:", req_response.status);
    return req_response[rtype]()
  })
  .then(function(json) {
    return json;
  })
  .catch(function(error) {
    logger.log("error:", error);
    return error;
  })
}

// envars() : loads envvars into memory
function envars(path) {
  const content = fs.readFileSync(path);
  const string = content.toString();
  const variables = string.split("\n");
  variables.forEach(variable => {
    const [key, val] = variable.split("=");
    if (/\$\{[A-Z_]+\}/g.test(val)) {
      process.env[key] = eval("\`${val}\`");
    } else {
      process.env[key] = val;
    }
  });
}

// get_api_token() : return the base64 encoded api-token for Zendesk requests
function get_api_token() {
  return Buffer.from(`${process.env.ZENDESK_API_EMAIL}/token:${process.env.ZENDESK_API_TOKEN}`)
          .toString('base64');
}

module.exports = {
  envars,
  ensure,
  api,
  __api,
  methods,
};