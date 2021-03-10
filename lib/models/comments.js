class Comment {
  constructor(obj) {
    // read-only
    this.attachments;
    this.created_at;
    this.id;
    this.metadata;
    this.plain_body;
    this.type;

    // writeable
    this.author_id = undefined;
    this.body = undefined;
    this.html_body = undefined;
    this.public = undefined;
    this.uploads = undefined;
    this.via = undefined;

    for (const key in obj) {
      if (Object.hasOwnProperty.call(obj, key)) {
        if (this[key] === undefined) {
          this[key] = obj[key];
        }
      }
    }
  }
}

module.exports = Comment;