// Copyright (c) 2017 - Kyle Derby MacInnis
// Any unauthorized distribution or transfer
// of this work is strictly prohibited.
// All Rights Reserved.
//

// REFER TO THE LICENSE FILE FOR INFORMATION REGARDING LICENSING 

// AUTHOR: Kyle Derby MacInnis
// VERSION: 0.1.0
// DATE : FEBRUARY 7, 2017

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
const LTX = require('latex-ex'); // For Compiling into PDF (Requires TexLive)
const toolLib = require('./library.js');

// Main Object for Export
const latexEngine = {

    // -------FLAGS AND STORAGE-------
    // ================================>
    // Header & System Generated Stuff here
    _sys: [],
    // System related stuff goes here based on usage
    _macro: [],
    // Blank Array for Buffer (User Driven Content Goes Here)
    _latex: [],
    // PDF Stream (Output)
    _pdf: [],
    // DVI Stream (Output)
    _dvi: [],
    // Export Flag for Drafting
    _export: false,
    // Watermark Text (if-any)
    _watermark: "",
    // Colours (for Styling Purposes)
    _colours: [],
    // Styles
    _styles: [],
    // Images
    _images: [],
    // Files
    _files: [],


    // ----------MAIN FUNCTIONS----------
    // =================================>
    // Initializes Stream + Setups Flags
    init: (ltxStream, exportFlag, colours) => {
        this._latex = ltxStream;
        this._export = exportFlag;
        if (colours && colours.length) {
            let i = colours.length;
            while (i--) {
                this.setColour(colours[i].name, colours[i].val, colours[i].type);
            }
        }
        // Setup System configuration
        this._initSystemConfig();
        // Setup Macros
        this._initDefaultMacros();

        // Establish Styles for Use (Defaults) (extensible)
        this._setStyle("bf", "\\textbf{", "}");
        this._setStyle("it", "\\emph{", "}");
        this._setStyle("ul", "\\ul{", "}");
        this._setStyle("st", "\\st{", "}");

        // Establish colours available for use (Defaults) (Extensible)
        this._setColour("text", "#000000", "HTML"); // Default Colour
        this._setColour("new", "#0000AA", "HTML"); // Revision Highlighting
        this._setColour("old", "#AA0000", "HTML"); // Revision Highlighting
        this._setColour("eq", "#5533AA", "HTML"); // Equal
        this._setColour("neq", "#337711", "HTML"); // Not Equal
    },
    // System Configuration
    _initSystemConfig: () => {
        // Setup System
        this._sys.push("\\batchmode\n");
    },
    // Macro Initialization
    _initDefaultMacros: () => {
        // Setup Macros
    },
    // Adds in configuration for a new colour in Latex
    _setColour: (name, val, type) => {
        this._colours["_" + name] = {
            name: name,
            val: val,
            type: type,
            ltx: "\\colour{" + name + "}"
        };
        this._colours[name] = () => this._colours["_" + name].ltx
        // Append Latex Command for New Colour to Macros
        this._macro.push["\\definecolour{" + name + "}{" + type + "}{" + val + "}"];
    },
    // Adds in configuration for a new colour in Latex
    _setStyle: (name, pre, post) => {
        this._styles["_" + name] = {
            name: name,
            pre: pre,
            post: post,
            ltx: (text) => {
                return "\\" + name + "{" + text + "}"
            }
        };
        this._styles[name] = (text) => this._styles["_" + name].ltx(text);
        // Append Latex Command for New Colour to Macros
        this._macro.push["\\def\\" + name + "<#1>{" + pre + "#1" + post + "}"];
    },


    // ---- FILE COMMAND UTILITIES ----
    // ================================>
    // Generate PDF File
    toPDF: () => {
        return new Promise((resolve, reject) => {
            let input = this._sys.concat(this._macro).concat(this._latex)
            // Store to this._pdf & return
            let stream = LTX(input.join(""));
            let pdfData = [];
            try {
                stream.on('data', (chunk) => {
                    pdfData.push(chunk);
                });
                stream.on('end', () => {
                    this._pdf = pdfData;
                    resolve(pdfData);
                })
            } catch (e) {
                console.error(e);
                reject(e);
            }
        });
    },
    // Generate base64 Encoded PDF File
    toPDF64: () => {
        return new Promise((resolve, reject) => {
            let input = this._sys.concat(this._macro).concat(this._latex)
            // Store to this._pdf & return
            let stream = LTX(input.join(""));
            let pdfData = [];
            try {
                stream.on('data', (chunk) => {
                    pdfData.push(chunk.toString('base64'));
                });
                stream.on('end', () => {
                    this._pdf = pdfData;
                    resolve(pdfData);
                })
            } catch (e) {
                console.error(e);
                reject(e);
            }
        });
    },
    // Generate DVI File
    toDVI: () => {
        // Store to this._dvi & return
        return new Promise((resolve, reject) => {
            let input = this._sys.concat(this._macro).concat(this._latex)
            // Store to this._pdf & return
            let stream = LTX(input.join(""), {
                format: 'dvi'
            });
            let pdfData = [];
            try {
                stream.on('data', (chunk) => {
                    pdfData.push(chunk);
                });
                stream.on('end', () => {
                    this._pdf = pdfData;
                    resolve(pdfData);
                })
            } catch (e) {
                console.error(e);
                reject(e);
            }
        });
    },
    // Generate Latex File
    toLTX: () => {
        let output = this._sys.concat(this._macro).concat(this._latex)
        return Promise.resolve(output.join(""));
    },

    // -----STREAM BASED UTILITIES-----
    // ===============================>
    // Push Raw Text into Stream
    push: (item) => {
        this._latex.push(item);
    },
    // Push If
    pushIf: (condition, item) => {
        let itm = condition ? item : "";
        this._latex.push(itm);
    },
    // Push If/Else
    pushIfElse: (condition, item, otheritem) => {
        let itm = condition ? item : otheritem;
        this._latex.push(itm);
    },
    // Push Clean Text into Stream
    cpush: (item) => {
        this._latex.push(this.clean(item));
    },
    // Clean & Push If
    cpushIf: (condition, item) => {
        let itm = condition ? item : "";
        this._latex.push(this.clean(itm));
    },
    // Push & Clean If/Else
    cpushIfElse: (condition, item, otherItem) => {
        let itm = condition ? item : otheritem;
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
    // Returns comparison between two variables
    compare: (one, two) => {
        if (one === two) {
            return "eq"
        } else if (two === "") {
            return "one"
        } else if (one === "") {
            return "two"
        } else {
            return "neq"
        }
    },
    // Conditional Put
    putIf: (condition, t_str) => {
        return condition ?
            t_str :
            "";
    },
    // If/Else
    putIfElse: (condition, t_str, f_str) => {
        return condition ?
            t_str :
            f_str;
    },
    //  Put
    cputIf: (condition, t_str) => {
        return condition ?
            this.clean(t_str) :
            "";
    },
    // If/Else
    cputIfElse: (condition, t_str, f_str) => {
        return condition ?
            this.clean(t_str) :
            this.clean(f_str);
    },


    // ----- STRUCTURES & DOCUMENT TEMPLATES ------
    // ===========================================>
    // Generate a Dynamic Table
    table: (columns, array) => {
        let coltypes = ["| "];
        let entries = [];
        for (let i = 0; i < columns.length; i++) {
            coltypes.push(" " + columns[i] + " | ");
        }
        for (let i = 0; i < array.length; i++) {
            entries.push("\\bottomrule\n")
            for (let j = 0; j < columns.length; j++) {
                j === column.length - 1 ?
                    entries.push(array[i][j] + "\\\\") :
                    entries.push(array[i][j] + " & ");
            }
            entries.push("\n\\toprule\n");
            if (i === 0) {
                entries.push("\\endhead\n");
            }
        }
        let out = [];
        out.push("\\newcolumntype{g}{>{\\vfill\\centering}X}~\n");
        out.push("\\newcolumntype{Y}{>{\\vfill\\RaggedRight\\arraybackslash}X}~\n");
        out.push("\\newcolumntype{Z}{>{\\vfill\\centering\\arraybackslash}X}");
        out.push("\\begin{tabularx}{\\textwidth}{" + coltypes.join("") + "}\n");
        out.push(entries.join("") + "\n");
        out.push("\\end{tabularx}\n\\flushleft")
        this._push(out.join(""));
    },
    // List (for enumerated lists)
    list: (array) => {
        let out = ["\\lst\n"];
        for (let i = 0; i < array.length; i++) {
            out.push("{(" + String.fromCharCode(97 + i) + ")}{" + array[i] + "}\n");
        }
        out.push("\\stoplst");
        return out.join("");
    },
    // Section Heading
    section: (hd) => {
        var out = ["\n\\section*{" + hd + "}\n"];
        this._latex.push(out.join(""));
    },
    // Subsection Heading
    subsection: (hd) => {
        var out = ["\n\\subsection*{" + hd + "}\n"];
        this._latex.push(out.join(""));
    },
    // Definition
    definition: (def, txt) => {
        var out = ["\\paragraph{\"" + def + "\"}{" + txt + "}\n"];
        this._latex.push(out.join(""));
    },
    // Line Break
    br: () => {
        this.push("\\ \\linebreak\n");
    },
    // New Page
    np: () => {
        this.push("\\pagebreak\n");
    },
    // Plain Text
    plain: (txt) => {
        var out = ["\\noindent " + txt + "\n"];
        this._latex.push(out.join(""));
    },
    // Indented Text
    indent: (txt) => {
        var out = ["\\indent" + txt + "\n"];
        this._latex.push(out.join(""));
    },
    // Bold Font
    bf: (txt) => {
        var out = ["\\textbf{" + txt + "}\n"];
        this._latex.push(out.join(""));
    },
     // Underline
    ul: (txt) => {
        var out = ["\\underline{" + txt + "}\n"];
        this._latex.push(out.join(""));
    },
    // Paragraph Entry
    par: (bold, txt) => {
        this._push("\\paragraph{" + bold + "}{" + txt + "}\n");
    },
    // Enumerated Paragraphs (uses counter)
    enum: (title, txt) => {
        var out = ["\\stepcounter{clausecount}\n\\reversemarginpar",
            "\\marginnote{\\textbf{\\theclausecount .}}[0.9cm]\\paragraph{" + title + "}\\nonfrenchspacing " + txt + "\n"
        ];
        this._latex.push(out.join(""));
    },
    // Enumerated Heading (uses counter)
    enumHead: (title) => {
        var out = ["\\stepcounter{artcount}\n",
            "\\subsubsection*{\\bf ARTICLE \\theartcount\\ -\\ " + title + "}\n"
        ];
        this._latex.push(out.join(""));
    },
    // Floating Title (Right)
    floatRightHead: (heading) => {
        var out = ["\\hfill\\begin{minipage}{\\dimexpr\\textwidth-8cm}\n",
            "\\parfillskip0pt\n\\parindent0pt\n\\fontdimen3\\font.25in\n",
            "\\frenchspacing\n\\bf " + heading + "\n\\end{minipage}\\ ",
            "\\linebreak \\ \\linebreak\\nonfrenchspacing\n"
        ];
        this._latex.push(out.join(""));
    },
    // Floating Title (Left)
    floatLeftHead: (heading) => {
        var out = ["\\begin{minipage}{\\dimexpr\\textwidth-8cm}\n",
            "\\parfillskip0pt\n\\parindent0pt\n\\fontdimen3\\font.25in\n",
            "\\frenchspacing\n\\bf " + heading + "\n\\end{minipage}\\hfill\\ ",
            "\\linebreak \\ \\linebreak\\nonfrenchspacing\n"
        ];
        this._latex.push(out.join(""));
    },


    // ---LATEX FORMATTING & STYLE FUNCTIONS---
    // =======================================>
    // Generate Custom Styles
    newStyle: (text, flags) => {
        let ltx = [];
        // Determine Colour
        flags.new ? ltx.push(this._colours.new()) : ltx.push("");
        flags.old ? ltx.push(this._colours.old()) : ltx.push("");
        flags.eq ? ltx.push(this._colours.eq()) : ltx.push("");
        flags.neq ? ltx.push(this._colours.neq()) : ltx.push("");
        // Apply Formatting
        text = flags.cl ? this.clean(text) : text;
        text = flags.st ? this._styles.st(text) : text;
        text = flags.bf ? this._styles.bf(text) : text;
        text = flags.it ? this._styles.it(text) : text;
        text = flags.ul ? this._styles.ul(text) : text;
        // Push and Finalize
        ltx.push(text);
        ltx.push(this._colours.text());
        return ltx.join("");
    },
    // Generate Flags Object for Use (defaults)
    genFlags: () => {
        return {
            new: false,
            old: false,
            ul: false,
            cl: false,
            st: false,
            eq: false,
            neq: false,
        };
    },
    // New Style Formatting
    styleAs: {
        // Highlighted
        new: (revHistory, n) => {
            let index = n ? n : 0;
            return this.newStyle(revHistory[index], {
                new: true,
                ul: true
            });
        },
        // Modified Style Formatting
        neq: (revHistory, n, m) => {
            let ltx = [];
            let newIndex = n ? n : 0;
            let oldIndex = m ? m : 0;
            ltx.push(this.newStyle(revHistory[oldIndex], {
                old: true,
                st: true
            }));
            ltx.push(this.newStyle(revHistory[newIndex], {
                new: true,
                ul: true,
                cl: true
            }));
            return ltx.join("");
        },
        // Removed Style Formatting
        old: (revHistory, n) => {
            let index = n ? n : 0;
            return this.newStyle(revHistory[index], {
                old: true,
                st: true
            });
        },
        // Equal (unchanged) Formatting
        eq: (v) => {
            return this.newStyle(v.curr, {
                eq: true
            });
        },
        // New (cleaned)
        newClean: (revHistory, n) => {
            let index = n ? n : 0;
            return this.newStyle(revHistory[index], {
                new: true,
                ul: true,
                cl: true
            });
        },
        // Modified (Cleaned)
        neqClean: (revHistory, n, m) => {
            let ltx = [];
            let newIndex = n ? n : 0;
            let oldIndex = m ? m : 0;
            ltx.push(this.newStyle(revHistory[oldIndex], {
                old: true,
                st: true,
                cl: true
            }));
            ltx.push(this.newStyle(revHistory[newIndex], {
                new: true,
                ul: true,
                cl: true
            }));
            return ltx.join("");
        },

        // Removed (Cleaned)
        oldClean: (revHistory, n) => {
            let index = n ? n : 0;
            return this.newStyle(revHistory[index], {
                old: true,
                st: true,
                cl: true
            });
        },

        // Equal (Cleaned)
        eqClean: (revHistory, n) => {
            let index = n ? n : 0;
            return this.newStyle(revHistory[index], {
                eq: true,
                cl: true
            });
        }
    },
    // Return Styled Result
    putRev: (revHistory, style, n, m) => {
        if (m) {
            return this.styleAs[style](revHistory, n, m);
        } else {
            return this.styleAs[style](revHistory, n);
        }
    },
    // Return Styled Result from Direct Input
    putRevD: (rev, style) => {
        return this.styleAs[style](rev, style, 0);
    },
}
module.exports = latexEngine;