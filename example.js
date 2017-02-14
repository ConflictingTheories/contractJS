// Copyright (c) 2017 - Kyle Derby MacInnis
// Any unauthorized distribution or transfer
// of this work is strictly prohibited.
// All Rights Reserved.
//

// REFER TO THE LICENSE FILE FOR INFORMATION REGARDING LICENSING **

// THIRD-PARTY LIBRARIES
// Express + Third-Party Libraries
const ltxGen = require('./latexEngine.js');
const bp = require('body-parser');
const cp = require('cookie-parser');
const cors = require('cors');
const session = require('express-session');
const express = require('express');
const app = express();
const server = require('http').Server(app);

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
app.use("/ltx", function (req, res, next) {
    console.log('Sending PDF File');
    let myStream = [""];
    ltxGen.init(undefined, false, __dirname);
    ltxGen.begin();
    ltxGen.floatRightHead('YO')
    // ltxGen.section('Howdy');
    // ltxGen.subsection('HELLO WORLD!');
    ltxGen.end();
    ltxGen.toLTX();
    res.contentType("text/plain");
    res.send(ltxGen.getLTX());
});

// DVI OUTPUT
app.use("/dvi", function (req, res, next) {
    console.log('Sending PDF File');
    let myStream = [""];
    ltxGen.init(undefined, false, __dirname);
    ltxGen.begin();
    ltxGen.floatRightHead('YO')
    // ltxGen.section('Howdy');
    // ltxGen.subsection('HELLO WORLD!');
    ltxGen.end();
    ltxGen.toDVI()
        .then((dvi) => {
            dvi.pipe(res);
        })
        .catch((err) => console.error(err));
});

// PDF OUTPUT
app.use("/pdf", function (req, res, next) {
    console.log('Sending PDF File');
    let myStream = [""];
    ltxGen.init(undefined, false, __dirname);
    ltxGen.begin();
    ltxGen.floatRightHead('YO')
    // ltxGen.section('Howdy');
    // ltxGen.subsection('HELLO WORLD!');
    ltxGen.end();
    ltxGen.toPDF()
        .then((pdf) => {
            pdf.pipe(res);
        })
        .catch((err) => console.error(err));
});

// PDF BASE64 OUTPUT
app.use("/pdf64", function (req, res, next) {
    console.log('Sending PDF File');
    let myStream = [""];
    ltxGen.init(undefined, false, __dirname);
    ltxGen.begin();
    ltxGen.floatRightHead('YO')
    // ltxGen.section('Howdy');
    // ltxGen.subsection('HELLO WORLD!');
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

// LISTEN ON PORT
server.listen(3000, () => {
    console.log('PDF Generator is Now Live @ localhost:3000');
});

module.exports = server;