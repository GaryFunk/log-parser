const { User, EndUser, UserIdentity } = require('./models/users');
const { Ticket, TicketComment } = require('./models/tickets');
const { Attachment } = require('./models/attachments');
const { Group, GroupMembership } = require('./models/groups');
const { api, __api, methods, ensure } = require('./helpers');

const versions = {
  v1: "/api/v1",
  v2: "/api/v2",
}

class Zendesk {
  constructor(subdomain, version) {
    if (!subdomain)
      throw new Error("invalid subdomain passed into constructor");
    if (!Object.keys(versions).includes(version))
      throw new Error("invalid version passed into constructor");

    this.subdomain = subdomain;
    this.version = versions[version] ? versions[version] : versions.v2;
    this.base = `https://${this.subdomain}.zendesk.com${this.version}`;
  }

  get search() {
    return {
      query: async (q) => {
        return api(method.GET, this.base, `/search?query${q}`)
        .then(response => {
          const next_url = response.next_page ? new url.URL(response.next_page) : null;
          const prev_url = response.prev_page ? new url.URL(response.next_page) : null;
          const next = next_url ? api.bind(this, methods.GET, next_url.origin, next_url.pathname) : null;
          const prev = prev_url ? api.bind(this, methods.GET, next_url.origin, next_url.pathname) : null;
          return {
            count: response.count,
            results: response.results,
            next_page: next,
            prev_page: prev,
          }
        });
      },
      count: async (q) => api(methods.GET, this.base, `/search/count/?query=${q}`),
      export: async (q) => api(methods.GET, this.base, `search/export?query=${q}`),
    }
  }

  get get() {
    return {
      attachments: {
        byId: async (id) => api(methods.GET, this.base, `/attachments/${id}`).then(response => {
            return new Attachment(response.attachment);
        }),
      },
      endUsers: {
        byId: async (id) => api(methods.GET, this.base, `/end_users/${id}`),
      },
      groups: {
        all: async () => api(methods.GET, this.base, "/groups"),
        assignable: async (id) => api(methods.GET, this.base, "/groups/assignable"),
        byId: async (id) => api(methods.GET, this.base, `/groups/${id}`),
        byUserId: async (id) => api(methods.GET, this.base, `/users/${id}/groups`),
        count: {
          all: async () => api(methods.GET, this.base, "/groups/count"),
          byUserId: async (id) => api(method.GET, this.base, `/users/${id}/groups/count`),
        },
        memberships: {
          all: async () => api(method.GET, this.base, "/group_memberships"),
          assignable: {
            all: async () => api(method.GET, this.base, "/groups_memberships/assignable"),
            byGroupId: async (id) => api(method.GET, this.base, `/groups/${id}/memberships/assignable`),
          },
          byGroupId: async (id) => api(method.GET, this.base, `/group/${id}/group_memberships`),
          byId: async (id) => api(method.GET, this.base, `/group_memberships/${id}`),
          byUserId: async (id) => api(method.GET, this.base, `/users/${id}/group_memberships`),
          byUserIdAndGroupMemID: async (id, groupmID) => {
              return api(method.GET, this.base, `/users/${id}/group_memberships/${groupmID}`);
          },
        }
      },
      tickets: {
        related: async (id) => api(methods.GET, this.base, `/tickets/${id}/related`),
        all: async () => api(methods.GET, this.base, "/tickets").then(response => {
            return response.tickets.map(ticket => new Ticket(ticket));
        }),
        byId: async (id) => api(methods.GET, this.base, `/tickets/${id}`).then(response => {
            return new Ticket(response.ticket);
        }),
        problems: {
          all: async () => api(methods.GET, this.base, "/problems"),
          autoComplete: async (q) => api(methods.POST, this.base, "/problems/autocomplete", { text: q }),
          incidentsById: async (id) => api(methods.GET, this.base, `/tickets/${id}/incidents`).then(response => {
              return response.tickets.map(ticket => new Ticket(ticket));
          }),
        },
        byOrganizationId:async (id) => api(methods.GET, this.base, `/organizations/${id}/tickets`),
        byUserId: async (id) => {
          return {
            requested: await api(methods.GET, this.base, `/users/${id}/tickets/requested`),
            ccd: await api(methods.GET, this.base, `/users/${id}/tickets/ccd`),
            assigned: await api(methods.GET, this.base, `/users/${id}/tickets/assigned`),
          }
        },
        recent: async () => api(methods.GET, this.base, "/tickets/recent"),
        count: {
          all: async () => api(methods.GET, this.base, "/tickets/count"),
          byOrganizationId: async (id) => api(methods.GET, this.base, `/organizations/${id}/tickets/count`),
        },
        stats: async (id) => {
          return {
            collaborators: await api(methods.GET, this.base, `/tickets/${id}/collaborators`),
            ccs: await api(methods.GET, this.base, `/tickets/${id}/email_ccs`),
            followers: await api(methods.GET, this.base, `/tickets/${id}/followers`),
          }
        },
        comments: {
          byId: async (id) => api(methods.GET, this.base, `/tickets/${id}/comments`).then(response => {
              return response.comments.map(comment => new TicketComment(comment));
          }),
        }
      },
      users: {
        all: async () => api(methods.GET, this.base, "/users"),
        autoComplete: async (name) => api(methods.GET, this.base, `/users/autocomplete?name=${name}`),
        byGroupId: async (id) => api(methods.GET, this.base, `/groups/${id}/users`),
        byId: async (id) => api(methods.GET, this.base, `/users/${id}`),
        byOrganizationId: async (id) => api(methods.GET, this.base, `/organizations/${id}/users`),
        count: {
          all: async () => api(methods.GET, this.base, "/users/count"),
          byGroupId: async (id) => api(methods.GET, this.base, `/groups/${id}/users/count`),
          byOrganizationId: async (id) => api(methods.GET, this.base, `/organizations/${id}/users/count`),
        },
        identities: {
          byId: async (id) => api(methods.GET, this.base, `/users/${id}/identities`),
          byIdAndIdentId: async (id, identID) => api(methods.GET, this.base, `/users/${id}/identities/${identID}`),
        },
        me: async () => api(methods.GET, this.base, "/users/me"),
        passwordRequirements: async id => api(methods.GET, this.base, `/users/${id}/password/requirements`),
        related: async (id) => api(methods.GET, this.base, `/users/${id}/related`),
      }
    }
  }

  get getMany() {
    return {
      users: async (ids) => api(methods.GET, this.base, `/users/show_many?id=${ids}`).then(response => {
          return response.users.map(user => new User(user));
      }),
      tickets: async (ids) => api(methods.GET, this.base, `/tickets/show_many?id=${ids}`).then(response => {
          return response.tickets.map(ticket => new Ticket(ticket));
      }),
    }
  }

  get search() {
    return {
      users: async (q) => api(methods.GET, this.base, `/users/search?query=${q}`),
    }
  }

  get create() {
    return {
      users: {
        new: async (user) => {
          ensure(user, User);
          return api(methods.POST, this.base, "/users", { user })
          .then(response => response.user.map(usr => new User(usr)));
        },
        identity: async (id, identity) => {
          ensure(identity, UserIdentity);
          return api(methods.POST, this.base, `/users/${id}/identities`, { identity })
          .then(response => response.user_identities.map(usrIdent => new UserIdentity(usrIdent)));
        },
      },
      requests: {
        userCreate: async (user) => {
          ensure(user, User);
          return api(methods.POST, this.base, "/users/request_create", { user })
        },
        userVerification: async (id, identID) => {
            return api(method.PUT, this.base, `/users/${id}/identities/${identID}/request_verification`);
        },
      },
      groups: {
        new: async (group) => {
          ensure(group, Group);
          return api(method.POST, this.base, "/groups", { group });
        },
        memberships: {
          new: async (groupm) => {
            ensure(groupm, GroupMembership);
            return api(methods.POST, this.base, "/group_memberships", { group_memberships: groupm })
            .then(response => response.group_memberships.map(groupm => new GroupMembership(groupm)));
          },
          forUserId: async (id, groupm) => {
            ensure(groupm, GroupMembership);
            return api(methods.POST, this.base, `/users/${id}/group_memberships`, { group_memberships: groupm })
            .then(response => response.group_memberships.map(groupm => new GroupMembership(groupm)));
          },
        }
      },
      tickets: {
        new: async (ticket) => {
          ensure(ticket, Ticket);
          return api(methods.POST, this.base, "/tickets", { ticket })
          .then(response => new Ticket(response.ticket));
        }
      },
      attachments: {
        new: async (filename, contentType, body) => {
            return __api(methods.POST, { contentType, body }, this.base, "/uploads", "json");
        },
      }
    }
  }

  get createMany() {
    return {
      users: async (users) => {
        ensure(users, User);
        return api(methods.POST, this.base, "/users/create_many", { users });
      },
      tickets: async (tickets) => {
        ensure(tickets, Ticket);
        return api(methods.POST, this.base, "/tickets/create_many", { tickets });
      },
      groups: {
        memberships: async (groupms) => {
          ensure(groupms, GroupMembership);
          return api(methods.POST, this.base, "/api/v2/group_memberships/create_many", {
              groups_memberships: groupms
          });
        }
      }
    }
  }

  get merge() {
    return {
      users: {
        me: async (userToMerge) => {
          ensure(user, User);
          return api(method.PUT, this.base, "/users/me/merge", { user: userToMerge });
        },
        endUser: async (id, targetUser) => {
          ensure(targetUser, User);
          return api(method.PUT, this.base, `/users/${id}/merge`, { user: targetUser });
        }
      },
      tickets: async (id, ids) => api(methods.POST, this.base, `/tickets/${id}/merge`, {
        ids: ids,
        source_comment: `merged into #${id}`,
        target_comment: `merged #${ids} into this ticket`},
      )
    }
  }

  get upsert() {
    return {
      users: async (user) => {
        ensure(user, User);
        return api(methods.POST, this.base, "/users/create_or_update", { user });
      },
      tickets: async (ticket) => {
        ensure(ticket, Ticket);
        return api(methods.POST, this.base, "/users/create_or_update", { ticket });
      },
    }
  }

  get upsertMany() {
    return {
      users: async (users) => {
        ensure(users, User);
        return api(methods.POST, this.base, "/users/create_or_update_many", { users });
      },
      tickets: async (tickets) => {
        ensure(tickets, User);
        return api(methods.POST, this.base, "/tickets/create_or_update_many", { tickets });
      }
    }
  }

  get update() {
    return {
      users: {
        me: {
          password: async (id, old, newpass) => {
              return api(methods.PUT, this.base, `/users/${id}/password`, {
                  previous_password: old,
                  password: newpass,
              });
          },
        },
        byId: async (id, changeset) => api(methods.PUT, this.base, `/users/${id}`, { user: changeset }),
        password: async (id, newpass) => api(methods.POST, this.base, `/users/${id}/password`, { password: newpass }),
        identity: {
          byId: async (id, identID, changeset) => {
              return api(methods.PUT, this.base, `/users/${id}/identities/${identID}`, { identity: changeset });
          },
          primary: async (id, identID) => {
              return api(methods.PUT, this.base, `/users/${id}/identities/${identID}/make_primary`);
          },
        },
        groups: {
          memberships: {
            setDefault: async (id, groupmID) => {
                return api(methods.PUT, this.base, `/users/${id}/group_memberships/${groupmID}/make_default`);
            },
          }
        },
      },
      tickets: {
        byId: async (id, changeset) => api(methods.PUT, this.base, `/tickets/${id}`, { ticket: changeset }),
        restoreDeletedById: async (id) => api(methods.PUT, this.base, `/deleted_tickets/${id}/restore`),
        markAsSpam: async (id) => api(method.PUT, this.base, `/tickets/${id}/mark_as_spam`),
        comments: {
          makePrivate: async (id, commentid) => {
              return api(methods.PUT, this.base, `/tickets/${id}/comments/${commentid}/make_private`);
          },
          redact: async (id, commentid, text) => {
              return api(methods.PUT, this.base, `/tickets/${id}/comments/${commentid}/redact`, { text });
          },
        }
      },
      attachments: {
        redact: async (id, ticketid, commentid) => {
            return api(methods.PUT, this.base, `/tickets/${ticketid}/comments/${commentid}/attachments/${id}/redact`);
        },
      },
      endUsers: {
        byId: async (id, changeset) => api(methods.PUT, this.base, `/end_users/${id}`, { user: changeset }),
      },
      groups: {
        byId: async (id, changeset) => api(methods.PUT, this.base, `/groups/${id}`, { group: changeset }),
      },
    }
  }

  get updateMany() {
    return {
      users: {
        bulk: async (ids, changeset) => {
            return api(methods.PUT, this.base, `/users/update_many?ids=${ids}`, { user: changeset });
        },
        batch: async (users) => {
          ensure(users, User);
          return api(methods.PUT, this.base, "/api/v2/users/update_many", { users });
        },
      },
      tickets: {
        bulk: async (ids, changeset) => {
            return api(methods.PUT, this.base, `/tickets/update_many?ids=${ids}`, { ticket: changeset });
        },
        batch: async (tickets) => {
          ensure(tickets, Ticket);
          return api(methods.PUT, this.base, "/api/v2/tickets/update_many", { tickets });
        },
        restoreDeletedById: async (ids) => api(methods.PUT, this.base, `/deleted_tickets/restore_many?ids=${ids}`),
        markAsSpam: async (ids) => api(methods.PUT, this.base, `/tickets/mark_many_as_spam?ids=${ids}`),
      }
    }
  }

  get verify() {
    return {
      users: {
        identity: async (id, identID) => api(methods.PUT, this.base, `/users/${id}/identities/${identID}/verify`),
      }
    }
  }

  get delete() {
    return {
      tickets: {
        byId: async (id) => api(methods.DELETE, this.base, `/tickets/${id}`),
        permanently: {
          byId: async (id) => api(methods.DELETE, this.base, `/deleted_tickets/${id}`)
        },
        stats: {
          list: async () => api(methods.GET, this.base, "/deleted_tickets"),
        }
      },
      attachments: async (token) => api(methods.DELETE, this.base, `/uploads/${token}`),
      users: {
        byId: async (id) => api(methods.DELETE, this.base, `/users/${id}`),
        identitiy: async (id, identID) => api(methods.DELETE, this.base, `/users/${id}/identities/${identID}`),
        permanently: {
          byId: async (id) => api(methods.DELETE, this.base, `/deleted_users/${id}`),
        },
        stats: {
          complianceDeletionStatus: async id => api(methods.GET, this.base, `/users/${id}/compliance_deletion_statuses`),
          count: async () => api(methods.GET, this.base, "/deleted_users/count"),
          list: async () => api(methods.GET, this.base, "/deleted_users"),
          listById: async (id) => api(methods.GET, this.base, `/deleted_users/${id}`),
        }
      },
      groups: {
        byId: async (id) => api(methods.DELETE, this.base, `/groups/${id}`),
        memberships: {
          byId: async (id) => api(methods.DELETE, this.base, `group_memberships/${id}`),
          byUserIdAndGroupMemID: async (id, groupmID) => {
              return api(methods.DELETE, this.base, `/users/${id}/group_memberships/${groupmID}`);
          },
        }
      }
    }
  }

  get deleteMany() {
    return {
      users: async (ids) => api(methods.DELETE, this.base, `/users/destroy_many?ids=${ids}`),
      tickets: {
        byId: async (ids) => api(methods.DELETE, this.base, `/tickets/destroy_many?ids=${ids}`),
        permanently: {
          byId: async (ids) => api(methods.DELETE, this.base, `/deleted_tickets/destroy_many?ids=${ids}`),
        }
      },
      groups: {
        memberships: async (ids) => api(methods.POST, this.base, `/group_memberships/destroy_many?ids=${ids}`),
      }
    }
  }
}

module.exports = {
  Zendesk,
}