/*
 * parser.js
 * Created: 2021-03-17, 21:01:28.
 * Copyright (C) 2021, Kirill GPRB.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
module.exports = function(tokens) {
    let instructions = [];

    for(let i = 0; i < tokens.length; i++) {
        if(tokens[i].type === "semicolon" || tokens[i].type === "newline")
            continue;
        
        let subtokens = [];
        while(i < tokens.length && tokens[i].type !== "semicolon" && tokens[i].type !== "newline")
            subtokens.push(tokens[i++]);

        if(subtokens.length === 0)
            continue;
        
        let instruction = {
            label: null,
            mnemonic: "",
            args: []
        };

        let j = 0;

        if(j + 1 < subtokens.length && subtokens[j].type === "identifier" && subtokens[j + 1].type === "colon") {
            instruction.label = subtokens[j].data;
            j += 2;
        }

        if(j < subtokens.length && subtokens[j].type === "identifier") {
            instruction.mnemonic = subtokens[j].data;
            j++;
        }

        while(j < subtokens.length) {
            let arg = {
                prefix: null,
                data: null
            };

            let k = j;

            if(k < subtokens.length && (subtokens[k].type === "dollar" || subtokens[k].type === "percent")) {
                arg.prefix = subtokens[k].data;
                k++;
            }

            if(k < subtokens.length && (subtokens[k].type === "identifier" || subtokens[k].type === "number")) {
                arg.data = subtokens[k].data;
                k++;
            }

            if(k <= subtokens.length) {
                instruction.args.push(arg);
                j = k + 1;
                continue;
            }

            break;
        }

        instructions.push(instruction);
    }

    return instructions;
};
