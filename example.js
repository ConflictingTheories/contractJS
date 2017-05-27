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
let port = 3000;

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
app.use("/ltx", (req, res, next)=> {
    console.log('Sending PDF File');
    let myStream = [""];
    ltxGen.init(undefined, false, __dirname);
    ltxGen.begin();
    ltxGen.floatRightHead('YO')
    ltxGen.section('Howdy');
    ltxGen.subsection('HELLO WORLD!');
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
    ltxGen.floatRightHead('YO')
    ltxGen.section('Howdy');
    ltxGen.subsection('HELLO WORLD!');
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
function basicSection(ltx){
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
    ltx.definition("defintion","defintion");
    ltx.br();
    ltx.plain("plain");
    ltx.br();
    ltx.indent();
    ltx.br();
    ltx.bf("bf");
    ltx.br();
    ltx.ul("ul");
    ltx.br();
    ltx.par("par","par");
    ltx.br();
    ltx.enumHead("enumHead");
}

// PDF BASE64 OUTPUT
app.use("/pdf64", (req, res, next) =>{
    console.log('Sending PDF File');
    let myStream = [""];
    ltxGen.init(myStream, false, __dirname);
    ltxGen.begin();
    ltxGen.floatRightHead('YO')
    ltxGen.section('Howdy');
    ltxGen.subsection('HELLO WORLD!');
    ltxGen.end();
    ltxGen.toPDF64()
        .then((pdf64) => {
            res.contentType('application/pdf');
            pdf64.pipe(res);
            // res.send(pdf64.join(""))
            // res.send(Buffer.from(pdf64.join(""),"utf-8"));
            // mail.attachments = new Array();
            // mail.attachments.push({
            //     content: attachment,
            //     type: "application/pdf",
            //     filename: "agreement.pdf",
            //     //disposition: "attachment"
            // });
            // res.writeHead(200, {
            //     'Content-Type': 'application/pdf',
            //     'Content-Disposition': 'attachment; filename=myDoc.pdf',
            //     'Content-Length': ltxGen._pdf.length
            // });
            // res.end(ltxGen._pdf);
            // pdf64.pipe(res);
        })
        .catch((err) => console.error(err));
});


// CANVAS PAGE
app.use("/", (req,res,next)=>{
    res.send("/ --> /pdf /ltx /dvi");
});

// LISTEN ON PORT
server.listen(port, () => {
    console.log('PDF Generator is Now Live @ localhost:',port);
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