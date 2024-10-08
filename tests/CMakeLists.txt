cmake_minimum_required(VERSION 3.15)

project(Exchange_Web_App_Tests)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED True)

find_package(Boost REQUIRED COMPONENTS unit_test_framework system thread coroutine log beast asio)
find_package(unofficial-sqlite3 CONFIG REQUIRED)

add_executable(Exchange_Web_App_tests
    test_main.cpp
    test_money_converter.cpp
    test_server_message_processing.cpp
    ../src/modules/server_message_processing.cpp
    ../src/modules/handling_db.cpp
    ../src/modules/money_converter.cpp
    ../src/modules/password_checker.cpp
    ../src/modules/server_file.cpp
)

target_include_directories(Exchange_Web_App_tests PRIVATE
    ${Boost_INCLUDE_DIRS}
    ${CMAKE_SOURCE_DIR}/../src/modules
)

target_link_libraries(Exchange_Web_App_tests PRIVATE
    Boost::unit_test_framework
    Boost::system
    Boost::thread
    Boost::coroutine
    Boost::log
    Boost::beast
    Boost::asio
    unofficial::sqlite3::sqlite3
)

if (WIN32)
    target_link_libraries(Exchange_Web_App_tests PRIVATE ws2_32)
endif()

set_target_properties(Exchange_Web_App_tests PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY "${CMAKE_SOURCE_DIR}/tests"
    RUNTIME_OUTPUT_DIRECTORY_DEBUG "${CMAKE_SOURCE_DIR}/tests"
    RUNTIME_OUTPUT_DIRECTORY_RELEASE "${CMAKE_SOURCE_DIR}/tests"
)

enable_testing()
add_test(NAME Exchange_Web_App_tests COMMAND ${CMAKE_SOURCE_DIR}/tests/MoneyExchange.exe --log_level=test_suite)
# add_test(NAME Exchange_Web_App_tests COMMAND Exchange_Web_App_tests --log_level=test_suite)
