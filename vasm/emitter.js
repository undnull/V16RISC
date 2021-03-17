/*
 * emitter.js
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
        value |= 1; // V16_OPCODE_RTR
        value |= (funct << 3) & 0xFFFF;
        value |= (rs_1 << 7) & 0xFFFF;
        value |= (rs_2 << 10) & 0xFFFF;
        value |= (rd << 13) & 0xFFFF;
        code.push(value & 0xFF, (value >> 8) & 0xFF);
    };

    const emit_itr = function(funct, rs, rd, imm) {
        let value = 0;
        value |= 2; // V16_OPCODE_ITR
        value |= (funct << 3) & 0xFFFF;
        value |= (rs << 7) & 0xFFFF;
        value |= (rd << 10) & 0xFFFF;
        code.push(value & 0xFF, (value >> 8) & 0xFF);
        code.push(imm & 0xFF, (imm >> 8) & 0xFF);
    };

    const emit_bxx = function(cond, rs_1, rs_2, rd, imm) {
        let value = 0;
        value |= 3; // V16_OPCODE_BXX
        value |= (cond << 3) & 0xFFFF;
        value |= (rs_1 << 6) & 0xFFFF;
        value |= (rs_2 << 9) & 0xFFFF;
        if(rd) {
            value |= (1 << 10) & 0xFFFF; // off
            value |= (rd << 13) & 0xFFFF;
        }
        code.push(value & 0xFF, (value >> 8) & 0xFF);
        code.push(imm & 0xFF, (imm >> 8) & 0xFF);
    };

    const emit_mem = function(rw, rs, rd, imm) {
        let pack = false;
        let value = 0;
        value |= 4; // V16_OPCODE_MEM
        value |= ((rw ? 1 : 0) << 3) & 0xFFFF;
        if((rw && rd) || (!rw || rs))
            value |= (1 << 4) & 0xFFFF;
        value |= (rs << 5) & 0xFFFF;
        value |= (rd << 8) & 0xFFFF;
        if(imm <= 0x0F) {
            value |= (1 << 11) & 0xFFFF;
            value |= (imm << 12) & 0xFFFF;
            pack = true;
        }
        code.push(value & 0xFF, (value >> 8) & 0xFF);
        if(!pack)
            code.push(imm & 0xFF, (imm >> 8) & 0xFF);
    };

    const xtr_mnemonics = {
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

    const bxx_mnemonics = {
        "BXX": 0x00,
        "BEQ": 0x01,
        "BNE": 0x02,
        "BXG": 0x03,
        "BGE": 0x04,
        "BXL": 0x05,
        "BLE": 0x06
    };

    for(let i = 0; i < instructions.length; i++) {
        const mnemonic = instructions[i].mnemonic.toUpperCase();

        // RTR or ITR instruction
        const xtr = xtr_mnemonics[mnemonic];
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

            continue;
        }

        // BXX
        const bxx = bxx_mnemonics[mnemonic];
        if(bxx !== undefined) {
            if(bxx === 0x00) {
                if(instructions[i].args[0].prefix === '%') {
                    const rd = parseInt(/[rR]([0-7])/.exec(instructions[i].args[0].data)[1]);
                    emit_bxx(bxx, 0, 0, rd, instructions[i].args[1].data);
                }
                else emit_bxx(bxx, 0, 0, null, instructions[i].args[0].data);
            }
            else {
                const rs1 = parseInt(/[rR]([0-7])/.exec(instructions[i].args[0].data)[1]);
                const rs2 = parseInt(/[rR]([0-7])/.exec(instructions[i].args[1].data)[1]);
                if(instructions[i].args[2].prefix === '%') {
                    const rd = parseInt(/[rR]([0-7])/.exec(instructions[i].args[2].data)[1]);
                    emit_bxx(bxx, rs1, rs2, rd, instructions[i].args[3].data);
                }
                else emit_bxx(bxx, rs1, rs1, null, instructions[i].args[2].data);
            }

            continue;
        }

        // MRX
        if(mnemonic === "MRX") {
            if(instructions[i].args[0].prefix === '%') {
                const rs = parseInt(/[rR]([0-7])/.exec(instructions[i].args[0].data)[1]);
                const rd = parseInt(/[rR]([0-7])/.exec(instructions[i].args[2].data)[1]);
                emit_mem(false, rs, rd, instructions[i].args[1].data);
            }
            else {
                const rd = parseInt(/[rR]([0-7])/.exec(instructions[i].args[1].data)[1]);
                emit_mem(true, null, rd, instructions[i].args[0].data);
            }
            continue;
        }

        // MWX
        if(mnemonic === "MWX") {
            const rs = parseInt(/[rR]([0-7])/.exec(instructions[i].args[0].data)[1]);
            if(instructions[i].args[1].prefix === '%') {
                const rd = parseInt(/[rR]([0-7])/.exec(instructions[i].args[1].data)[1]);
                emit_mem(true, rs, rd, instructions[i].args[2].data);
            }
            else emit_mem(true, rs, null, instructions[i].args[1].data);
            continue;
        }

        if(mnemonic === "HLT") {
            let value = 0;
            value |= 5; // V16_OPCODE_HLT
            code.push(value & 0xFF, (value >> 8) & 0xFF);
            continue;
        }

        throw "Unknown mnemonic: " + mnemonic;
    }

    return Buffer.from(code);
};
