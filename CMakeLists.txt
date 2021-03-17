#
# CMakeLists.txt
# Created: 2021-03-17, 16:34:46.
# Copyright (C) 2021, Kirill GPRB.
# 
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
#
cmake_minimum_required(VERSION 3.10)
project(V16 VERSION 0.0.0)

set(CMAKE_C_STANDARD 99)
set(CMAKE_C_STANDARD_REQUIRED ON)

add_library(v16_headers INTERFACE)
target_include_directories(v16_headers INTERFACE "${CMAKE_CURRENT_LIST_DIR}/include")

add_subdirectory(lib/vm)
add_subdirectory(vme)
