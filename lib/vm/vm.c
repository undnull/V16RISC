/*
 * vm.c
 * Created: 2021-03-17, 16:01:36.
 * Copyright (C) 2021, Kirill GPRB.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
#include <stdlib.h>
#include <string.h>
#include <V16_vm.h>

static inline uint16_t vm_get_word(vm_t *vm)
{
    vm->cycles++;
    return vm->memory[vm->pc++];
}

static int vm_rtr(vm_t *vm, const v16_instr_t *in)
{
    uint16_t *rs_1 = vm->regs + in->rtr.rs_1;
    uint16_t *rs_2 = vm->regs + in->rtr.rs_2;
    uint16_t *rd = vm->regs + in->rtr.rd;

    switch(in->rtr.funct) {
        case V16_FUNCT_MOV:
            *rd = *rs_1;
            break;
        
        case V16_FUNCT_ADD:
            *rd = *rs_1 + *rs_2;
            break;
        
        case V16_FUNCT_SUB:
            *rd = *rs_1 - *rs_2;
            break;
        
        case V16_FUNCT_MUL:
            *rd = *rs_1 * *rs_2;
            break;
        
        case V16_FUNCT_DIV:
            *rd = *rs_2 ? (*rs_1 / *rs_2) : 0;
            break;
        
        case V16_FUNCT_MOD:
            *rd = *rs_2 ? (*rs_1 % *rs_2) : *rs_1;
            break;
        
        case V16_FUNCT_SHL:
            *rd = *rs_1 << *rs_2;
            break;
        
        case V16_FUNCT_SHR:
            *rd = *rs_1 >> *rs_2;
            break;
        
        case V16_FUNCT_AND:
            *rd = *rs_1 & *rs_2;
            break;
        
        case V16_FUNCT_NOT:
            *rd = ~*rs_1;
            break;
        
        case V16_FUNCT_OR:
            *rd = *rs_1 | *rs_2;
            break;
        
        case V16_FUNCT_XOR:
            *rd = *rs_1 ^ *rs_2;
            break;
        
        default:
            return VM_ERROR;
    }

    return VM_OK;
}

static int vm_itr(vm_t *vm, const v16_instr_t *in)
{
    uint16_t *rs = vm->regs + in->itr.rs;
    uint16_t *rd = vm->regs + in->itr.rd;
    uint16_t imm = vm_get_word(vm);

    switch(in->itr.funct) {
        case V16_FUNCT_MOV:
            *rd = imm;
            break;
        
        case V16_FUNCT_ADD:
            *rd = *rs + imm;
            break;
        
        case V16_FUNCT_SUB:
            *rd = *rs - imm;
            break;
        
        case V16_FUNCT_MUL:
            *rd = *rs * imm;
            break;
        
        case V16_FUNCT_DIV:
            *rd = imm ? (*rs / imm) : 0;
            break;
        
        case V16_FUNCT_MOD:
            *rd = imm ? (*rs % imm) : *rs;
            break;
        
        case V16_FUNCT_SHL:
            *rd = *rs << imm;
            break;
        
        case V16_FUNCT_SHR:
            *rd = *rs >> imm;
            break;
        
        case V16_FUNCT_AND:
            *rd = *rs & imm;
            break;
        
        case V16_FUNCT_NOT:
            *rd = ~*rs;
            break;
        
        case V16_FUNCT_OR:
            *rd = *rs | imm;
            break;
        
        case V16_FUNCT_XOR:
            *rd = *rs ^ imm;
            break;
        
        default:
            return VM_ERROR;
    }

    return VM_OK;
}

static int vm_bxx(vm_t *vm, const v16_instr_t *in)
{
    uint16_t *rs_1 = vm->regs + in->bxx.rs_1;
    uint16_t *rs_2 = vm->regs + in->bxx.rs_2;
    uint16_t *rd = vm->regs + in->bxx.rd;

    int jump;
    switch(in->bxx.cond) {
        case V16_COND_UN:
            jump = 1;
            break;
        
        case V16_COND_EQ:
            jump = *rs_1 == *rs_2;
            break;
        
        case V16_COND_NE:
            jump = *rs_1 != *rs_2;
            break;
        
        case V16_COND_GX:
            jump = *rs_1 > *rs_2;
            break;
        
        case V16_COND_GE:
            jump = *rs_1 >= *rs_2;
            break;
        
        case V16_COND_LX:
            jump = *rs_1 < *rs_2;
            break;
        
        case V16_COND_LE:
            jump = *rs_1 <= *rs_2;
            break;

        default:
            return VM_ERROR;        
    }

    if(jump) {
        uint16_t target = vm_get_word(vm);
        if(in->bxx.off)
            target += *rd;
        vm->pc = target;
    }

    return VM_OK;
}

static int vm_mem(vm_t *vm, const v16_instr_t *in)
{
    uint16_t *rs = vm->regs + in->mem.rs;
    uint16_t *rd = vm->regs + in->mem.rd;
    uint16_t target = in->mem.pack ? in->mem.imm : vm_get_word(vm);

    if(in->mem.rw) {
        if(in->mem.off)
            target += *rd;
        vm->memory[target] = *rs;
    }
    else {
        if(in->mem.off)
            target += *rs;
        *rd = vm->memory[target];
    }

    return VM_OK;
}

int vm_open(vm_t *vm)
{
    if(vm->memory)
        return 1;

    memset(vm->regs, 0, sizeof(vm->regs));
    vm->memory = calloc(V16_MEM_SIZE, sizeof(uint16_t));
    vm->cycles = 0;

    return vm->memory != NULL;
}

int vm_close(vm_t *vm)
{
    if(vm->memory) {
        free(vm->memory);
        vm->memory = NULL;
        return 1;
    }
    
    return 0;
}

int vm_step(vm_t *vm)
{
    v16_instr_t in;
    in.word = vm_get_word(vm);

    switch(in.gxx.opcode) {
        case V16_OPCODE_NOP:
            return VM_OK;
        case V16_OPCODE_RTR:
            return vm_rtr(vm, &in);
        case V16_OPCODE_ITR:
            return vm_itr(vm, &in);
        case V16_OPCODE_BXX:
            return vm_bxx(vm, &in);
        case V16_OPCODE_MEM:
            return vm_mem(vm, &in);
        case V16_OPCODE_HLT:
            return VM_HALT;
    }
    
    return VM_ERROR;
}
