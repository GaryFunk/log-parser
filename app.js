require("./lib/helpers").envars("./.env");
const express = require("express");
const fetch = require('node-fetch');
const app = express();
const Errors = require('./err-to-regex/index');
const { Zendesk } = require("./lib/zendesk");

const zd = new Zendesk("ejmorganhelp", "v2");

app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.get("/ping", async (req, res) => {
    res.status(200).json({
        message: "pong",
    });
});

app.post("/process", async (req, res) => {
    zd.get.tickets.byId(req.body.id)
    .then(ticket => zd.get.tickets.comments.byId(ticket.id))
    .then(comments => reduceCommentsToLogs(comments))
    .then(async logs => downloadLogs(logs))
    .then(logs => checkLogsAgainstErrors(logs))
    .then(async logs => addInternalNote(req.body.id, logs.map(log => logToHTMLTable(log)).join("\n\n")))
    .catch(error => console.error(error));
    res.status(200).json({
        message: "success"
    });
});

app.listen(8080);

async function addInternalNote(id, message) {
    return zd.update.tickets.byId(id, {
        comment: {
            html_body: message,
            public: false,
        }
    })
}

function reduceCommentsToLogs(comments) {
    return comments.reduce((acc, comment) => {
        if (comment.attachments.length > 0) {
            const logs = comment.attachments.filter(attachment => {
                return /\.(log|zip)$/g.test(attachment.file_name);
            });
            if (logs.length > 0) {
                acc = acc.concat(logs);
            }
        }
        return acc;
    }, [])
}

async function downloadLogs(logs) {
    return await Promise.all(logs.map(async log => {
        return await fetch(log.content_url)
            .then(res => fetch(res.url).then(res => res.buffer()))
            .then(buffer => ({
                name: log.file_name,
                data: Buffer.from(buffer).toString('utf8'),
            }))
    }));
}

function checkLogsAgainstErrors(logs) {
    return logs.reduce((acc, log) => {
        log.matches = [];
        Errors.forEach(error => {
            if (error.limit_to.includes(log.name)) {
                const matches = log.data.match(error.regexp);
                if (matches.length) {
                    log.matches = log.matches.concat({
                        name: error.name,
                        description: error.description,
                        solutions: error.solutions,
                    });
                    acc = acc.concat(log);
                }
            }
        })
        return acc;
    }, [])
}

function logToHTMLTable(log) {
    const header = `<h1>${log.name}</h1>`;
    let table = `<table>`;
    log.matches.forEach(match => {
        table += `<tr>`;
        table += `<td>Error</td>`;
        table += `<td>${match.name}</td>`
        table += `</tr>`;
        table += `<tr>`;
        table += `<td>Description</td>`;
        table += `<td>${match.description}</td>`
        table += `</tr>`;
        match.solutions.forEach(solution => {
            table += `<tr>`;
            table += `<td>Solution:\n${solution.name}</td>`;
            table += `<td>`;
            solution.steps.forEach(step => {
                table += `<h3>${step.name}</h3>`;
                table += `<p>${step.description}</p>`
            })
            table += `</td>`;
            table += `</tr>`;
        })
    })
    table += `</table>`;
    return header + table;
}