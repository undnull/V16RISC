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
beq %r0, %r1, $0x0003
hlt
mov $1000, %r0
mov $337, %r1
add %r0, %r1, %r2
mov $1337, %r6
beq %r6, %r2, %r2, $0
hlt
`;

const ofs = fs.createWriteStream("emit.bin");
ofs.write(emit(parse(tokenize(asm))));
ofs.end();

//const tokens = tokenize(asm);
//console.log(tokens);
