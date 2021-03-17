/*
 * V16_vm.h
 * Created: 2021-03-17, 15:59:30.
 * Copyright (C) 2021, Kirill GPRB.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
#ifndef __V16_VM_H__
#define __V16_VM_H__ 1
#include <V16.h>

#define VM_OK       1
#define VM_HALT     2
#define VM_ERROR    3

typedef struct {
    uint16_t regs[V16_REG_COUNT];
    uint16_t *memory;
    uint16_t pc;
    size_t cycles;
} vm_t;

int vm_open(vm_t *vm);
int vm_close(vm_t *vm);
int vm_step(vm_t *vm);

#endif
