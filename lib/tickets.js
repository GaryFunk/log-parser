let https = require("https");
let helpers = require("./helpers.js");
let Comment = require("./comments");
let Log = require("./logs");

class Ticket {
  constructor(id, assignee) {
    this.id = id;
    this.assignee = assignee;
    this.comments = [];
    this.logs;
  }

  async getTicket() {
    let tok = await helpers.getAccessToken();

    let url_options = {
      method: "GET",
      host: `${ process.env.SUBDOMAIN }.zendesk.com`,
      path: "/api/v2/tickets/" + this.id + ".json",
      headers: {
        "Authorization": "Bearer" + " " + tok,
        "Content-Type": "application/json"
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
          let ticket = helpers.handleHttpEnd(data_array, data_length);
          console.log(`Ticket Received: ${ticket}`);
          resolve(ticket);
        })
        .on("error", (e) => {
          reject(e);
        })
      })
    });
  }

  async getComments() {
    let tok = await helpers.getAccessToken();

    let url_options = {
      host: `${ process.env.SUBDOMAIN }.zendesk.com`
      path: "/api/v2/tickets/" + this.id + "/comments.json",
      headers: {
        "Authorization": "Bearer" + " " + tok,
        "Content-Type": "application/json"
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
          let response = helpers.handleHttpEnd(data_array, data_length);
          let comments = response.comments;

          for (let i = comments.length - 1; i < comments.length; i++) {
            this.comments.push(new Comment(
              comments[i].id,
              comments[i].body,
              comments[i].attachments,
              comments[i].via,
              comments[i].created_at
            ));
          }

          resolve();
        })
        .on("error", (e) => {
          reject(e);
        })
      });
    });
  }

  getLogAttachments() {
    this.logs = this.comments.reduce((attachments, comment) => {
      let arr = [];
      let regex = /.*\.(log|zip)/i;

      if (comment.attachments.length > 0) {
        for (let attachment in comment.attachments) {
          if (regex.test(comment.attachments[attachment].file_name)) {
            let at = comment.attachments[attachment];
            arr.push(
              new Log(
                at.id,
                at.file_name,
                at.content_url,
                at.content_type
              )
            );
          }
        }
        return [...attachments, ...arr]
      }

      return attachments;
    }, []);
  }

  async addInternalNote(text, html) {
    let tok = await helpers.getAccessToken();

    let url_options = {
      method: "PUT",
      host: `${ process.env.SUBDOMAIN }.zendesk.com`,
      path: `/api/v2/tickets/${this.id}.json`,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ` + tok
      },
    }

    let body = {
      ticket: {
        comment: {
          body: text || null,
          public: false,
          html_body: html || null,
          author_id: process.env.AUTHOR_ID
        },
      }
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
          console.log(`Posted internal note in Ticket#${ this.id }\n===`);
          resolve(response.audit)
        })
        .on("error", (e) => {
          console.log(e)
          reject(e);
        })
      })

      req.write(JSON.stringify(body));
      req.end();
    });
  }

  async processLogs() {
    let obj = Object.prototype;
    let msg = `Processing logs for Ticket#${this.id}! Please wait 1-2 minutes.`;
    await this.addInternalNote(msg);

    for (let log in this.logs) {
      await this.logs[log].download();
      await this.logs[log].formatLogs();
      await this.logs[log].checkLogs();
    }

    let response = ""

    for (let file in this.logs) {
      let log = this.logs[file];
      let reviewed = log.reviewed;

      for (let review in reviewed) {
        if (obj.hasOwnProperty.call(reviewed, review) && reviewed[review].length > 0) {
          response += `<h2>&#128195; ${ log.file_name }/${ review } </h2>`;

          for (let i = 0, len = reviewed[review].length; i < len; i++) {
            response += `<br>`;
            response += `<h3>&#9940; Error #${ i + 1 }: ${ reviewed[review][i].errorID }</h3>`
            response += `<pre>${ reviewed[review][i].details }</pre> \n`;
            response += `<h4>Description</h4>\n${ reviewed[review][i].desc } \n`;
            response += `<h4>Links</h4>\n${ reviewed[review][i].links } \n`;
          }

          response += `<hr>\n`;
        }
      }
    }
    if (response !== "") {
      await this.addInternalNote(null, response);
    } else {
      let text = `Finished processing Ticket#${ this.id }. No known errors found.`
      await this.addInternalNote(text, null);
    }
  }
}

module.exports = Ticket;