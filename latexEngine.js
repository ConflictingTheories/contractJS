// Copyright (c) 2017 - Kyle Derby MacInnis
// Any unauthorized distribution or transfer
// of this work is strictly prohibited.
// All Rights Reserved.
//

// REFER TO THE LICENSE FILE FOR INFORMATION REGARDING LICENSING 

// AUTHOR: Kyle Derby MacInnis
// VERSION: 0.1.0
// DATE : FEBRUARY 7, 2017

// DESCRIPTION:
// Functions for Latex Document Transpiling & Compilation (PDF + DVI)


// THIRD-PARTY LIBRARIES
const LTX = require('latex-ex'); // For Compiling into PDF (Requires TexLive)
const toolLib = require('./library.js');

// Main Object for Export
const latexEngine = (function latexEngine() {

    // -------FLAGS AND STORAGE-------
    // ================================>
    // Header & System Generated Stuff here
    this._sys = [];
    // System related stuff goes here based on usage
    this._macro = [];
    // Blank Array for Buffer (User Driven Content Goes Here)
    this._latex = [];
    // PDF Stream (Output)
    this._pdf = [];
    // DVI Stream (Output)
    this._dvi = [];
    // Latex Stream (Output)
    this._ltx = [];
    // Export Flag for Drafting
    this._export = false;
    // Watermark Text (if-any)
    this._watermark = "";
    // Colours (for Styling Purposes)
    this._colours = [];
    // Styles
    this._styles = [];
    // Images
    this._images = [];
    // Files
    this._files = [];
    //Packages = [];
    this._packages = [];
    // Configuration
    this._config = [];

    // System Configuration
    function _initSystemConfig(graphicsPath) {
        // Setup System
        this._sys.push("\\batchmode\n");
        // Latex Packages
        this._packages = [
            "\\usepackage[english]{babel}",
            //"\\usepackage[utf8]{inputenc}",
            "\\usepackage{color, colortbl}",
            "\\usepackage[letterpaper, margin=1in]{geometry}",
            "\\usepackage{marginnote}",
            "\\usepackage{parskip}",
            "\\usepackage{multicol}",
            "\\usepackage{tabularx}",
            "\\usepackage{ltablex}",
            "\\usepackage{papersign}",
            "\\usepackage{booktabs}",
            "\\usepackage{ragged2e}",
            "\\usepackage{ifmtarg}",
            "\\usepackage{etoolbox}",
            "\\usepackage{graphicx}",
            "\\usepackage{xcolor}",
            "\\usepackage{soul}",
            "\\usepackage{ifthen}"
        ];
        // configuration
        this._config = [
            "\\graphicspath{" + graphicsPath + "}\n",
            "\\setlength{\\parskip}{0em}\n",
            "\\keepXColumns\n",
            "\\newenvironment{frcseries}{\\fontfamily{pzc}\\selectfont}{}\n",
            "\\newcommand{\\textcur}[1]{{\\itshape\\frcseries#1}}\n",
            "\\newcolumntype{g}{>{\\vfill\\centering}X}\n",
            "\\newcolumntype{Y}{>{\\vfill\\RaggedRight\\arraybackslash}X}\n",
            "\\newcolumntype{Z}{>{\\vfill\\centering\\arraybackslash}X}\n",
        ]
        this._sys = this._sys.concat(this._packages).concat(this._config);
    };
    // Macro Initialization
    function _initDefaultMacros() {
        // Setup Macros
        let macros = [
            // Necessary Listing Macros
            "\n\\newcommand{\\lst}{\n\\paragraph{ }\n\\hfill\\begin{minipage}{\\dimexpr\\textwidth-1cm}\n\\begin{description}\n\\setlength\\itemsep{1em}\n\\@lsti\n}\n",
            "\n\\newcommand\\@lsti{\n\\@ifnextchar\\stoplst{\\@lstsend}{\\@lstii}}\n",
            "\n\\newcommand\\@lstii[2]{\n\\@lstiii{#1}{#2}\\hfill\n\\@lsti\n}\n",
            "\n\\newcommand\\@lstiii[2]{\\item[#1]#2\n}\n",
            "\n\\newcommand\\@lstsend[1]{\n\\end{description}\n\\xdef\\tpd{\\the\\prevdepth}\n\\end{minipage}\n}\n"
        ];
        this._macro = this._macro.concat(macros);
        // Counters
        this._macro.push("\\newcounter{enumcount}\n");
        this._macro.push("\\newcounter{enumheadcount}\n");
    };
    // Setup the watermark
    function _setWatermark(text, colour, scale) {
        // TODO
    };
    // Adds in configuration for a new colour in Latex
    function _addColour(name, val, type) {
        this._colours["_" + name] = {
            name: name,
            val: val,
            type: type,
            ltx: "\\colour{" + name + "}"
        };
        this._colours[name] = () => this._colours["_" + name].ltx
        // Append Latex Command for New Colour to Macros
        this._macro.push["\\definecolour{" + name + "}{" + type + "}{" + val + "}"];
    };
    // Adds in configuration for a new colour in Latex
    function _addStyle(name, pre, post) {
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
    };

    function init(ltxStream, exportFlag, graphicsPath, colours) {
        this._latex = ltxStream;
        this._export = exportFlag;
        if (colours && colours.length) {
            let i = colours.length;
            while (i--) {
                _addColour(colours[i].name, colours[i].val, colours[i].type);
            }
        }
        // Setup System configuration
        _initSystemConfig(graphicsPath);
        // Setup Macros
        _initDefaultMacros();
        // Establish Styles for Use (Defaults) (extensible)
        _addStyle("bf", "\\textbf{", "}");
        _addStyle("it", "\\emph{", "}");
        _addStyle("ul", "\\ul{", "}");
        _addStyle("st", "\\st{", "}");

        // Establish colours available for use (Defaults) (Extensible)
        _addColour("text", "#000000", "HTML"); // Default Colour
        _addColour("new", "#0000AA", "HTML"); // Revision Highlighting
        _addColour("old", "#AA0000", "HTML"); // Revision Highlighting
        _addColour("eq", "#5533AA", "HTML"); // Equal
        _addColour("neq", "#337711", "HTML"); // Not Equal
    }

    function begin() {
        push("\\begin{document}");
    }

    function end() {
        push("\\end{document}");
    }

    function toPDF() {
        return new Promise((resolve, reject) => {
            let input = latexEngine._sys.concat(latexEngine._macro).concat(latexEngine._latex)
            // Store to this._pdf & return
            try {
                let stream = LTX(input.join("\n"));
                latexEngine._pdf = stream;
                resolve(stream);
            } catch (e) {
                reject(e);
            }
        });
    }

    function toPDF64() {
        return new Promise((resolve, reject) => {
            let input = latexEngine._sys.concat(latexEngine._macro).concat(latexEngine._latex)
            // Store to this._pdf & return
            let stream = LTX(input.join("\n"));
            try {
                let stream = LTX(input.join("\n"));
                latexEngine._pdf64 = stream;
                resolve(stream);
            } catch (e) {
                reject(e);
            }
        });
    }

    function toDVI() {
        // Store to this._dvi & return
        return new Promise((resolve, reject) => {
            let input = this._sys.concat(this._macro).concat(this._latex)
            // Store to this._pdf & return
            try {
                let stream = LTX(input.join("\n"), {
                    format: 'dvi'
                });
                this._dvi = stream;
                resolve(stream);
            } catch (e) {
                reject(e);
            }
        });
    }

    function toLTX() {
        let output = this._sys.concat(this._macro).concat(this._latex)
        this._ltx = output.join("\n");
        return Promise.resolve(output.join("\n"));
    }

    function getPDF() {
        return new Promise((resolve) => {
            let pdfData = [];
            try {
                stream.on('data', (chunk) => {
                    //pdfData.push(chunk.toString("ascii"));
                    pdfData.push(chunk);
                });
                stream.on('end', () => {
                    resolve(pdfData);
                })
            } catch (e) {
                console.error(e);
                reject(e);
            }
        });
    }

    function getDVI() {
        return new Promise((resolve) => {
            let pdfData = [];
            try {
                stream.on('data', (chunk) => {
                    pdfData.push(chunk);
                });
                stream.on('end', () => {
                    resolve(pdfData);
                })
            } catch (e) {
                console.error(e);
                reject(e);
            }
        });
    }

    function getLTX() {
        return String(this._ltx);
    }

    function getPDFStream() {
        return this._pdf;
    }

    function getDVIStream() {
        return this._dvi;
    }

    function push(item) {
        this._latex.push(item);
    }

    function pushIf(condition, item) {
        let itm = condition ? item : "";
        this._latex.push(itm);
    }

    function pushIfElse(condition, item, otheritem) {
        let itm = condition ? item : otheritem;
        this._latex.push(itm);
    }

    function cpush(item) {
        this._latex.push(clean(item));
    }

    function cpushIf(condition, item) {
        let itm = condition ? item : "";
        this._latex.push(clean(itm));
    }

    function cpushIfElse(condition, item, otherItem) {
        let itm = condition ? item : otheritem;
        this._latex.push(clean(itm));
    }

    function pop() {
        return this._latex.pop();
    }

    function popIf(test) {
        if (test) {
            return this._latex.pop();
        }
    }

    function clean(str) {
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
    }

    function compare(one, two) {
        if (one === two) {
            return "eq"
        } else if (two === "") {
            return "one"
        } else if (one === "") {
            return "two"
        } else {
            return "neq"
        }
    }

    function putIf(condition, t_str) {
        return condition ?
            t_str :
            "";
    }

    function putIfElse(condition, t_str, f_str) {
        return condition ?
            t_str :
            f_str;
    }

    function cputIf(condition, t_str) {
        return condition ?
            clean(t_str) :
            "";
    }

    function cputIfElse(condition, t_str, f_str) {
        return condition ?
            clean(t_str) :
            clean(f_str);
    }

    function table(columns, array) {
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
        out.push("\\begin{tabularx}{\\textwidth}{" + coltypes.join("") + "}\n");
        out.push(entries.join("") + "\n");
        out.push("\\end{tabularx}\n\\flushleft")
        push(out.join(""));
    }

    function list(array) {
        let out = ["\\lst\n"];
        for (let i = 0; i < array.length; i++) {
            out.push("{(" + String.fromCharCode(97 + i) + ")}{" + array[i] + "}\n");
        }
        out.push("\\stoplst");
        return out.join("");
    }

    function section(hd) {
        var out = ["\n\\section*{" + hd + "}\n"];
        push(out.join(""));
    }

    function subsection(hd) {
        var out = ["\n\\subsection*{" + hd + "}\n"];
        push(out.join(""));
    }

    function definition(def, txt) {
        var out = ["\\paragraph{\"" + def + "\"}{" + txt + "}\n"];
        push(out.join(""));
    }

    function br() {
        push("\\ \\linebreak\n");
    }

    function np() {
        push("\\pagebreak\n");
    }

    function plain(txt) {
        var out = ["\\noindent " + txt + "\n"];
        push(out.join(""));
    }

    function indent(txt) {
        var out = ["\\indent" + txt + "\n"];
        push(out.join(""));
    }

    function bf(txt) {
        var out = ["\\textbf{" + txt + "}\n"];
        push(out.join(""));
    }

    function ul(txt) {
        var out = ["\\underline{" + txt + "}\n"];
        push(out.join(""));
    }

    function par(bold, txt) {
        push("\\paragraph{" + bold + "}{" + txt + "}\n");
    }

    function enumP(title, txt) {
        var out = ["\\stepcounter{enumcount}\n\\reversemarginpar",
            "\\marginnote{\\textbf{\\theenumcount .}}[0.9cm]\\paragraph{" + title + "}\\nonfrenchspacing " + txt + "\n"
        ];
        push(out.join(""));
    }

    function enumHead(title) {
        var out = ["\\stepcounter{enumheadcount}\n",
            "\\subsubsection*{\\bf ARTICLE \\theenumheadcount\\ -\\ " + title + "}\n"
        ];
        push(out.join(""));
    }

    function floatRightHead(heading) {
        var out = ["\\hfill\\begin{minipage}{\\dimexpr\\textwidth-8cm}\n",
            "\\parfillskip0pt\n\\parindent0pt\n\\fontdimen3\\font.25in\n",
            "\\frenchspacing\n\\bf " + heading + "\n\\end{minipage}\\ ",
            "\\linebreak \\ \\linebreak\\nonfrenchspacing\n"
        ];
        push(out.join(""));
    }

    function floatLeftHead(heading) {
        var out = ["\\begin{minipage}{\\dimexpr\\textwidth-8cm}\n",
            "\\parfillskip0pt\n\\parindent0pt\n\\fontdimen3\\font.25in\n",
            "\\frenchspacing\n\\bf " + heading + "\n\\end{minipage}\\hfill\\ ",
            "\\linebreak \\ \\linebreak\\nonfrenchspacing\n"
        ];
        push(out.join(""));
    }

    function newStyle(text, flags) {
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
    }

    function genFlags() {
        return {
            new: false,
            old: false,
            ul: false,
            cl: false,
            st: false,
            eq: false,
            neq: false,
        };
    }

    function styleAs() {
        return {
            // Highlighted
            new: (revHistory, n) => {
                let index = n ? n : 0;
                return newStyle(revHistory[index], {
                    new: true,
                    ul: true
                });
            },
            // Modified Style Formatting
            neq: (revHistory, n, m) => {
                let ltx = [];
                let newIndex = n ? n : 0;
                let oldIndex = m ? m : 0;
                ltx.push(newStyle(revHistory[oldIndex], {
                    old: true,
                    st: true
                }));
                ltx.push(newStyle(revHistory[newIndex], {
                    new: true,
                    ul: true,
                    cl: true
                }));
                return ltx.join("");
            },
            // Removed Style Formatting
            old: (revHistory, n) => {
                let index = n ? n : 0;
                return newStyle(revHistory[index], {
                    old: true,
                    st: true
                });
            },
            // Equal (unchanged) Formatting
            eq: (v) => {
                return newStyle(v.curr, {
                    eq: true
                });
            },
            // New (cleaned)
            newClean: (revHistory, n) => {
                let index = n ? n : 0;
                return newStyle(revHistory[index], {
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
                ltx.push(newStyle(revHistory[oldIndex], {
                    old: true,
                    st: true,
                    cl: true
                }));
                ltx.push(newStyle(revHistory[newIndex], {
                    new: true,
                    ul: true,
                    cl: true
                }));
                return ltx.join("");
            },

            // Removed (Cleaned)
            oldClean: (revHistory, n) => {
                let index = n ? n : 0;
                return newStyle(revHistory[index], {
                    old: true,
                    st: true,
                    cl: true
                });
            },

            // Equal (Cleaned)
            eqClean: (revHistory, n) => {
                let index = n ? n : 0;
                return newStyle(revHistory[index], {
                    eq: true,
                    cl: true
                });
            }
        }
    }

    function putRev(revHistory, style, n, m) {
        if (m) {
            return styleAs()[style](revHistory, n, m);
        } else {
            return styleAs()[style](revHistory, n);
        }
    }

    function putRevD(rev, style) {
        return styleAs()[style](rev, style, 0);
    }

    return {
        // ----------PROPERTIES--------------
        // =================================>
        _latex: [],
        _export: false,
        _packages: [],
        _macro: [],
        _sys: [],
        _pdf: [],
        _pdf64: [],
        _dvi: [],
        _ltx: [],
        _config: [],
        _styles: [],
        _colours: [],
        _files: [],
        _images: [],
        _watermark: [],
        // ----------MAIN FUNCTIONS----------
        // =================================>
        // Initializes Stream + Setups Flags
        init: init,
        // Begin Document Entry
        begin: begin,
        // End Document Entry
        end: end,
        // ---- FILE COMMAND UTILITIES ----
        // ================================>
        // Generate PDF File
        toPDF: toPDF,
        // Generate base64 Encoded PDF File
        toPDF64: toPDF64,
        // Generate DVI File
        toDVI: toDVI,
        // Generate Latex File
        toLTX: toLTX,
        // Get PDF Chunk Data
        getPDF: getPDF,
        // Get PDF Stream for DVI
        getPDFStream: getPDFStream,
        // Get Stream Object for DVI
        getDVIStream: getDVIStream,
        // Get DVI Data
        getDVI: getDVI,
        getLTX: getLTX,
        // -----STREAM BASED UTILITIES-----
        // ===============================>
        // Push Raw Text into Stream
        push: push,
        // Push If
        pushIf: pushIf,
        // Push If/Else
        pushIfElse: pushIfElse,
        // Push Clean Text into Stream
        cpush: cpush,
        // Clean & Push If
        cpushIf: cpushIf,
        // Push & Clean If/Else
        cpushIfElse: cpushIfElse,
        // Pop Raw Text from Stream
        pop: pop,
        // Pop If
        popIf: popIf,
        // ----- TEXT BASED UTILITIES ------
        // =================================>
        // Cleans Input of all Latex Special Characters
        clean: clean,
        // Returns comparison between two variables
        compare: compare,
        // Conditional Put
        putIf: putIf,
        // If/Else
        putIfElse: putIfElse,
        //  Put
        cputIf: cputIf,
        // If/Else
        cputIfElse: cputIfElse,
        // ----- STRUCTURES & DOCUMENT TEMPLATES ------
        // ===========================================>
        // Generate a Dynamic Table
        table: table,
        // List (for enumerated lists)
        list: list,
        // Section Heading
        section: section,
        // Subsection Heading
        subsection: subsection,
        // Definition
        definition: definition,
        // Line Break
        br: br,
        // New Page
        np: np,
        // Plain Text
        plain: plain,
        // Indented Text
        indent: indent,
        // Bold Font
        bf: bf,
        // Underline
        ul: ul,
        // Paragraph Entry
        par: par,
        // Enumerated Paragraphs (uses counter)
        enum: enumP,
        // Enumerated Heading (uses counter)
        enumHead: enumHead,
        // Floating Title (Right)
        floatRightHead: floatRightHead,
        // Floating Title (Left)
        floatLeftHead: floatLeftHead,
        // ---LATEX FORMATTING & STYLE FUNCTIONS---
        // =======================================>
        // Generate Custom Styles
        newStyle: newStyle,
        // Generate Flags Object for Use (defaults)
        genFlags: genFlags,
        // New Style Formatting
        styleAs: styleAs(),
        // Return Styled Result
        putRev: putRev,
        // Return Styled Result from Direct Input
        putRevD: putRevD,
    }
})();

module.exports = latexEngine;