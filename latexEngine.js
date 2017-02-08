// Copyright (c) 2017 - Kyle Derby MacInnis
// Any unauthorized distribution or transfer
// of latexEngine work is strictly prohibited.
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
    // Latex Stream (Output)
    _ltx: [],
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
    init: (ltxStream, exportFlag, graphicsPath, colours) => {
        latexEngine._latex = ltxStream;
        latexEngine._export = exportFlag;
        if (colours && colours.length) {
            let i = colours.length;
            while (i--) {
                latexEngine.setColour(colours[i].name, colours[i].val, colours[i].type);
            }
        }
        // Setup System configuration
        latexEngine._initSystemConfig(graphicsPath);
        // Setup Macros
        latexEngine._initDefaultMacros();
        // Establish Styles for Use (Defaults) (extensible)
        latexEngine._addStyle("bf", "\\textbf{", "}");
        latexEngine._addStyle("it", "\\emph{", "}");
        latexEngine._addStyle("ul", "\\ul{", "}");
        latexEngine._addStyle("st", "\\st{", "}");

        // Establish colours available for use (Defaults) (Extensible)
        latexEngine._addColour("text", "#000000", "HTML"); // Default Colour
        latexEngine._addColour("new", "#0000AA", "HTML"); // Revision Highlighting
        latexEngine._addColour("old", "#AA0000", "HTML"); // Revision Highlighting
        latexEngine._addColour("eq", "#5533AA", "HTML"); // Equal
        latexEngine._addColour("neq", "#337711", "HTML"); // Not Equal
    },
    // System Configuration
    _initSystemConfig: (graphicsPath) => {
        // Setup System
        latexEngine._sys.push("\\batchmode\n");
        // Latex Packages
        let packages = [
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
        let config = [
            "\\graphicspath{" + graphicsPath + "}\n",
            "\\setlength{\\parskip}{0em}\n",
            "\\keepXColumns\n",
            "\\newenvironment{frcseries}{\\fontfamily{pzc}\\selectfont}{}\n",
            "\\newcommand{\\textcur}[1]{{\\itshape\\frcseries#1}}\n",
            "\\newcolumntype{g}{>{\\vfill\\centering}X}\n",
            "\\newcolumntype{Y}{>{\\vfill\\RaggedRight\\arraybackslash}X}\n",
            "\\newcolumntype{Z}{>{\\vfill\\centering\\arraybackslash}X}\n",
        ]
        latexEngine._sys = latexEngine._sys.concat(packages).concat(config);
    },
    // Macro Initialization
    _initDefaultMacros: () => {
        // Setup Macros
        let macros = [
            // Necessary Listing Macros
            "\n\\newcommand{\\lst}{\n\\paragraph{ }\n\\hfill\\begin{minipage}{\\dimexpr\\textwidth-1cm}\n\\begin{description}\n\\setlength\\itemsep{1em}\n\\@lsti\n}\n",
            "\n\\newcommand\\@lsti{\n\\@ifnextchar\\stoplst{\\@lstsend}{\\@lstii}}\n",
            "\n\\newcommand\\@lstii[2]{\n\\@lstiii{#1}{#2}\\hfill\n\\@lsti\n}\n",
            "\n\\newcommand\\@lstiii[2]{\\item[#1]#2\n}\n",
            "\n\\newcommand\\@lstsend[1]{\n\\end{description}\n\\xdef\\tpd{\\the\\prevdepth}\n\\end{minipage}\n}\n"
        ];
        latexEngine._macro = latexEngine._macro.concat(macros);
        // Counters
        latexEngine._macro.push("\\newcounter{enumcount}\n");
        latexEngine._macro.push("\\newcounter{enumheadcount}\n");
    },
    // Setup the watermark
    _setWatermark: (text, colour, scale) => {
        // TODO
    },
    // Adds in configuration for a new colour in Latex
    _addColour: (name, val, type) => {
        latexEngine._colours["_" + name] = {
            name: name,
            val: val,
            type: type,
            ltx: "\\colour{" + name + "}"
        };
        latexEngine._colours[name] = () => latexEngine._colours["_" + name].ltx
        // Append Latex Command for New Colour to Macros
        latexEngine._macro.push["\\definecolour{" + name + "}{" + type + "}{" + val + "}"];
    },
    // Adds in configuration for a new colour in Latex
    _addStyle: (name, pre, post) => {
        latexEngine._styles["_" + name] = {
            name: name,
            pre: pre,
            post: post,
            ltx: (text) => {
                return "\\" + name + "{" + text + "}"
            }
        };
        latexEngine._styles[name] = (text) => latexEngine._styles["_" + name].ltx(text);
        // Append Latex Command for New Colour to Macros
        latexEngine._macro.push["\\def\\" + name + "<#1>{" + pre + "#1" + post + "}"];
    },
    // Begin Document Entry
    begin: () => {
        latexEngine._latex.push("\\begin{document}");
    },
    // End Document Entry
    end: () => {
        latexEngine._latex.push("\\end{document}");
    },


    // ---- FILE COMMAND UTILITIES ----
    // ================================>
    // Generate PDF File
    toPDF: () => {
        return new Promise((resolve, reject) => {
            let input = latexEngine._sys.concat(latexEngine._macro).concat(latexEngine._latex)
            // Store to latexEngine._pdf & return
            try {
                let stream = LTX(input.join("\n"));
                resolve(stream);
            } catch (e) {
                reject(e);
            }

            // let pdfData = [];
            // try {
            //     stream.on('data', (chunk) => {
            //         pdfData.push(chunk);
            //     });
            //     stream.on('end', () => {
            //         latexEngine._pdf = pdfData.join("");
            //         //console.log(latexEngine._pdf);
            //         resolve(String(latexEngine._pdf));
            //     })
            // } catch (e) {
            //     console.error(e);
            //     reject(e);
            // }
        });
    },
    // Generate base64 Encoded PDF File
    toPDF64: () => {
        return new Promise((resolve, reject) => {
            let input = latexEngine._sys.concat(latexEngine._macro).concat(latexEngine._latex)
            // Store to latexEngine._pdf & return
            let stream = LTX(input.join("\n"));
            // try {
            //     let stream = LTX(input.join("\n"));
            //     resolve(stream);
            // } catch (e) {
            //     reject(e);
            // }
            let pdfData = [];
            try {
                stream.on('data', (chunk) => {
                    console.log(chunk)
                    //pdfData += chunk;
                    pdfData.push(chunk.toString("ascii"));
                    //pdfData.push(chunk);
                });
                stream.on('end', () => {
                    latexEngine._pdf = pdfData.join("");
                    //latexEngine._pdf = pdfData.join("");
                    resolve(latexEngine.getPDF());
                });
            } catch (e) {
                console.error(e);
                reject(e);
            }
        });
    },
    // Generate DVI File
    toDVI: () => {
        // Store to latexEngine._dvi & return
        return new Promise((resolve, reject) => {
            let input = latexEngine._sys.concat(latexEngine._macro).concat(latexEngine._latex)
            // Store to latexEngine._pdf & return
            try {
                let stream = LTX(input.join("\n"), {
                    format: 'dvi'
                });
                resolve(stream);
            } catch (e) {
                reject(e);
            }
            // let pdfData = [];
            // try {
            //     stream.on('data', (chunk) => {
            //         pdfData.push(chunk);
            //     });
            //     stream.on('end', () => {
            //         latexEngine._dvi = pdfData;
            //         resolve(pdfData);
            //     })
            // } catch (e) {
            //     console.error(e);
            //     reject(e);
            // }
        });
    },
    // Generate Latex File
    toLTX: () => {
        let output = latexEngine._sys.concat(latexEngine._macro).concat(latexEngine._latex)
        latexEngine._ltx = output.join("\n");
        return Promise.resolve(output.join("\n"));
    },
    getPDF: () => {
        return String(latexEngine._pdf);
    },
    getDVI: () => {
        return String(latexEngine._dvi);
    },
    getLTX: () => {
        return String(latexEngine._ltx);
    },
    // -----STREAM BASED UTILITIES-----
    // ===============================>
    // Push Raw Text into Stream
    push: (item) => {
        latexEngine._latex.push(item);
    },
    // Push If
    pushIf: (condition, item) => {
        let itm = condition ? item : "";
        latexEngine._latex.push(itm);
    },
    // Push If/Else
    pushIfElse: (condition, item, otheritem) => {
        let itm = condition ? item : otheritem;
        latexEngine._latex.push(itm);
    },
    // Push Clean Text into Stream
    cpush: (item) => {
        latexEngine._latex.push(latexEngine.clean(item));
    },
    // Clean & Push If
    cpushIf: (condition, item) => {
        let itm = condition ? item : "";
        latexEngine._latex.push(latexEngine.clean(itm));
    },
    // Push & Clean If/Else
    cpushIfElse: (condition, item, otherItem) => {
        let itm = condition ? item : otheritem;
        latexEngine._latex.push(latexEngine.clean(itm));
    },
    // Pop Raw Text from Stream
    pop: () => {
        return latexEngine._latex.pop();
    },
    // Pop If
    popIf: (test) => {
        if (test) {
            return latexEngine._latex.pop();
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
            latexEngine.clean(t_str) :
            "";
    },
    // If/Else
    cputIfElse: (condition, t_str, f_str) => {
        return condition ?
            latexEngine.clean(t_str) :
            latexEngine.clean(f_str);
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
        out.push("\\begin{tabularx}{\\textwidth}{" + coltypes.join("") + "}\n");
        out.push(entries.join("") + "\n");
        out.push("\\end{tabularx}\n\\flushleft")
        latexEngine._push(out.join(""));
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
        latexEngine._latex.push(out.join(""));
    },
    // Subsection Heading
    subsection: (hd) => {
        var out = ["\n\\subsection*{" + hd + "}\n"];
        latexEngine._latex.push(out.join(""));
    },
    // Definition
    definition: (def, txt) => {
        var out = ["\\paragraph{\"" + def + "\"}{" + txt + "}\n"];
        latexEngine._latex.push(out.join(""));
    },
    // Line Break
    br: () => {
        latexEngine.push("\\ \\linebreak\n");
    },
    // New Page
    np: () => {
        latexEngine.push("\\pagebreak\n");
    },
    // Plain Text
    plain: (txt) => {
        var out = ["\\noindent " + txt + "\n"];
        latexEngine._latex.push(out.join(""));
    },
    // Indented Text
    indent: (txt) => {
        var out = ["\\indent" + txt + "\n"];
        latexEngine._latex.push(out.join(""));
    },
    // Bold Font
    bf: (txt) => {
        var out = ["\\textbf{" + txt + "}\n"];
        latexEngine._latex.push(out.join(""));
    },
    // Underline
    ul: (txt) => {
        var out = ["\\underline{" + txt + "}\n"];
        latexEngine._latex.push(out.join(""));
    },
    // Paragraph Entry
    par: (bold, txt) => {
        latexEngine._push("\\paragraph{" + bold + "}{" + txt + "}\n");
    },
    // Enumerated Paragraphs (uses counter)
    enum: (title, txt) => {
        var out = ["\\stepcounter{enumcount}\n\\reversemarginpar",
            "\\marginnote{\\textbf{\\theenumcount .}}[0.9cm]\\paragraph{" + title + "}\\nonfrenchspacing " + txt + "\n"
        ];
        latexEngine._latex.push(out.join(""));
    },
    // Enumerated Heading (uses counter)
    enumHead: (title) => {
        var out = ["\\stepcounter{enumheadcount}\n",
            "\\subsubsection*{\\bf ARTICLE \\theenumheadcount\\ -\\ " + title + "}\n"
        ];
        latexEngine._latex.push(out.join(""));
    },
    // Floating Title (Right)
    floatRightHead: (heading) => {
        var out = ["\\hfill\\begin{minipage}{\\dimexpr\\textwidth-8cm}\n",
            "\\parfillskip0pt\n\\parindent0pt\n\\fontdimen3\\font.25in\n",
            "\\frenchspacing\n\\bf " + heading + "\n\\end{minipage}\\ ",
            "\\linebreak \\ \\linebreak\\nonfrenchspacing\n"
        ];
        latexEngine._latex.push(out.join(""));
    },
    // Floating Title (Left)
    floatLeftHead: (heading) => {
        var out = ["\\begin{minipage}{\\dimexpr\\textwidth-8cm}\n",
            "\\parfillskip0pt\n\\parindent0pt\n\\fontdimen3\\font.25in\n",
            "\\frenchspacing\n\\bf " + heading + "\n\\end{minipage}\\hfill\\ ",
            "\\linebreak \\ \\linebreak\\nonfrenchspacing\n"
        ];
        latexEngine._latex.push(out.join(""));
    },


    // ---LATEX FORMATTING & STYLE FUNCTIONS---
    // =======================================>
    // Generate Custom Styles
    newStyle: (text, flags) => {
        let ltx = [];
        // Determine Colour
        flags.new ? ltx.push(latexEngine._colours.new()) : ltx.push("");
        flags.old ? ltx.push(latexEngine._colours.old()) : ltx.push("");
        flags.eq ? ltx.push(latexEngine._colours.eq()) : ltx.push("");
        flags.neq ? ltx.push(latexEngine._colours.neq()) : ltx.push("");
        // Apply Formatting
        text = flags.cl ? latexEngine.clean(text) : text;
        text = flags.st ? latexEngine._styles.st(text) : text;
        text = flags.bf ? latexEngine._styles.bf(text) : text;
        text = flags.it ? latexEngine._styles.it(text) : text;
        text = flags.ul ? latexEngine._styles.ul(text) : text;
        // Push and Finalize
        ltx.push(text);
        ltx.push(latexEngine._colours.text());
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
            return latexEngine.newStyle(revHistory[index], {
                new: true,
                ul: true
            });
        },
        // Modified Style Formatting
        neq: (revHistory, n, m) => {
            let ltx = [];
            let newIndex = n ? n : 0;
            let oldIndex = m ? m : 0;
            ltx.push(latexEngine.newStyle(revHistory[oldIndex], {
                old: true,
                st: true
            }));
            ltx.push(latexEngine.newStyle(revHistory[newIndex], {
                new: true,
                ul: true,
                cl: true
            }));
            return ltx.join("");
        },
        // Removed Style Formatting
        old: (revHistory, n) => {
            let index = n ? n : 0;
            return latexEngine.newStyle(revHistory[index], {
                old: true,
                st: true
            });
        },
        // Equal (unchanged) Formatting
        eq: (v) => {
            return latexEngine.newStyle(v.curr, {
                eq: true
            });
        },
        // New (cleaned)
        newClean: (revHistory, n) => {
            let index = n ? n : 0;
            return latexEngine.newStyle(revHistory[index], {
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
            ltx.push(latexEngine.newStyle(revHistory[oldIndex], {
                old: true,
                st: true,
                cl: true
            }));
            ltx.push(latexEngine.newStyle(revHistory[newIndex], {
                new: true,
                ul: true,
                cl: true
            }));
            return ltx.join("");
        },

        // Removed (Cleaned)
        oldClean: (revHistory, n) => {
            let index = n ? n : 0;
            return latexEngine.newStyle(revHistory[index], {
                old: true,
                st: true,
                cl: true
            });
        },

        // Equal (Cleaned)
        eqClean: (revHistory, n) => {
            let index = n ? n : 0;
            return latexEngine.newStyle(revHistory[index], {
                eq: true,
                cl: true
            });
        }
    },
    // Return Styled Result
    putRev: (revHistory, style, n, m) => {
        if (m) {
            return latexEngine.styleAs[style](revHistory, n, m);
        } else {
            return latexEngine.styleAs[style](revHistory, n);
        }
    },
    // Return Styled Result from Direct Input
    putRevD: (rev, style) => {
        return latexEngine.styleAs[style](rev, style, 0);
    },
}
module.exports = latexEngine;