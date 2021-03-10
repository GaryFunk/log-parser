class Organization {
    constructor() {
        // read-only
        this.created_at;
        this.updated_at;

        // writeable
        this.details = undefined;
        this.domain_names = undefined;
        this.external_id = undefined;
        this.group_id = undefined;
        this.id = undefined;
        this.name = undefined;
        this.notes = undefined;
        this.organization_fields = undefined;
        this.shared_comments = undefined;
        this.shared_tickets = undefined;
        this.tags = undefined;
        this.url = undefined;
    }
}

module.exports = Organization;