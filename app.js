require("dotenv").config({path: ".env"});
const Zendesk = require("./lib/zendesk.js");
const Ticket = require("./lib/tickets.js");

let instance = new Zendesk(process.env.SUBDOMAIN);
let express = require("express");
let app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/zdlogparser", async function(req, res){
    await instance.requestAccessToken(req.query.code);
    res.send("Connection Successful");
});

app.post("/process_zd_ticket", async (req, res) => {
    let ticket_id = req.body.ticket_id;
    let email = req.body.assignee;

    let ticket = new Ticket(ticket_id, email);

    await ticket.getComments();
    ticket.getLogAttachments();
    ticket.processLogs();

    res.status(200).json({
        "ticket_id": ticket_id,
        "action": "process:ticket",
        "status": "done"
    });
});

app.post("/process_supp_form", function(req, res) {
    console.log(req.body);
    res.status(200).send("received");
});

app.listen(process.env.PORT, function (){
    console.log(`Zendesk Log Parser started on port: ${process.env.PORT}`);
});