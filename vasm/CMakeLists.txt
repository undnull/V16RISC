#
# CMakeLists.txt
# Created: 2021-03-18, 00:14:25.
# Copyright (C) 2021, Kirill GPRB.
# 
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
#
set(VASM_ENTRY_FILE "${CMAKE_CURRENT_LIST_DIR}/main.js")
set(VASM_TARGET_FILE "${CMAKE_RUNTIME_OUTPUT_DIRECTORY}/vasm")
add_custom_target(vasm ALL COMMAND nexe -i "${VASM_ENTRY_FILE}" -o "${VASM_TARGET_FILE}")
