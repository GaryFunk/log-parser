let https = require("https");
let { Store } = require("fs-json-store");
let db = new Store( { file: "../db.json" } );

let helpers = {
  handleHttpData: (data, data_array) => {
    data_array.push(data);
  },

  handleHttpEnd: (data_array, data_length) => {
    let buf = Buffer.alloc(data_length);

    for (let i = 0, len = data_array.length, pos = 0; i < len; i++) {
      data_array[i].copy(buf, pos);
      pos += data_array[i].length;
    }

    let json = JSON.parse(buf.toString());
    return json;
  },

  getAccessToken: () => {
    let access_token = db.read().then(data => {
      return data.access_token;
    });

    return access_token;
  },

  getRespHeaderValue: (url, header) => {
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        resolve(res.headers[header]);

        res.on("error", (e) => {
          console.log(e);
          reject(e);
        })
      })
    })
  }
};

module.exports = helpers;