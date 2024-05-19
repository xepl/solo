// SPDX: AGPL-3.0-only
/* XEPL Solo Environment - Copyright (c) 2024 Keith Edwin Robbins
	Project Name: XEPL Solo Environment
	File Name:    solo.cc
	Author:       Keith Edwin Robbins
	Release date: May 10, 2024
	Website:      https://xepl.com

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation version 3 of the License.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.

	For more information about the AGPL, please visit:
 	https://www.gnu.org/licenses/agpl-3.0.html
*/

#include "../one/xepl.cc"
#include "../kits/xepl_all_kits.cc"

#include "../one/xepl_defaults.hpp"
#include "../one/xepl_string_tools.hpp"


bool XEPL::Show_Trace          = true;
bool XEPL::Show_Memory_Counts  = true;
bool XEPL::Show_Counters       = true;


int main_brain( XEPL::Text* _command, XEPL::Text* _sys_command )
{
	bool reboot = true;
	do
	{
		XEPL::Cortex cortex ( "brain", std::cout );
		KITS::TIMER::Initialize(100);
		{	
			KITS::OPERATORS::Register_Operator_Kit  ( &cortex );
			KITS::KEYWORDS::Register_Keyword_Kit    ( &cortex );
			KITS::SPLICERS::Register_Splicer_Kit    ( &cortex );
			KITS::SOCKETS::Register_Socket_Kit      ( &cortex );
			KITS::FILES::Register_File_Kit          ( &cortex );
			KITS::TEXT::Register_Text_Kit           ( &cortex );
			KITS::HTTP::Register_Http_Kit           ( &cortex );
			KITS::HTML::Register_Html_Kit           ( &cortex );
			KITS::TIMER::Register_Timer_Kit         ( &cortex );
			KITS::MAIN::Register_Main_Kit           ( &cortex );

			cortex.Register_Mutual ( "trigger",  [] ( XEPL::Nucleus* )          { return static_cast<XEPL::Gene*> ( XEPL::tlsLobe->trigger_atom ); } );
			cortex.Register_Mutual ( "outdex",   [] ( XEPL::Nucleus* )          { return XEPL::tlsLobe->outdex_link; } );
			cortex.Register_Mutual ( "locals",   [] ( XEPL::Nucleus* )          { return XEPL::tlsLobe->locals;      } );
			cortex.Register_Mutual ( "observer", [] ( XEPL::Nucleus* _nucleus ) { return _nucleus->Host()->observer; });
			cortex.Register_Mutual ( "shadows",  [] ( XEPL::Nucleus* _nucleus ) { return _nucleus->Host()->shadows;  });

			cortex.Register_Command ( "Trace",     [] ( XEPL::String* _opt ) { XEPL::Show_Trace          = _opt->compare("off"); });
			cortex.Register_Command ( "Counters",  [] ( XEPL::String* _opt ) { XEPL::Show_Counters       = _opt->compare("off"); });
			cortex.Register_Command ( "Memory",    [] ( XEPL::String* _opt ) { XEPL::Show_Memory_Counts  = _opt->compare("off"); });

			KITS::CLI::Execute_Command( _command );

			system( _sys_command );

			reboot = KITS::CLI::CliLoop(std::cin, std::cout, std::cerr);

			cortex.Close_Cortex();
		}
		KITS::TIMER::Shutdown();

	} while ( reboot );

	return 0;
}


#ifdef _WIN32
int main ( int, char**, char** )
{
	WSADATA wsaData;
	WSAStartup(MAKEWORD(2,2), &wsaData);

	main_brain( "}solo", "cmd /c start http://localhost:8100" );

	WSACleanup();

	return 0;
}
#elif __linux__
int main ( int, char**, char** )
{
	signal ( SIGPIPE, SIG_IGN );

	main_brain( "}solo", "xdg-open http://localhost:8100" );

	return 0;
}
#else
int main ( int argc, char** argv, char** argenv)
{
	signal ( SIGPIPE, SIG_IGN );

	KITS::MAIN::Initialize( argc, argv, argenv );

	main_brain( "}solo", "open http://localhost:8100" );

	return 0;
}
#endif

