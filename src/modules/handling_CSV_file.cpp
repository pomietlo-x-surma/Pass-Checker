#include <sstream>
#include <fstream>
#include <string>
#include <iostream>
#include "handling_CSV_file.hpp"
#include "money_converter.hpp"
#include <vector>
#include <array>
#include <thread>
#include <sqlite3.h>

bool is_file_empty(const std::string& path){
	std::ifstream file(path, std::ios::binary | std::ios::ate);
	return file.tellg() == 0;

}

//This function generates "currencies.csv" and writes starting currencies e.g. PLN USD, 3.9 [base64]
void currency_generation()
{
	std::ofstream outfile(path_to_currencies_csv, std::ios_base::app);
	std::array<std::string, 3> currencies = { "USD", "EUR", "PLN" };
	for (const auto& first : currencies)
	{
		for (const auto& second : currencies)
		{
			if (first != second)
			{
				std::string c1 = currency_comparison(first, second);
				std::string c2 = currency_comparison(first, second, true);
				outfile << first << " " << second << ',' << c1 + " " + c2 << '\n';
			}
		}
	}
	outfile.close();
}

//This function updates every row without creating new file every 10s (using a thread)
void currency_update()
{
	if (is_file_empty(path_to_currencies_csv)) {
		currency_generation();
	}
	while (true)
	{
		bool found = false;
		std::ifstream infile(path_to_currencies_csv);
		std::vector<std::string> lines;
		std::string line;
		std::array<std::string, 3> currencies = { "dollar", "euro", "zloty" };
		for (const auto& first : currencies)
		{
			for (const auto& second : currencies)
			{
				std::this_thread::sleep_for(std::chrono::seconds(10));
				if (first != second)
				{
					while (std::getline(infile, line))
					{
						//reading the file
						std::stringstream ss(line);
						std::string line_first, line_second;
						ss >> line_first >> line_second;
						if (line_first == first && line_second == second)
						{
							//getting currency and chart and writing it to a vector
							std::string c1 = currency_comparison(first, second);
							std::string c2 = currency_comparison(first, second, true);
							std::string result = first + " " + second + c1 + " " + c2 + '\n';
							lines.push_back(result);
							found = true;
						}
						else
						{
							lines.push_back(line);
						}
					}
				}
			}
		}
		infile.close();

		//writing vector to a file
		std::ofstream outfile(path_to_currencies_csv, std::ios_base::trunc);
		for (const auto& updated_line : lines)
		{
			outfile << updated_line << '\n';
		}
		outfile.close();
	}
}

//Writing email, login and password to a new-created user
void write_logs_to_file_user_auth(const std::string& email, const std::string& login, const std::string& password,
	const std::string& file_path)
{
	sqlite3* db;
	sqlite3_stmt* stmt;

	int rc = sqlite3_open(path_to_database_db, &db);

	const char* sql_insert = "INSERT INTO user_auth (EMAIL, LOGIN, PASSWORD) VALUES (?, ?, ?);";
	rc = sqlite3_prepare_v2(db, sql_insert, -1, &stmt, 0);

	sqlite3_bind_text(stmt, 1, email.c_str(), -1, SQLITE_STATIC);
	sqlite3_bind_text(stmt, 2, login.c_str(), -1, SQLITE_STATIC);
	sqlite3_bind_text(stmt, 3, password.c_str(), -1, SQLITE_STATIC);

	rc = sqlite3_step(stmt);

	sqlite3_finalize(stmt);
	sqlite3_close(db);

	std::ofstream file(file_path, std::ios_base::app);
	file << email << ' ' << login << ' ' << password << '\n';
	file.close();
}

//writing balance of a new user or updating its balance
void write_logs_to_file_user_balance(const std::string& login, const std::string& dollar, const std::string& euro, const std::string& zloty, bool reg){
	sqlite3* db;
	sqlite3_stmt* stmt;
	int rc = sqlite3_open(path_to_database_db, &db);
	if (rc != SQLITE_OK) {
		std::cerr << "Cannot open database: " << sqlite3_errmsg(db) << std::endl;
		return;
	}

	const char* sql;
	if (reg) {
		sql = "INSERT INTO user_balance (LOGIN, USD, EUR, PLN) VALUES (?, ?, ?, ?);";
	}
	else {
		sql = "UPDATE user_balance SET USD = ?, EUR = ?, PLN = ? WHERE LOGIN = ?;";
	}

	rc = sqlite3_prepare_v2(db, sql, -1, &stmt, 0);
	if (rc != SQLITE_OK) {
		std::cerr << "Failed to prepare statement: " << sqlite3_errmsg(db) << std::endl;
		sqlite3_close(db);
		return;
	}

	if (reg) {
		sqlite3_bind_text(stmt, 1, login.c_str(), -1, SQLITE_STATIC);
		sqlite3_bind_text(stmt, 2, dollar.c_str(), -1, SQLITE_STATIC);
		sqlite3_bind_text(stmt, 3, euro.c_str(), -1, SQLITE_STATIC);
		sqlite3_bind_text(stmt, 4, zloty.c_str(), -1, SQLITE_STATIC);
	}
	else {
		sqlite3_bind_text(stmt, 1, dollar.c_str(), -1, SQLITE_STATIC);
		sqlite3_bind_text(stmt, 2, euro.c_str(), -1, SQLITE_STATIC);
		sqlite3_bind_text(stmt, 3, zloty.c_str(), -1, SQLITE_STATIC);
		sqlite3_bind_text(stmt, 4, login.c_str(), -1, SQLITE_STATIC);
	}

	rc = sqlite3_step(stmt);
	if (rc != SQLITE_DONE) {
		std::cerr << (reg ? "Error executing SQL insert statement: " : "Error executing SQL update statement: ")
			<< sqlite3_errmsg(db) << std::endl;
	}




	std::string new_entry = login + ' ' + dollar + ' ' + euro + ' ' + zloty + '\n';
	if (reg)
	{
		std::ofstream file(path_to_user_balance_csv, std::ios_base::app);
		file << new_entry;
		file.close();
	}
	else
	{
		std::ifstream infile(path_to_user_balance_csv);
		std::vector<std::string> lines;
		std::string line;
		bool found = false;

		while (std::getline(infile, line))
		{
			std::stringstream ss(line);
			std::string login_infile;
			std::getline(ss, login_infile, ' ');
			if (login_infile == login)
			{
				lines.push_back(new_entry + "X");
				found = true;
			}
			else
			{
				lines.push_back(line + '\n');
			}
		}

		infile.close();

		if (found)
		{
			std::ofstream outfile(path_to_user_balance_csv, std::ios_base::trunc);
			for (const auto& updated_line : lines)
			{
				outfile << updated_line;
			}
			outfile.close();
		}
	}
	sqlite3_finalize(stmt);
	sqlite3_close(db);
}


std::string read_logs_user_auth(const std::string& logs)
{
	std::ifstream infile(path_to_user_auth_csv);
	std::string line;

	while (std::getline(infile, line))
	{
		std::string email, login, pass;
		std::stringstream ss(line);
		ss << email << login << pass;
		if (email == logs)
		{
			return logs;
		}
	}

	return "";
}
std::string read_logs_currencies(const std::string& logs)
{
	std::ifstream infile(path_to_currencies_csv);
	std::string line, log;

	while (std::getline(infile, line))
	{
		std::stringstream ss(line);
		std::string login_infile;
		std::getline(ss, login_infile, ',');
		std::getline(ss, log);
		if (login_infile == logs)
		{
			std::getline(ss, log);
			return log;
		}
	}

	return "";
}

std::string read_logs_user_balance(const std::string& logs)
{
	std::ifstream infile(path_to_user_balance_csv);
	std::string line, log;
	while (std::getline(infile, line))
	{
		std::stringstream ss(line);
		std::string login_infile;
		std::getline(ss, login_infile, ' ');
		std::getline(ss, log);
		if (login_infile == logs)
		{
			std::getline(ss, log);
			return log;
		}
	}
	return "";
}



std::string correct_password_check(const std::string& input_email, const std::string& input_pass,
	const std::string& file_path)
{
	;
	std::ifstream file(file_path);
	std::string line;
	while (std::getline(file, line))
	{
		std::stringstream ss(line);
		std::string stored_email, stored_login, stored_pass;
		ss >> stored_email >> stored_login >> stored_pass;
		if ((stored_email == input_email) && (stored_pass == input_pass))
		{
			file.close();
			return stored_login;
		}
	}
	file.close();
	return "";
}

//checking if a user already exists
bool check_login_email_existence(const std::string& email, const std::string& login, const std::string& file_path)
{
	;
	std::string line, stored_email, stored_login, stored_pass;
	std::ifstream file(file_path);
	while (std::getline(file, line))
	{
		std::stringstream ss(line);
		ss >> stored_email >> stored_login >> stored_pass;
		if (stored_login == login || stored_email == email)
		{
			return true;
		}
	}
	return false;
}
