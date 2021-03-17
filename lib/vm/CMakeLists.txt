#
# CMakeLists.txt
# Created: 2021-03-17, 18:52:56.
# Copyright (C) 2021, Kirill GPRB.
# 
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
#
add_library(vm STATIC "${CMAKE_CURRENT_LIST_DIR}/vm.c")
target_link_libraries(vm v16_headers)
