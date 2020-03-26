let helpers = require("./helpers");
let https = require("https");

let AdmZip = require("adm-zip");
let app_errors = require("../err-to-regex/index");

class Log {
  constructor(id, file_name, url, type) {
    this.id = id;
    this.url = url;
    this.file_name = file_name;
    this.type = type;
  }

  async download() {
    let data_array = [];
    let data_length = 0;

    let url = await helpers.getRespHeaderValue(this.url, "location");
    console.log(`Downloading Attachment: ${ url }\n===`)

    return new Promise((resolve, reject) => {
      return https.get(url, (res) => {
        res.on("data", (d) => {
          helpers.handleHttpData(d, data_array);
          data_length += d.length;
        })
        .on("end", () => {
          this.data = new Buffer.alloc(data_length);

          for (let i = 0, len = data_array.length, pos = 0; i < len; i++) {
            data_array[i].copy(this.data, pos);
            pos += data_array[i].length;
          }
          resolve();
        })
        .on("error", (e) => {
          console.log(e)
          reject(e);
        })
      });
    });
  }

  async formatLogs() {
    if (this.type === "application/zip") {
      console.log(`Formatting zip file: ${this.file_name}\n===`);
      let zip = new AdmZip(this.data);
      let entries = zip.getEntries();
      let log_data = [];

      for (let i = 0, len = entries.length; i < len; i++) {
        let regex = /[A-Z0-9a-z.-]+\.log$/;
        if (entries[i].entryName.match(regex)) {
          log_data.push({
            file: entries[i].entryName,
            data: entries[i].getData().toString("utf8")
          })
        }
      }

      this.data = log_data;
    }
    else if (this.type === "text/x-log") {
      console.log(`Formatting log file: ${this.file_name}`)
      this.data = [
        {
        file: this.file_name,
        data: this.data.toString("utf8")
        }
      ]
    }
    else {
      this.data = false;
      console.log("File Type != (application/zip | text/x-log)");
    }
  }

  async checkLogs() {
    let obj = {};

    for (let i = 0, len = this.data.length; i < len; i++) {
      obj[this.data[i].file] = [];
      for (let j = 0, lenn = app_errors.length; j < lenn; j++) {
        for (let k = 0, leng = app_errors[j].regexp.length; k < leng; k++) {
          let regexp = app_errors[j].regexp[k];
          let match = this.data[i].data.match(regexp);

          if (match) {

            obj[this.data[i].file].push({
              errorID: app_errors[j].errorID,
              details: match[0],
              desc: app_errors[j].desc,
              links: app_errors[j].links
            });
          }
        }
      }
    }

    this.reviewed = obj;
  }
}

module.exports = Log;