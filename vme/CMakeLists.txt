#
# CMakeLists.txt
# Created: 2021-03-17, 19:44:48.
# Copyright (C) 2021, Kirill GPRB.
# 
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
#
add_executable(vme "${CMAKE_CURRENT_LIST_DIR}/vme.c")
target_link_libraries(vme vm)

# warning C4996: This function or variable may be unsafe.
target_compile_definitions(vme PRIVATE _CRT_SECURE_NO_WARNINGS=1)
