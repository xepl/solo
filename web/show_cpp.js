// SPDX: AGPL-3.0-only
/* XEPL Solo Environment - Copyright (c) 2024 Keith Edwin Robbins
	Project Name: XEPL Solo Environment
	File Name:    show_cpp.cc
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

function Show_cpp(targetDiv, data) {
	const cortexRegistrationPattern = / (\w+)_([\w]+) ( XEPL::Cortex* _cortex )$/gm;
	const namespaceClassPattern = /([A-Za-z_][A-Za-z0-9_]*::([A-Za-z_][A-Za-z0-9_]::)*)/g;
	const uppercaseWithUnderscorePattern = /(\s[A-Z_]*_[A-Z]+[A-Z_]*(\s|$|,))/g;
	
	function colorCaps(inputString) {
		if (cortexRegistrationPattern.test(inputString)) {
			inputString = inputString.replace(cortexRegistrationPattern, function(match, prefix, methodName) {
				return ` <span data-id="${prefix}_${methodName}" data-group="${prefix}">${prefix}_${methodName}</span> ( XEPL::Cortex* _cortex )`;
			});
		}
	
		if (uppercaseWithUnderscorePattern.test(inputString)) {
			inputString = inputString.replace(uppercaseWithUnderscorePattern, '<b>$1</b>');
		}
		
		if (namespaceClassPattern.test(inputString)) {
			inputString = inputString.replace(namespaceClassPattern, '<i>$1</i>');
		}
		
		return inputString;
	}

	function processLine(line, lineNumber ) {
		line = line.replace(/</g, '&lt;').replace(/>/g, '&gt;');
	
		const cppKeywords = [
		"auto",  "case", "const", "continue", "default", "do",
		"else", "enum", "extern", "float", "for", "goto", "if", "inline",
		"register", "sizeof", "static", "struct", "switch",
		"typedef", "union", "volatile", "while", 
		"try", "catch", "throw",  
		"friend", "operator", "template", "typename", "namespace", "using"
		];
	
		const cppTypes = [
		"int", "long", "float", "double", "char", "bool", "void", "std::string", "wchar_t",
		"short", "unsigned", "signed", "size_t"
		];
	
		const cppStdLib = [
		"cin", "cout", "cerr", "clog", "endl", "begin", "end", "std"
		];

		const dynamicLib = [
			"new", "delete", "retain_count", "Release", "Detach", "Destroy", "nullptr", "malloc", "free"
		];

		const softWords = [
			"class", "public", "private", "protected", "explicit"
		];

		const hardwords = [
			"true", "false", "break", "return", "virtual", "override"
		];

		const specialWords = [
			"tlsLobe", "XEPL::tlsLobe"
		];
	
		let allKeywords = [
		...cppKeywords,
		...cppTypes,
		...cppStdLib,
		...dynamicLib,
		...hardwords,
		...specialWords
		];
	
		let result = "";
		let buffer = "";
		let state = "normal";
	
		for (let i = 0; i < line.length; ++i) {
			const c = line[i];
			switch (state) {
				case "normal":
					if (c.match(/[a-zA-Z_]/)) { buffer = c; state = "keyword"; }
					else if (c === '{' || c === '}') { result += `<span style="color: brown;">${c}</span>`; }
					else if (c === '"' || c === "'") { buffer = c; state = "string"; }
					else if (c.match(/[0-9]/)) { buffer = c; state = "number"; }
					else if (c === '/' && line[i+1] === '/') { buffer = c+c; i++; state = "comment"; }
					else if (c === '#' && line.substring(i, i + 8) === "#include") { result += "#include "; i += 8; state = "include"; }
					else { result += c; }
					break;
				case "string":
					buffer += c;
					if (c === buffer[0]) { result += `<span style="color: orange;">${buffer}</span>`; buffer = ""; state = "normal"; }
					break;
				case "keyword":
					if (c.match(/[a-zA-Z0-9_]/)) 
					{ buffer += c; }
					else if (c === ':' && line[i + 1] === ':') 
					{ buffer += '::'; i++; }
					else {
						if (cppKeywords.includes(buffer)) {
							result += `<span style="color: blue;">${buffer}</span>`;
						} else if (cppTypes.includes(buffer)) {
							result += `<span style="color: green;">${buffer}</span>`;
						} else if (cppStdLib.includes(buffer)) {
							result += `<span style="color: purple;">${buffer}</span>`;
						} else if (dynamicLib.includes(buffer)) {
							result += `<span style="color: tomato;">${buffer}</span>`;
						} else if (hardwords.includes(buffer)) {
							result += `<span style="color: red;">${buffer}</span>`;
						} else if (specialWords.includes(buffer)) {
							result += `<span style="color: cyan;">${buffer}</span>`;
						} else if (softWords.includes(buffer)) {
							result += `<span style="color: lightblue;">${buffer}</span>`;
						} else {
							result += buffer;
						}
						buffer = ""; state = "normal"; i--;
					}
					break;				
				case "number":
					if (!c.match(/[0-9\.]/)) { result += `<span style="color: red;">${buffer}</span>`; buffer = ""; state = "normal"; i--; }
					else { buffer += c; }
					break;
				case "comment":
					buffer += c; if (i === line.length - 1) { result += `<span style="color: gray;">${buffer}</span>`; buffer = ""; state = "normal"; }
					break;
	
				case "include":
					if (c === '&') { buffer = c; state = "angle_include"; }
					else if (c === '"') { buffer = c; state = "quote_include"; } 
					else { result += c; }
					break;
				
				case "angle_include":
					buffer += c;
					if (buffer.endsWith('>')) { result += `<span style="color: yellow;">${buffer}</span>`; buffer = ""; state = "normal"; }
					break;
				
				case "quote_include":
					buffer += c;
					if (c === '"') { 
						let filename = buffer.substring(1, buffer.length - 1);
						result += `<span style="color: blue" onclick="GrabNGo($_('mdview'),'${filename}', Show_cpp )">${filename}</span>`;
						buffer = ""; state = "normal"; 
					}
					break;
			}
		}
		result += buffer;

		return `<span data-line-number="${lineNumber}">${colorCaps(result)}</span>`;
	}
	function GetMethods(cppFileContent) {
		const lines = cppFileContent.split('\n');
		// Updated regex to ensure that the line does not start with a colon
		const defRegex = /^(?![:\s]*:)\s*([\w:]+[*&]?\s+)?(\w+::)?(\w+::)?(\w+)::(\w+)\s*\(([^)]*)\)\s*(?![;])/;
	
		let menuStructure = {};
	
		lines.forEach((line, index) => {
			const match = line.match(defRegex);
			if (match) {
				const [_, retVal, firstNs, secondNs, className, methodName, params] = match;
				const firstNsKey = firstNs ? firstNs.trim() : '';
				const secondNsKey = secondNs ? secondNs.trim() : '';
				const returnType = retVal ? retVal.trim() : 'void';  // Assuming 'void' if no return type is specified
	
				if (!menuStructure[firstNsKey]) menuStructure[firstNsKey] = {};
				if (!menuStructure[firstNsKey][secondNsKey]) menuStructure[firstNsKey][secondNsKey] = {};
				if (!menuStructure[firstNsKey][secondNsKey][className]) menuStructure[firstNsKey][secondNsKey][className] = [];
	
				menuStructure[firstNsKey][secondNsKey][className].push({
					methodName: methodName,
					params: params,
					returnType: returnType,
					lineNumber: index + 1
				});
			}
		});
	
		return menuStructure;
	}
	
		
	function buildCppMenu(structure, prearea, targetDiv) {
		Object.entries(structure).forEach(([key, value]) => {
			const menuItemDiv = document.createElement('div');
			menuItemDiv.classList.add('menu-item');
			menuItemDiv.textContent = key || 'Global';

			targetDiv.appendChild(menuItemDiv);

			if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
				const subMenuDiv = document.createElement('div');
				subMenuDiv.classList.add('sub-menu');
				menuItemDiv.appendChild(subMenuDiv);
				buildCppMenu(value, prearea, subMenuDiv);
			} else if (Array.isArray(value)) {
				value.forEach(item => {
					const itemButton = document.createElement('button');
					itemButton.textContent = item.methodName;
					itemButton.addEventListener('mouseover', () => {
						scrollToLine(item.lineNumber, prearea);
					});
					menuItemDiv.appendChild(itemButton);
				});
			}
		});
	}
	
	let prearea = document.createElement('pre');
	prearea.id = 'prearea';

	$_('right').innerHTML = "";

	methodTable = GetMethods( data );

	buildCppMenu( methodTable, prearea, $_('right') );

	let lineNumber = 0;
	data = data.split('\n').map(line => {
		lineNumber++;
		return processLine(line, lineNumber);
	}).join('\n');
	
	targetDiv.innerHTML = "";
	prearea.innerHTML = data;
	addLineNumbers(prearea);
	removeTabs( prearea );
	targetDiv.appendChild(prearea);

}
