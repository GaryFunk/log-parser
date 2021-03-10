const { api, methods } = require('../helpers');
const Url = require("url");

class Ticket {
  constructor(obj) {
    // read-only
    this.allow_attachments;
    this.allow_channelback;
    this.created_at;
    this.description;
    this.followup_ids;
    this.forum_topic_id;
    this.has_incidents;
    this.id;
    this.is_public;
    this.satisfaction_rating;
    this.sharing_agreement_ids;
    this.updated_at;
    this.url;

    // writeable
    this.assignee_id = undefined;
    this.brand_id = undefined;
    this.collaborator_ids = undefined;
    this.collaborators = undefined;
    this.custom_fields = undefined;
    this.due_at = undefined;
    this.email_cc_ids = undefined;
    this.external_id = undefined;
    this.follower_ids = undefined;
    this.group_id = undefined;
    this.macro_ids = undefined;
    this.organization_id = undefined;
    this.priority = undefined;
    this.problem_id = undefined;
    this.raw_subject = undefined;
    this.recipient = undefined;
    this.requester_id = undefined;
    this.status = undefined;
    this.comment = undefined;
    this.subject = undefined;
    this.submitter_id = undefined;
    this.tags = undefined;
    this.ticket_form_id = undefined;
    this.type = undefined;
    this.via = undefined;
    this.via_followup_source_id = undefined;

    for (const key in obj) {
      if (Object.hasOwnProperty.call(obj, key)) {
        if (this[key] === undefined) {
          this[key] = obj[key];
        }
      }
    }
  }

  get add() {
    const url = new Url.URL(this.url);
    return {
      internalNote: async (message) => api(methods.PUT, url.origin, url.pathname, {
        ticket: {
          comment: {
            html_body: message,
            public: false,
          }
        }
      }),
      publicNote: async (message) => api(methods.PUT, url.origin, url.pathname, {
        ticket: {
          comment: {
            html_body: message,
            public: true,
          }
        }
      }),
      followers: async (ids) => api(methods.PUT, url.origin, url.pathname, {
        followers: ids,
      })
    }
  }
}


class TicketComment {
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

module.exports = {
  Ticket,
  TicketComment,
}