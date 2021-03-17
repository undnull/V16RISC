/*
 * codegen.js
 * Created: 2021-03-17, 21:37:28.
 * Copyright (C) 2021, Kirill GPRB.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
module.exports = function(instructions) {
    let code = [];

    const emit_rtr = function(funct, rs_1, rs_2, rd) {
        let value = 0;
        value |= (1 << 0); // V16_OPCODE_RTR
        value |= (funct << 3) & 0xFFFF;
        value |= (rs_1 << 7) & 0xFFFF;
        value |= (rs_2 << 10) & 0xFFFF;
        value |= (rd << 13) & 0xFFFF;
        code.push(value & 0xFF, (value >> 8) & 0xFF);
    };

    const emit_itr = function(funct, rs, rd, imm) {
        let value = 0;
        value |= (2 << 0); // V16_OPCODE_ITR
        value |= (funct << 3) & 0xFFFF;
        value |= (rs << 7) & 0xFFFF;
        value |= (rd << 10) & 0xFFFF;
        code.push(value & 0xFF, (value >> 8) & 0xFF);
        code.push(imm & 0xFF, (imm >> 8) & 0xFF);
    }

    const xtr_functs = {
        "MOV": 0x00,
        "ADD": 0x01,
        "SUB": 0x02,
        "MUL": 0x03,
        "DIV": 0x04,
        "MOD": 0x05,
        "SHL": 0x06,
        "SHR": 0x07,
        "AND": 0x08,
        "NOT": 0x09,
        "OR": 0x0A,
        "XOR": 0x0B
    };

    for(let i = 0; i < instructions.length; i++) {
        const mnemonic = instructions[i].mnemonic.toUpperCase();

        // RTR or ITR instruction
        const xtr = xtr_functs[mnemonic];
        if(xtr !== undefined) {
            // these two have only two operands...
            if(xtr === 0x00 || xtr === 0x09) {
                const rd = parseInt(/[rR]([0-7])/.exec(instructions[i].args[1].data)[1]);
                if(instructions[i].args[0].prefix !== '$') {
                    const rs = parseInt(/[rR]([0-7])/.exec(instructions[i].args[0].data)[1]);
                    emit_rtr(xtr, rs, 0, rd);
                }
                else emit_itr(xtr, 0, rd, instructions[i].args[0].data);
            }
            // and others have three
            else {
                const rs = parseInt(/[rR]([0-7])/.exec(instructions[i].args[0].data)[1]);
                const rd = parseInt(/[rR]([0-7])/.exec(instructions[i].args[2].data)[1]);
                if(instructions[i].args[1].prefix !== '$') {
                    const rs2 = parseInt(/[rR]([0-7])/.exec(instructions[i].args[1].data)[1]);
                    emit_rtr(xtr, rs, rs2, rd);
                }
                else emit_itr(xtr, rs, rd, instructions[i].args[1].data);
            }
        }

        if(instructions[i].mnemonic.toUpperCase() === "HLT") {
            code.push(5, 0);
            continue;
        }
    }

    return Buffer.from(code);
};
