// Copyright (c) 2017 - Kyle Derby MacInnis
// Any unauthorized distribution or transfer
// of this work is strictly prohibited.
// All Rights Reserved.
//

// REFER TO THE LICENSE FILE FOR INFORMATION REGARDING LICENSING **

// THIRD-PARTY LIBRARIES
// Express + Third-Party Libraries
const bp = require('body-parser');
const cp = require('cookie-parser');
const cors = require('cors');
const session = require('express-session');
const express = require('express');
const app = express();
const server = require('http').Server(app);

// LATEX GENERATOR LIBRARY (* Requires Tex-Live Installation)
const ltxGen = require('./lib/latexEngine.js');

// VARIABLES
let port = 4000;

// INTERNAL LIBRARIES

// PARSE DATA COMING IN
app.set('view engine', 'ejs');
app.use(cp());
app.use(cors());
app.use(bp.json());
app.use(bp.urlencoded({
    extended: false
}));


// LATEX OUTPUT
app.use("/ltx", (req, res, next) => {
    let myStream = [""];
    // Initialize Stream
    ltxGen.init(myStream, false, __dirname);
    ltxGen.begin();
    //Pre-made Section
    basicSection(ltxGen);
    // End Stream
    ltxGen.end();
    ltxGen.toLTX()
        .then((ltx) => {
            res.contentType("text/plain");
            res.end(ltx);
        })
        .catch((err) => console.error(err));
});

// DVI OUTPUT
app.use("/dvi", (req, res, next) => {
    console.log('Sending PDF File');
    let myStream = [""];
    ltxGen.init(myStream, false, __dirname);
    ltxGen.begin();
    basicSection(ltxGen);
    ltxGen.end();
    ltxGen.toDVI()
        .then((dvi) => {
            res.contentType('application/dvi')
            dvi.pipe(res);
        })
        .catch((err) => console.error(err));
});

// PDF OUTPUT
app.use("/pdf", (req, res, next) => {
    console.log('Sending PDF File');
    // PDF Stream
    let myStream = [""];
    // Initialize Stream
    ltxGen.init(myStream, false, __dirname);
    ltxGen.begin();
    //Pre-made Section
    basicSection(ltxGen);
    // End Stream
    ltxGen.end();
    // Generate PDF & Send
    ltxGen.toPDF()
        .then((pdf) => {
            res.contentType('application/pdf');
            pdf.pipe(res);
        })
        .catch((err) => console.error(err));
});

// Example PDF Section
function basicSection(ltx) {
    let revHistory = ["NEW", "OLD"];
    ltxGen.table(["X", "X", "X"], [
        ["NAME", "DATE", "3002"],
        ["Dawg", "Bounty", ""]
    ]);
    ltxGen.styleAs().neq(revHistory, 0, 1);
    ltxGen.br();
    ltxGen.styleAs().new(revHistory, 0);
    ltxGen.br();
    ltxGen.styleAs().old(revHistory, 0, 1);
    ltxGen.br();
    ltxGen.styleAs().eq(revHistory, 0, 0);
    ltx.floatRightHead('floatRightHead');
    ltx.br();
    ltx.floatLeftHead('floatLeftHead')
    ltx.br();
    ltx.subsection('subsection');
    ltx.br();
    ltx.enum('enum', "enumerated paragraph (labeled)");
    ltx.br();
    ltx.enum('', "enum: enumerated paragraph (non-label)");
    ltx.br();
    ltx.definition("defintion", "defintion");
    ltx.br();
    ltx.plain("plain");
    ltx.br();
    ltx.indent();
    ltx.br();
    ltx.bf("bf");
    ltx.br();
    ltx.ul("ul");
    ltx.br();
    ltx.par("par", "par");
    ltx.br();
    ltx.enumHead("enumHead");
}

// CANVAS PAGE
app.use("/", (req, res, next) => {
    res.send("/ --> /pdf /ltx /dvi");
});

// LISTEN ON PORT
server.listen(port, () => {
    console.log('PDF Generator is Now Live @ localhost:', port);
});

// FALLBACK FOR PORT
process.on("uncaughtException", function (e) {
    console.log("ERROR: " + e);
    if (e.errno === "EADDRINUSE") {
        //console.log("Falling back to port 5000");

        console.log("Error ---> Port in Use: Please select another port: ");
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('PORT IN USE: Please select a different port (3000+)? ', (answer) => {
            // TODO: Log the answer in a database
            rl.close();
            port = answer;
            server.listen(port);
        });
    }
});

module.exports = server;