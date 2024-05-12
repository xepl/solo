// SPDX: AGPL-3.0-only
/* XEPL Solo Environment - Copyright (c) 2024 Keith Edwin Robbins
	Project Name: XEPL Solo Environment
	File Name:    show_css.js
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

function Show_css(targetDiv, data) {

    function processLine(line) {
		line = line.replace(/</g, '&lt;').replace(/>/g, '&gt;');

        if (line.includes('{')) 
            return `<span style="color: blue;">${line}</span>`;
        if (line.includes('}')) 
            return `<span style="color: blue;">${line}</span>`;
        if (line.includes(':')) 
        {
            let parts = line.split(':');
            return `<span style="color: green;">${parts[0]}</span>:${parts[1]}`;
        }
        return line;
    }

    const codeContent = data.replace(/\t/g, '    ');

	let lineNumber = 0;
	formattedCode = codeContent.split('\n').map(line => {
		lineNumber++;
		return `<span data-line-number="${lineNumber}">${processLine(line, lineNumber)}</span>`
	}).join('\n');

    targetDiv.innerHTML = `<pre id="prearea" style="">${formattedCode}</pre>`
    addLineNumbers(targetDiv);
}
