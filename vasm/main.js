/*
 * main.js
 * Created: 2021-03-17, 20:17:46.
 * Copyright (C) 2021, Kirill GPRB.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
const fs = require("fs");
const tokenize = require("./tokenizer.js")
const parse = require("./parser.js");
const emit = require("./emitter.js");

const asm = `
mov $0xABCD, %r0
mwx %r0, $0x1000
mov $0x0FFF, %r0
mrx %r0, $1, %r1
hlt
`;

const ofs = fs.createWriteStream("emit.bin");
ofs.write(emit(parse(tokenize(asm))));
ofs.end();

//const tokens = tokenize(asm);
//console.log(tokens);
