// SPDX: AGPL-3.0-only
/* XEPL Solo Environment - Copyright (c) 2024 Keith Edwin Robbins
	Project Name: XEPL Solo Environment
	File Name:    show_xml.js
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

function Show_xml(targetDiv, data) {
	const structureTags = ["Neuron", "Properties", "Genes", "Forms", "Macros", "Methods", "Synapses", "Lobe"];
	const controlTags = ["Yes", "No", "If", "Enter","Run","ForEach", "When"];
	const actionTags = ["Mod", "Mod", "TcpServer"];
	const htmlTags = ["div", "span", "input", "button", "script", "style" ];
	
	function processLine(line, lineNumber) {
		// Escape special characters
		line = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

		// Grouped tags

		// Convert the tag arrays to regex
		const structureTagsRegex = new RegExp(`(&lt;([a-zA-Z0-9\._\-]+:)?(${structureTags.join("|")}))`, 'g');
		const controlTagsRegex = new RegExp(`(&lt;([a-zA-Z0-9\._\-]+:)?(${controlTags.join("|")}))`, 'g');
		const actionTagsRegex = new RegExp(`(&lt;([a-zA-Z0-9\._\-]+:)?(${actionTags.join("|")}))`, 'g');
		const htmlTagsRegex = new RegExp(`(&lt;([a-zA-Z0-9\._\-]+:)?(${htmlTags.join("|")}))`, 'g');
		
		// Other XML components regex
		const tagRegex = /(&lt;[a-zA-Z0-9_:\.\-]+)(\s?)/g;
		const tagEndRegex = /(&lt;\/[a-zA-Z0-9_\.\-:]+)(\s?)&gt;/g;

		line = line.replace(tagEndRegex, `<span style="color: lightgrey;">$1&gt;</span>$2`);

		// First, replace the most specific tags
		if( line.match(structureTagsRegex) ) 
			line = line.replace(structureTagsRegex, `<span style="color: purple;">$1</span>`);
		else if (line.match( controlTagsRegex ) )
			line = line.replace(controlTagsRegex, `<span style="color: brown;">$1</span>`);
		else if (line.match(actionTagsRegex))
			line = line.replace(actionTagsRegex, `<span style="color: red;">$1</span>`);
		else if (line.match(htmlTagsRegex))
			line = line.replace(htmlTagsRegex, `<span style="color: violet;">$1</span>`);
		else 
			line = line.replace(tagRegex, `<span style="color: blue;">$1</span>$2`);

		return colorizeAttributes( line );
	}
	
	function colorizeAttributes(line) {
		let output = "";
		let state = "OUTSIDE_STRING";
		let buffer = "";
		let quoteType = ""; 

		for (let i = 0; i < line.length; i++) {
			switch (state) {
				case "OUTSIDE_STRING":
					if (line.substr(i, 6) === '&quot;') {
						output += `<span style="color: green;">&quot;`;
						state = "INSIDE_STRING";
						quoteType = "&quot;";
						i += 5;
					} else if (line.substr(i, 5) === '&#39;') {
						output += `<span style="color: green;">&#39;`;
						state = "INSIDE_STRING";
						quoteType = "&#39;";
						i += 4;
					} else {
						output += line[i];
					}
					break;

				case "INSIDE_STRING":
					if (line.substr(i, 6) === '&quot;' && quoteType === "&quot;") {
						output += `&quot;</span>`;
						state = "OUTSIDE_STRING";
						i += 5;
					} else if (line.substr(i, 5) === '&#39;' && quoteType === "&#39;") {
						output += `&#39;</span>`;
						state = "OUTSIDE_STRING";
						i += 4;
					} else if (line.substr(i, 6) === '&quot;' && quoteType === "&#39;") {
						output += `<span style="color: orange;">&quot;`;
						state = "INSIDE_STRING2";
						i += 5;
					} else if (line.substr(i, 5) === '&#39;' && quoteType === "&quot;") {
						output += `<span style="color: orange;">&#39;`;
						state = "INSIDE_STRING2";
						i += 4;
					} else {
						output += line[i];
					}
					break;

				case "INSIDE_STRING2":
					if (line.substr(i, 6) === '&quot;' && quoteType === "&#39;") {
						output += `&quot;</span>`;
						state = "INSIDE_STRING";
						i += 5;
					} else if (line.substr(i, 5) === '&#39;' && quoteType === "&quot;") {
						output += `&#39;</span>`;
						state = "INSIDE_STRING";
						i += 4;
					} else {
						output += line[i];
					}
					break;
			}
		}

		return `<span data-line-number="${lineNumber}">${output}</span>`;
	}

 
    const codeContent = data.replace(/\t/g, '    ');

	let lineNumber = 0;
	formattedCode = codeContent.split('\n').map(line => {
		lineNumber++;
		return processLine(line, lineNumber);
	}).join('\n');

	targetDiv.innerHTML = `<pre id='prearea' style="">${formattedCode}</pre>`;
    addLineNumbers(targetDiv);

	const menuStructure = buildXmlMenuStructure( data, structureTags );
	buildXmlTOC( menuStructure, $_('prearea'), $_('right') );
}

function buildXmlMenuStructure(xmlContent, structureTags) {
	const structureTagsRegex = new RegExp(`(<([a-zA-Z0-9._-]+:)?(${structureTags.join("|")}))`, 'g');
	let menuStructure = {};
	let match;

	while ((match = structureTagsRegex.exec(xmlContent)) !== null) {
		const tag = match[3];
		const lineNumber = xmlContent.substring(0, match.index).split('\n').length;

		if (!menuStructure[tag]) {
			menuStructure[tag] = [];
		}
		menuStructure[tag].push({ tagName: tag, lineNumber: lineNumber });
	}

	return menuStructure;
}

function buildXmlTOC(menuStructure, prearea, targetDiv) {
	Object.entries(menuStructure).forEach(([tag, items]) => {
		const tagDiv = document.createElement('div');
		tagDiv.classList.add('tag-item');
		tagDiv.textContent = tag;
		targetDiv.appendChild(tagDiv);

		items.forEach(item => {
			const itemButton = document.createElement('button');
			itemButton.textContent = `Line ${item.lineNumber}`;
			itemButton.addEventListener('mouseover', () => {
				scrollToLine(item.lineNumber, prearea);
			});
			tagDiv.appendChild(itemButton);
		});
	});
}
