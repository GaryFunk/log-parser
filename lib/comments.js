class Comment {
  constructor(id, body, attachments, via, created_at) {
    this.id = id;
    this.body = body;
    this.attachments = attachments;
    this.via = via;
    this.created_at = created_at;
  }

  getPlatform() {
    let match = this.body.match(/^(?:zdlogparser:)(windows|mac|chrome)$/);

    switch (match) {
      case "windows":
        console.log("win!");
        break;
      case "mac:keynote":
        console.log("mac with keynote!");
        break;
      case "mac:powerpoint":
        console.log("mac with powerpoint!");
        break;
      case "chrome":
        console.log("chrome!");
        break;
      default:
        console.log("defaulted to win!");
    }
  }
}

module.exports = Comment;