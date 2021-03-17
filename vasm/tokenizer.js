/*
 * tokenizer.js
 * Created: 2021-03-17, 20:15:26.
 * Copyright (ppstr[i]) 2021, Kirill GPRB.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
module.exports = function(instr) {
    const ppstr = instr
        .replace(/\/\/.+$/gm, "")
        .replace(/0[xX]([A-Fa-f0-9]+)/gm, (_ss, g0) => parseInt(g0, 16))
        .replace(/0[bB]([01]+)/gm, (_ss, g0) => parseInt(g0, 2));
    
    let tokens = [];

    for(let i = 0; i < ppstr.length; i++) {
        if(ppstr[i] === ':') {
            tokens.push({
                type: "colon",
                data: ppstr[i]
            });
            continue;
        }

        if(ppstr[i] === '$') {
            tokens.push({
                type: "dollar",
                data: ppstr[i]
            });
            continue;
        }

        if(ppstr[i] === '%') {
            tokens.push({
                type: "percent",
                data: ppstr[i]
            });
            continue;
        }

        if(ppstr[i] === ',') {
            tokens.push({
                type: "comma",
                data: ppstr[i]
            });
            continue;
        }

        if(ppstr[i] === ';') {
            tokens.push({
                type: "semicolon",
                data: ppstr[i]
            });
            continue;
        }

        if(/[\r\n]/.test(ppstr[i])) {
            tokens.push({
                type: "newline",
                data: null
            });
            continue;
        }

        if(ppstr[i] === '(' || ppstr[i] === ')') {
            tokens.push({
                type: "parenthesis",
                data: ppstr[i]
            });
            continue;
        }

        if(/[A-Za-z_]/.test(ppstr[i])) {
            let data = ppstr[i];
            while(i + 1 < ppstr.length && /[A-Za-z0-9_]/.test(ppstr[i + 1]))
                data += ppstr[++i];
            tokens.push({
                type: "identifier",
                data: data
            });
            continue;
        }

        if(/[0-9]/.test(ppstr[i])) {
            let data = ppstr[i];
            while(i + 1 < ppstr.length && /[0-9]/.test(ppstr[i + 1]))
                data += ppstr[++i];
            tokens.push({
                type: "number",
                data: parseInt(data)
            });
            continue;
        }

        if(/\s/.test(ppstr[i])) {
            // ignore whitespace
            continue;
        }
    }

    return tokens;
};
