/*
 * vme.c
 * Created: 2021-03-17, 19:11:25.
 * Copyright (C) 2021, Kirill GPRB.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
#include <ctype.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <V16_vm.h>

static void pretty_print(uint16_t word)
{
    uint8_t lo = (word >> 8) & 0xFF;
    uint8_t hi = word & 0xFF;
    printf("%04X  %02X %02X  %c%c\n", word, hi, lo, isprint(hi) ? hi : '.', isprint(lo) ? lo : '.');
}

int main(int argc, char **argv)
{
    if(argc < 2) {
        fprintf(stderr, "fatal: too few arguments!\n");
        return 1;
    }

    FILE *fp = fopen(argv[1], "rb");
    if(!fp) {
        fprintf(stderr, "fatal: can't fopen %s!\n", argv[1]);
        return 1;
    }

    size_t buf_size;
    fseek(fp, 0, SEEK_END);
    buf_size = (size_t)ftell(fp) / sizeof(uint16_t);
    fseek(fp, 0, SEEK_SET);

    uint16_t *buf = calloc(buf_size, sizeof(uint16_t));
    if(!buf) {
        fclose(fp);
        fprintf(stderr, "fatal: can't calloc!\n");
        return 1;
    }

    fread(buf, sizeof(uint16_t), buf_size, fp);
    fclose(fp);

    printf("read %zu bytes (%zu words)\n", buf_size * sizeof(uint16_t), buf_size);

    if(buf_size > V16_MEM_SIZE) {
        fprintf(stderr, "warning: clamping %zu to %u\n", buf_size, V16_MEM_SIZE);
        buf_size = V16_MEM_SIZE;
    }

    vm_t vm = { 0 };
    if(!vm_open(&vm)) {
        free(buf);
        fprintf(stderr, "fatal: can't vm_open!\n");
        return 1;
    }

    memcpy(vm.memory, buf, sizeof(uint16_t) * buf_size);
    free(buf);
    buf = NULL;

    for(;;) {
        char command[16] = { 0 };
        printf("vme: ");
        scanf("%15s", command);

        if(!strcmp(command, "exit"))
            break;

        if(!strcmp(command, "step")) {
            int result = vm_step(&vm);
            if(result == VM_ERROR)
                fprintf(stderr, "VM_ERROR returned\n");
            continue;
        }

        if(!strcmp(command, "run")) {
            int r;
            while((r = vm_step(&vm)) == VM_OK);
            if(r == VM_ERROR)
                fprintf(stderr, "VM_ERROR returned\n");
            continue;
        }

        if(!strcmp(command, "reset")) {
            vm.cycles = 0;
            vm.pc = 0;
            continue;
        }

        if(!strcmp(command, "regdump")) {
            for(size_t i = 0; i < V16_REG_COUNT; i++) {
                printf("R%01zd:  ", i);
                pretty_print(vm.regs[i]);
            }
            printf("PC:  ");
            pretty_print(vm.pc);
            continue;
        }

        if(!strcmp(command, "memdump")) {
            size_t start, end;
            printf(" from: "); scanf("%4zx", &start);
            printf(" to: "); scanf("%4zx", &end);

            for(size_t i = start; i <= end; i++) {
                printf("%04zX  ", i);
                pretty_print(vm.memory[i % V16_MEM_SIZE]);
            }
            continue;
        }
    }

    vm_close(&vm);
    return 0;
}
