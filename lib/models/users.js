// User : represents a full Zendesk user Object
class User {
    constructor(obj) {
        // read-only
        this.id;
        this.iana_time_zone;
        this.last_login_at;
        this.active;
        this.chat_only;
        this.locale;
        this.moderator;
        this.report_csv;
        this.restricted_agent;
        this.role_type;
        this.shared_phone_number;
        this.shared;
        this.shared_agent;
        this.suspended;
        this.two_factor_auth_enabled;
        this.updated_at;
        this.url;
        this.verified;
        this.created_at;

        // writeable
        this.name = undefined;
        this.email = undefined;
        this.role = undefined;
        this.groups = undefined;
        this.tags = undefined;
        this.signature = undefined;
        this.alias = undefined;
        this.custom_role_id = undefined;
        this.default_group_id = undefined;
        this.details = undefined;
        this.external_id = undefined;
        this.locale_id = undefined;
        this.notes = undefined;
        this.only_private_comments = undefined;
        this.organization_id = undefined;
        this.phone = undefined;
        this.photo = undefined;
        this.ticket_restriction = undefined;
        this.time_zone = undefined;
        this.user_fields = undefined;

        for (const key in obj) {
            if (Object.hasOwnProperty.call(obj, key)) {
                if (this[key] === undefined) {
                    this[key] = obj[key];
                }
            }
        }
    }
}

class UserIdentity {
    constructor() {
        // read-only
        this.created_at;
        this.deliverable_state;
        this.id;
        this.type;
        this.undeliverable_count;
        this.updated_at;
        this.url;
        this.user_id;
        this.value;

        // writeable
        this.primary = undefined;
        this.verified = undefined;
    }
}

class EndUser {
    constructor() {
        // read-only
        this.created_at;
        this.id;
        this.locale;
        this.shared_phone_number;
        this.updated_at;
        this.url;

        // writeable
        this.email = undefined;
        this.locale_id = undefined;
        this.name = undefined;
        this.organization_id = undefined;
        this.phone = undefined;
        this.photo = undefined;
        this.role = undefined;
        this.time_zone = undefined;
        this.verified = undefined;
    }
}

module.exports = {
    User,
    UserIdentity,
    EndUser
};