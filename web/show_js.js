// SPDX: AGPL-3.0-only
/* XEPL Solo Environment - Copyright (c) 2024 Keith Edwin Robbins
	Project Name: XEPL Solo Environment
	File Name:    show_js.js
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

function Show_js(targetDiv, data) {

	function processLine(line)
	{
		line = line.replace(/</g, '&lt;').replace(/>/g, '&gt;'); // Escape HTML tags
	
		const jsKeywords = [
			"break", "case", "catch", "const", "continue", "debugger", "default", "delete",
			"do", "else", "finally", "for", "function", "if", "in", "instanceof", "let",
			"new", "return", "switch", "this", "throw", "try", "typeof", "var", "void",
			"while", "with", "yield", "class", "super", "import", "export", "extends"
		];
	
		const htmlStyles = [
			"color", "background", "font-size", "border", "margin", "padding", "width", "height",
			"display", "position", "z-index", "flex", "grid", "align-items", "justify-content",
			"style", "marginLeft", "marginRight"
		];
	
		const asyncEvents = [
			"async", "await", "promise", "resolve", "reject", "then", "catch",
			"addEventListener", "removeEventListener", "onload", "onerror", "onfocus",
			"onblur", "onclick", "oninput", "stopPropagation", "exec"
		];
	
		const arrayMacros = [
			"forEach", "map", "filter", "reduce", "some", "every", "find", "findIndex",
			"includes", "join", "pop", "push", "shift", "unshift", "slice", "splice",
			"sort", "reverse", "split", "trim", "replace", "match"
		];
	
		const domManipulation = [
			"innerHTML", "innerText", "textContent", "outerHTML", "setAttribute",
			"getAttribute", "removeAttribute", "hasAttribute", "createElement",
			"createTextNode", "classList", "insertBefore", "insertAdjacentHTML", "replaceChild",
			"appendChild", "removeChild", "className", "getPropertyValue", "setProperty", "append", "remove"
		];
	
		const domNavigation = [
			"document", "window", "getElementById", "getElementsByClassName", "getElementsByTagName",
			"querySelector", "querySelectorAll", "parentNode", "childNodes",
			"firstChild", "lastChild", "nextSibling", "previousSibling", "target"
	
		];
	
		let allKeywords = [
			...jsKeywords,
			...htmlStyles,
			...asyncEvents,
			...arrayMacros,
			...domNavigation,
			...domManipulation
		];
	
		let result = "";
		let buffer = "";
		let state = "normal";
	
		for (let i = 0; i < line.length; ++i) 
		{
			const c = line[i];
			switch (state) 
			{
				case "normal":
					if (c.match(/[a-zA-Z_$]/)) { buffer = c; state = "keyword"; }
					else if (c === '{' || c === '}') { result += `<span style="color: brown;">${c}</span>`; }
					else if (c === '"' || c === "'") { buffer = c; state = "string"; }
					else if (c.match(/[0-9]/)) { buffer = c; state = "number"; }
					else if (c === '/' && line[i+1] === '/') { buffer = c+c; i++; state = "comment"; }
					else { result += c; }
					break;
				case "keyword":
					if (c.match(/[a-zA-Z0-9_$]/)) { buffer += c; }
					else 
					{
						if (jsKeywords.includes(buffer)) {
							result += `<span style="color: blue;">${buffer}</span>`;
						}
						else if (htmlStyles.includes(buffer)) {
							result += `<span style="color: green;">${buffer}</span>`;
						}
						else if (asyncEvents.includes(buffer)) {
							result += `<span style="color: red;">${buffer}</span>`;
						}
						else if (domNavigation.includes(buffer)) {
							result += `<span style="color: purple;">${buffer}</span>`;
						}
						else if (domManipulation.includes(buffer)) {
							result += `<span style="color: violet;">${buffer}</span>`;
						}
						else if (arrayMacros.includes(buffer)) {
							result += `<span style="color: fuchsia;">${buffer}</span>`;
						}
						else {
							result += buffer;
						}
						buffer = ""; state = "normal"; i--;
					}
					break;
				case "string":
					buffer += c;
					if (c === buffer[0]) { result += `<span style="color: orange;">${buffer}</span>`; buffer = ""; state = "normal"; }
					break;
				case "number":
					if (!c.match(/[0-9\.]/)) { result += `<span style="color: red;">${buffer}</span>`; buffer = ""; state = "normal"; i--; }
					else { buffer += c; }
					break;
				case "comment":
					buffer += c; if (i === line.length - 1) { result += `<span style="color: gray;">${buffer}</span>`; buffer = ""; state = "normal"; }
					break;
			}       
		}
		result += buffer;
		return `<span data-line-number="${lineNumber}">${colorizeRegex(result)}</span>`;
	}


	function colorizeRegex(regexStr) {
		regexStr = regexStr.replace(/(\[[^\]]+\])/g, '<span class="regex-set">$1</span>'); // character sets
		regexStr = regexStr.replace(/(\\[bBdDfnrsStvwW0-9])/g, '<span class="regex-meta">$1</span>'); // metacharacters with backslashes
		regexStr = regexStr.replace(/([\^\$\.\|\?\*\+\(\)\{\}])/g, '<span class="regex-meta">$1</span>'); // other metacharacters

		return regexStr;
	}


	function getJsMethods(jsFileContent) {
		const lines = jsFileContent.split('\n');
		// Regex to match different styles of JS functions
		const funcRegex = /(?:function\s+(\w+)|(\w+)\s*[:=]\s*function|(\w+)\s*[:=]\s*\(|class\s+(\w+)[^{]*{(?:[^}]*(?:constructor|get|set|static\s+\w+)\s*\([^)]*\)))/g;

		let menuStructure = {};

		lines.forEach((line, index) => {
			let match;
			while ((match = funcRegex.exec(line)) !== null) {
				const [_, funcName, objFuncName, arrowFuncName, className] = match;
				const name = funcName || objFuncName || arrowFuncName || className;
				const classKey = className ? className : 'Global';

				if (!menuStructure[classKey]) {
					menuStructure[classKey] = [];
				}

				if (name && name !== classKey) {
					menuStructure[classKey].push({
						methodName: name,
						lineNumber: index + 1
					});
				}
			}
		});

		return menuStructure;
	}

	function buildTOCFromJsMethods(menuStructure, prearea, targetDiv) {
		Object.entries(menuStructure).forEach(([className, methods]) => {
			const classDiv = document.createElement('div');
			classDiv.classList.add('class-item');
			classDiv.textContent = className;

			targetDiv.appendChild(classDiv);

			methods.forEach(method => {
				const methodButton = document.createElement('button');
				methodButton.textContent = method.methodName;
				methodButton.addEventListener('mouseover', () => {
					scrollToLine(method.lineNumber, prearea);
				});
				classDiv.appendChild(methodButton);
			});
		});
	}

    const codeContent = data.replace(/\t/g, '    ');

	let lineNumber = 0;
	formattedCode = codeContent.split('\n').map(line => {
		lineNumber++;
		return processLine(line, lineNumber);
	}).join('\n');

	targetDiv.innerHTML = `<pre id="prearea" style="">${formattedCode}</pre>`;
    addLineNumbers(targetDiv);
	removeTabs(targetDiv);
	const menuStructure = getJsMethods( data );
	buildTOCFromJsMethods( menuStructure, $_('prearea'), $_('right'));
}
 
