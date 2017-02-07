// Copyright (c) 2017 - Kyle Derby MacInnis
// Any unauthorized distribution or transfer
// of this work is strictly prohibited.
// All Rights Reserved.
//

// AUTHOR: Kyle Derby MacInnis
// VERSION: 0.1.0

// DISCLAIMER:
//
// ** THIS FILE IS FOR NON-COMMERCIAL USE IN ALL FORMS ** EXCEPT THE FOLLOWING EXCEPTIONS ** 
//
// -- THIS FILE CAN BE USED FOR EDUCATIONAL PURPOSES - AS LONG AS SUCH EDUCATION IS PURELY INDIVIDUAL
//
// -- THIS FILE CAN BE EXAMINED INDIVIDUALLY - BUT CANNOT BE SHARED - DISCUSSED - OR DISTRIBUTED OPENLY OR PRIVATELY WITHOUT CONSENT FROM THE AUTHOR
//
// -- THIS FILE CANNOT BE USED BY ANY AFFILIATE OF PAPER INTERACTIVE INCORPORATED WITHOUT EXPLICIT PERMISSION FROM THE AUTHOR


// DESCRIPTION:
// Functions for Latex Document Transpiling & Compilation (PDF + DVI)


// THIRD-PARTY LIBRARIES
const latexEX = require('latex-ex'); // For Compiling into PDF (Requires TexLive)


// Main Object for Export
const latexEngine = {

    // -------FLAGS AND STORAGE-------
    // ================================>

    // Blank Array for Buffer
    _latex: [],
    // PDF Stream 
    _pdf: [],
    // DVI Stream
    _dvi: [],
    // Export Flag for Drafting
    _export: false,
    // Watermark Text (if-any)
    _watermark: "",
    // Colours
    _colours: [],
    // Images
    _images: [],
    // Files
    _files: [],


    // ----------MAIN FUNCTIONS----------
    // =================================>

    // Initializes Stream + Setups Flags
    init: (ltxStream, exportFlag) => {
        this._latex = ltxStream;
        this._export = exportFlag;
    },

    // Generate PDF File
    toPDF: () => {

    },
    // Generate DVI File
    toDVI: () => {

    },
    // Generate Latex File
    toLTX: () => {

    },

    // -----STREAM BASED UTILITIES-----
    // ===============================>

    // Push Raw Text into Stream
    push: (item) => {
        this._latex.push(item);
    },
    // Push If
    pushIf: (test, item) => {
        let itm = test ? item : "";
        this._latex.push(itm);
    },
    // Push If/Else
    pushIfElse: (test, item, otheritem) => {
        let itm = test ? item : otheritem;
        this._latex.push(itm);
    },
    // Push Clean Text into Stream
    cpush: (item) => {
        this._latex.push(this.clean(item));
    },
    // Clean & Push If
    cpushIf: (test, item) => {
        let itm = test ? item : "";
        this._latex.push(this.clean(itm));
    },
    // Push & Clean If/Else
    cpushIfElse: (test, item, otherItem) => {
        let itm = test ? item : otheritem;
        this._latex.push(this.clean(itm));
    },
    // Pop Raw Text from Stream
    pop: () => {
        return this._latex.pop();
    },
    // Pop If
    popIf: (test) => {
        if (test) {
            return this._latex.pop();
        }
    },


    // ----- TEXT BASED UTILITIES ------
    // =================================>

    // Cleans Input of all Latex Special Characters
    clean: (str) => {
        return str ?
            String(str)
            .replace(/\^/g, '\\textasciicircum{}')
            .replace(/\~/g, '\\textasciitilde{}')
            .replace(/\{/g, '\\\{')
            .replace(/\}/g, '\\\}')
            .replace(/\_/g, '\\\_')
            .replace(/\%/g, '\\\%')
            .replace(/\$/g, '\\\$')
            .replace(/\&/g, '\\\&')
            .replace(/\#/g, '\\\#')
            .replace(/\\/g, '') :
            "";
    },

}
module.exports = latexEngine;