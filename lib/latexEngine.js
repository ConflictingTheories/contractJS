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
const latexEngine = (function latexEng() {

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
        this._sys.push("\\batchmode\n\\documentclass{article}\n");
        // Latex Packages
        this._packages = [
            "\\usepackage[english]{babel}",
            "\\usepackage[utf8]{inputenc}",
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
            "\n\\makeatletter",
            "\n\\newcommand{\\lst}{\n\\paragraph{ }\n\\hfill\\begin{minipage}{\\dimexpr\\textwidth-1cm}\n\\begin{description}\n\\setlength\\itemsep{1em}\n\\@lsti\n}\n",
            "\n\\newcommand\\@lsti{\n\\@ifnextchar\\stoplst{\\@lstsend}{\\@lstii}}\n",
            "\n\\newcommand\\@lstii[2]{\n\\@lstiii{#1}{#2}\\hfill\n\\@lsti\n}\n",
            "\n\\newcommand\\@lstiii[2]{\\item[#1]#2\n}\n",
            "\n\\newcommand\\@lstsend[1]{\n\\end{description}\n\\xdef\\tpd{\\the\\prevdepth}\n\\end{minipage}\n}\n",
            "\n\\makeatother"
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
            let input = this._sys.concat(this._macro).concat(this._latex)
            // Store to this._pdf & return
            try {
                let stream = LTX(input.join("\n"));
                this._pdf = stream;
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
        
        // ----------MAIN FUNCTIONS----------
        // =================================>
        // Initializes Stream + Setups Flags
        init: (ltxStream, exportFlag, graphicsPath, colours) => init.apply(this, [ltxStream, exportFlag, graphicsPath, colours]),
        // Begin Document Entry
        begin: () => begin.apply(this),
        // End Document Entry
        end: () => end.apply(this),
        // ---- FILE COMMAND UTILITIES ----
        // ================================>
        // Generate PDF File
        toPDF: () => toPDF.apply(this),
        // Generate DVI File
        toDVI: () => toDVI.apply(this),
        // Generate Latex File
        toLTX: () => toLTX.apply(this),
        // Get PDF Chunk Data
        getPDF: () => getPDF.apply(this),
        // Get PDF Stream
        getPDFStream: () => getPDFStream.apply(this),
        // Get Stream Object for DVI
        getDVIStream: () => getDVIStream.apply(this),
        // Get DVI Data
        getDVI: () => getDVI.apply(this),
        getLTX: () => getLTX.apply(this),
        // -----STREAM BASED UTILITIES-----
        // ===============================>
        // Push Raw Text into Stream
        push: (item) => push.apply(this, [item]),
        // Push If
        pushIf: (condition, item) => pushIf.apply(this, [condition, item]),
        // Push If/Else
        pushIfElse: (condition, item, other) => pushIfElse.apply(this, [condition, item, other]),
        // Push Clean Text into Stream
        cpush: (item) => cpush.apply(this, [item]),
        // Clean & Push If
        cpushIf: (condition, item) => cpushIf.apply(this, [condition, item]),
        // Push & Clean If/Else
        cpushIfElse: (condition, item, other) => cpushIfElse.apply(this, [condition, item, other]),
        // Pop Raw Text from Stream
        pop: () => pop.apply(this),
        // Pop If
        popIf: (condition) => popIf.apply(this, [condition]),
        // ----- TEXT BASED UTILITIES ------
        // =================================>
        // Cleans Input of all Latex Special Characters
        clean: (string) => clean.apply(this, [string]),
        // Returns comparison between two variables
        compare: (one, two) => compare.apply(this, [one, two]),
        // Conditional Put
        putIf: (condition, string) => putIf.apply(this, [condition, string]),
        // If/Else
        putIfElse: (condition, string, other) => putIfElse.apply(this, [condition, string, other]),
        //  Put
        cputIf: (condition, string) => cputIf.apply(this, [condition, string]),
        // If/Else
        cputIfElse: (condition, string, other) => cputIfElse.apply(this, [condition, string, other]),
        // ----- STRUCTURES & DOCUMENT TEMPLATES ------
        // ===========================================>
        // Generate a Dynamic Table
        table: (column, array) => table.apply(this, [column, array]),
        // List (for enumerated lists)
        list: (array) => list.apply(this, [array]),
        // Section Heading
        section: (text) => section.apply(this, [text]),
        // Subsection Heading
        subsection: (text) => subsection.apply(this, [text]),
        // Definition
        definition: (label, def) => definition.apply(this, [label, def]),
        // Line Break
        br: () => br.apply(this),
        // New Page
        np: () => np.apply(this),
        // Plain Text
        plain: (text) => plain.apply(this, [text]),
        // Indented Text
        indent: () => indent.apply(this),
        // Bold Font
        bf: (text) => bf.apply(this, [text]),
        // Underline
        ul: (text) => ul.apply(this, [text]),
        // Paragraph Entry
        par: (text) => par.apply(this, [text]),
        // Enumerated Paragraphs (uses counter)
        enum: (label, text) => enumP.apply(this, [label, text]),
        // Enumerated Heading (uses counter)
        enumHead: (text) => enumHead.apply(this, [text]),
        // Floating Title (Right)
        floatRightHead: (text) => floatRightHead.apply(this, [text]),
        // Floating Title (Left)
        floatLeftHead: (text) => floatLeftHead.apply(this, [text]),
        // ---LATEX FORMATTING & STYLE FUNCTIONS---
        // =======================================>
        // Generate Custom Styles
        newStyle: (text, flags) => newStyle.apply(this, [text, flags]),
        // Generate Flags Object for Use (defaults)
        genFlags: () => genFlags.apply(this),
        // New Style Formatting
        styleAs: () => styleAs.apply(this),
        // Return Styled Result
        putRev: (revHistory, style, n, m) => putRev.apply(this, [revHistory, style, n, m]),
        // Return Styled Result from Direct Input
        putRevD: (revivion, style) => putRevD.apply(this, [revision, style]),

        // ----------PROPERTIES--------------
        // =================================>
        _latex: this._latex,
        _export: this._export,
        _packages: this._packages,
        _macro: this._macro,
        _sys: this._sys,
        _pdf: this._pdf,
        _dvi: this._dvi,
        _ltx: this._ltx,
        _config: this._config,
        _styles: this._styles,
        _colours: this._colours,
        _files: this._files,
        _images: this._images,
        _watermark: this._watermark,
    }
})();

module.exports = latexEngine;