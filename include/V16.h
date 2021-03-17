/*
 * V16.h
 * Created: 2021-03-17, 12:29:28.
 * Copyright (C) 2021, Kirill GPRB.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
#ifndef __V16_H__
#define __V16_H__ 1
#include <stddef.h>
#include <stdint.h>

/**
 * GXX:
 *  nop
 *
 * RTR:
 *  mov %r10, %r11          funct = 0, rs1 = 10, rs2 = 00, rd = 11
 *  add %r10, %r11, %r12    funct = 1, rs1 = 10, rs2 = 11, rd = 12
 *  shl %r10, %r11, %r13    funct = X, rs1 = 10, rs2 = 11, rd = 13
 * 
 * ITR:
 *  mov $1000, %r11         funct = 0, rs = 00, imm = 1000, rd = 11
 *  add %r11, $337, %r11    funct = 1, rs = 11, imm = 337, rd = 11
 *  shl %r11, $1, %r11      funct = X, rs = 11, imm = 1, rd = 11
 * 
 * BXX:
 *  bxx $0xF000             cond = 0, rs1 = 0, rs2 = 0, off = 0, rd = 0, imm = 0xF000
 *  bxe %r10, %r11, $0xF000 cond = 1, rs1 = 10, rs2 = 11, off = 0, rd = 0, imm = 0xF000
 *  bxx $0xF000, %r15       cond = 0, rs1 = 0, rs2 = 0, off = 1, rd = 15, imm = 0xF000
 * 
 * MEM:
 *  mrx $0xF000, %r10       rw = 0, off = 0, rs = 0, rd = 10, pack = 0, imm = 0xF000
 *  mwx %r11, %r10, $0xF000 rw = 1, rs = 11, off = 1, rd = 10, pack = 0, imm = 0xF000
 */
typedef union {
    uint16_t word;
    struct {
        uint16_t opcode : 3;
        uint16_t data   : 13;
    } gxx;
    struct {
        uint16_t opcode : 3;
        uint16_t funct  : 4;
        uint16_t rs_1   : 3;
        uint16_t rs_2   : 3;
        uint16_t rd     : 3;
    } rtr;
    struct {
        uint16_t opcode : 3;
        uint16_t funct  : 4;
        uint16_t rs     : 3;
        uint16_t rd     : 3;
        uint16_t zero   : 3;
    } itr;
    struct {
        uint16_t opcode : 3;
        uint16_t cond   : 3;
        uint16_t rs_1   : 3;
        uint16_t rs_2   : 3;
        uint16_t off    : 1;
        uint16_t rd     : 3;
    } bxx;
    struct {
        uint16_t opcode : 3;
        uint16_t rw     : 1;
        uint16_t off    : 1;
        uint16_t rs     : 3;
        uint16_t rd     : 3;
        uint16_t pack   : 1;
        uint16_t imm    : 4;
    } mem;
} v16_instr_t;

#define V16_OPCODE_NOP  0x00
#define V16_OPCODE_RTR  0x01
#define V16_OPCODE_ITR  0x02
#define V16_OPCODE_BXX  0x03
#define V16_OPCODE_MEM  0x04
#define V16_OPCODE_HLT  0x05

#define V16_FUNCT_MOV   0x00
#define V16_FUNCT_ADD   0x01
#define V16_FUNCT_SUB   0x02
#define V16_FUNCT_MUL   0x03
#define V16_FUNCT_DIV   0x04
#define V16_FUNCT_MOD   0x05
#define V16_FUNCT_SHL   0x06
#define V16_FUNCT_SHR   0x07
#define V16_FUNCT_AND   0x08
#define V16_FUNCT_NOT   0x09
#define V16_FUNCT_OR    0x0A
#define V16_FUNCT_XOR   0x0B

#define V16_COND_UN     0x00
#define V16_COND_EQ     0x01
#define V16_COND_NE     0x02
#define V16_COND_XG     0x03
#define V16_COND_GE     0x04
#define V16_COND_XL     0x05
#define V16_COND_LE     0x06

#define V16_REG_R0      0x00
#define V16_REG_R1      0x01
#define V16_REG_R2      0x02
#define V16_REG_R3      0x03
#define V16_REG_R4      0x04
#define V16_REG_R5      0x05
#define V16_REG_R6      0x06
#define V16_REG_R7      0x07
#define V16_REG_COUNT   0x08

#define V16_MEM_SIZE    0x10000

#endif
