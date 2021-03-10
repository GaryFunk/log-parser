class Group {
  constructor() {
    // read-only
    this.created_at;
    this.default;
    this.deleted;
    this.id;
    this.updated_at;
    this.url;

  // writeable
  this.description;
  this.name;
  }
}

class GroupMembership {
  constructor() {
    // read-only
    this.created_at;
    this.id;
    this.updated_at;
    this.url;

    // writeable
    this.default;
    this.group_id;
    this.user_id;
  }
}

module.exports = {
  Group,
  GroupMembership
}