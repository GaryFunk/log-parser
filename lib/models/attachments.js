const fetch = require('node-fetch');

class Attachment {
  constructor(obj) {
    // read-only
    this.content_type;
    this.content_url;
    this.deleted;
    this.file_name;
    this.id;
    this.inline;
    this.mapped_content_url;
    this.size;
    this.thumbnails;
    this.url;

    for (const key in obj) {
      if (Object.hasOwnProperty.call(obj, key)) {
        if (this[key] === undefined) {
          this[key] = obj[key];
        }
      }
    }
  }

  async download() {
    fetch(this.content_url, (res) => res.headers.location)
    .then(url => fetch(url))
    .then(attachment => console.log(attachment));
  }
}

module.exports = {
  Attachment,
};