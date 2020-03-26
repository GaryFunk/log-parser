let { Store } = require("fs-json-store");
let db = new Store( { file: "../db.json" } );

let https = require("https");
let helpers = require("./helpers.js");

class Zendesk {
  constructor(subdomain) {
    this.subdomain = subdomain;
  }

  requestAccessToken(code) {
    let url_options = {
      method: "POST",
      host: this.subdomain + ".zendesk.com",
      path: "/oauth/tokens",
      headers: {
        "Content-Type": "application/json"
      },
    }

    let body = {
      grant_type: "authorization_code",
      code: code,
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      redirect_uri: process.env.REDIRECT_URI,
      scope: "read write"
    }

    let data_array = [];
    let data_length = 0;

    return new Promise((resolve, reject) => {
      let req = https.request(url_options, (res) => {
        res.on("data", (d) => {
          helpers.handleHttpData(d, data_array);
          data_length += d.length;
        })
        .on("end", async () => {
          let response = helpers.handleHttpEnd(data_array, data_length);
          await db.write({ access_token: response.access_token });
          resolve()
        })
        .on("error", (e) => {
          reject(e);
        })
      });

      req.write(JSON.stringify(body));
      req.end();
    })
  }

  async queryZendesk(q) {
    let tok = await helpers.getAccessToken();
    let query = "?query=" + encodeURIComponent(q);

    let url_options = {
      host: this.subdomain + ".zendesk.com",
      path: "/api/v2/search.json" + query,
      headers: {
        "Authorization" : "Bearer" + " " + tok
      }
    }

    let data_array = [];
    let data_length = 0;

    return new Promise((resolve, reject) => {
      https.get(url_options, (res) => {
        res.on("data", (d) => {
          helpers.handleHttpData(d, data_array);
          data_length += d.length;
        })
        .on("end", () => {
          let query_results = helpers.handleHttpEnd(data_array, data_length);
          resolve(query_results.results);
        })
        .on("error", (e) => {
          reject(e);
        });
      });
    });
  }
}

module.exports = Zendesk;