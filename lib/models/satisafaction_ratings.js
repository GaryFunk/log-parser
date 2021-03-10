class SatisafactionRatings {
    constructor() {
        // read-only
        this.assignee_id;
        this.created_at;
        this.group_id;
        this.id;
        this.requester_id;
        this.ticket_id;
        this.updated_at;
        this.url;

        // writeable
        this.comment = undefined;
        this.reason = undefined;
        this.reason_code = undefined;
        this.score = undefined;
    }
}

module.exports = SatisafactionRatings;