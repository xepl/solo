// SPDX: AGPL-3.0-only
/* XEPL Solo Environment - Copyright (c) 2024 Keith Edwin Robbins
	Project Name: XEPL Solo Environment
	File Name:    show_md.js
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

function Show_md(targetDiv, data) {

	var go_left = false;
  
	function markdownToHtml(markdown) {
		const linkRegex = /\[(.*?)\]\((.*?)\)/g;
		const strongRegex = /(\*\*|__)(.+?)\1/g;
		const emphasisRegex = /(\*|_)([^*]+?)\1/g; 
	
		function createLink(linkText, linkUrl) {
			return `<a href="${linkUrl}" target="_blank">${linkText}</a>`;
		}
		
		function createButton(buttonText, buttonUrl) {		
			return `<button data-url="${buttonUrl}" class="actionButton">${buttonText}</button>`;
		}

		if (markdown.match(linkRegex))
		{		
			const withLinks = markdown.replace(linkRegex, (match, linkText, linkUrl) => {
				if (linkUrl.startsWith('http://') || linkUrl.startsWith('https://')) {
					return createLink(linkText, linkUrl);
				} else {
					return createButton(linkText, linkUrl);
				}
			});
			return withLinks;
		}
		
		const withStrong = markdown.replace(strongRegex, '<strong>$2</strong>');
		return withStrong.replace(emphasisRegex, '<em>$2</em>');
	}
	
		
	function createInlineCode(text) {
		const codeElement = document.createElement('code');
		codeElement.textContent = text;
		return codeElement;
	}
	
    function createCodeBlock(text) {
        const preEl = document.createElement('pre');
        const codeEl = document.createElement('code');
        codeEl.textContent = text;
        preEl.appendChild(codeEl);
        return preEl;
    }
    
    function convertLinks() {
		if (currentElement)
		currentElement.innerHTML = markdownToHtml(currentElement.innerHTML);
	}
	
	function processLinks(text) {
		const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
		const fragment = document.createDocumentFragment();
		let remainingText = text;

		let match;
		while ((match = imageRegex.exec(text) ) !== null) {
			const precedingText = remainingText.slice(0, match.index);
			const altOrLinkText = match[1];
			const srcOrLinkUrl = match[2];

			if (precedingText) {
				fragment.appendChild(document.createTextNode(precedingText));
			}

			fragment.appendChild(createImageElement(altOrLinkText, srcOrLinkUrl));

			remainingText = remainingText.slice(match.index + match[0].length);
		}

		if (remainingText) {
			fragment.appendChild(document.createTextNode(remainingText));
		}

		return fragment;
	}

	function createImageElement(altText, srcUrl) {
		function addImage(container, imagePath) {
		  
			imageContainer = document.createElement('div');
			imageContainer.className = 'md-image-container';

			const img = document.createElement('img');
			img.src = imagePath;
			imageContainer.appendChild(img);
		  
			const textContainer = document.createElement('h3');
			textContainer.className = 'md-image-title';
		  

			if ( go_left )
			{	
				container.appendChild(imageContainer);
				container.appendChild(textContainer);
				go_left = false;
			}
			else			
			{	
				container.appendChild(textContainer);
				container.appendChild(imageContainer);
				go_left = true;
			}
		  
			return textContainer;
		  }
		const container = document.createElement("div");
		container.className = 'container';
  		const textdiv = addImage( container, srcUrl );
		textdiv.innerHTML=altText;

		return container;
	}

	const markdown = data;
    targetDiv.innerHTML = ""; 

	var toc_div = document.getElementById('right');
	if ( toc_div == undefined )
	{
		toc_div = document.createElement("div");
	   targetDiv.appendChild( toc_div );
	}
	toc_div.innerHTML = "";
	
	const lines = markdown.split('\n');
	let currentElement = null;
	
	const bulletRegex = /^(\s*)\* (.+)$/gm;





    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();
		const bulletMatch = bulletRegex.exec(line);
    
        // First, let's handle the multiline code blocks
    
        if (/^```/.test(trimmedLine)) {
            convertLinks();
            const codeBlockContent = [];
            i++;  // skip the current line with ```
            while (i < lines.length && !/^```/.test(lines[i])) {
                codeBlockContent.push(lines[i]);
                i++;
            }
            // i will be pointing to the line with closing ```, we'll skip it in the next iteration of the loop
            currentElement = createCodeBlock(codeBlockContent.join('\n'));
            targetDiv.appendChild(currentElement);
        }
		// Headers
		else if (/^#+\s/.test(trimmedLine)) {
			convertLinks();
			const headerLevel = trimmedLine.match(/^#+/)[0].length;
			currentElement = document.createElement(`h${headerLevel}`);
			currentElement.textContent = trimmedLine.slice(headerLevel).trim();

			// Create an id for the header, so we can link to it
			const headerId = `header-${Math.random().toString(36).substr(2, 9)}`;
			currentElement.id = headerId;
			targetDiv.appendChild(currentElement);

			if ( headerLevel < 4 ) {
				// Now, we'll add the link to the table of contents
				const tocLink = document.createElement('a');
				tocLink.href = `#${headerId}`;
				tocLink.textContent = currentElement.textContent;
				const tocItem = document.createElement('li');
				tocItem.style.marginLeft = `${(headerLevel - 1) * 20}px`; // Indentation based on header level
				tocItem.appendChild(tocLink);
				toc_div.appendChild(tocItem);
			}
		}
		// Unordered lists
		else if (/^-+\s/.test(trimmedLine)) {
			convertLinks();
			if (! currentElement || currentElement.tagName !== 'UL') {
				currentElement = document.createElement('ul');
				targetDiv.appendChild(currentElement);
			}
			const listItem = document.createElement('li');
			listItem.textContent = trimmedLine.slice(1).trim();
			currentElement.appendChild(listItem);
		} else if (/^(\s*)\* (.+)$/gm.test(trimmedLine)) {
			convertLinks();
			if (! currentElement || currentElement.tagName !== 'UL') {
				currentElement = document.createElement('ul');
				targetDiv.appendChild(currentElement);
			}
			const listItem = document.createElement('li');
			listItem.textContent = trimmedLine.slice(1).trim();
			currentElement.appendChild(listItem);
		}
		// Unordered lists
		else if (bulletMatch) {
			if (! currentElement || currentElement.tagName !== 'UL') {
				convertLinks();
				currentElement = document.createElement('ul');
				targetDiv.appendChild(currentElement);
			}
			const listItem = document.createElement('li');
			listItem.textContent = bulletMatch[2].trim();
			currentElement.appendChild(listItem);
		}

        // Blockquotes
		else if (/^>\s/.test(trimmedLine)) {
			convertLinks();
			currentElement = document.createElement('blockquote');
			const quoteText = trimmedLine.slice(1).trim();
			
			// Improved regex to handle multiple backticks and prevent greedy matches
			const inlineCodeMatches = quoteText.match(/`+([^`]+)`+/g);
			if (inlineCodeMatches) {
				let remainingText = quoteText;
				inlineCodeMatches.forEach(match => {
					const matchIndex = remainingText.indexOf(match);
					const precedingText = remainingText.slice(0, matchIndex);
					const codeText = match.slice(1, -1);  // Modified to skip the initial and final backtick
					
					// Append text node for the text before the code
					if (precedingText) {
						currentElement.appendChild(document.createTextNode(precedingText));
					}
					
					// Create a code element and append it
					const codeElement = document.createElement('code');
					codeElement.textContent = codeText;  // Use textContent to escape HTML entities
					currentElement.appendChild(codeElement);
					
					// Update remainingText to process text after the current code block
					remainingText = remainingText.slice(matchIndex + match.length);
				});
				
				// Handle any remaining text after the last code block
				if (remainingText) {
					currentElement.appendChild(document.createTextNode(remainingText));
				}
			} else {
				// If no inline code, just set the text of the blockquote
				currentElement.textContent = quoteText;
			}
			
			// Append the fully constructed blockquote to the targetDiv
			targetDiv.appendChild(currentElement);
		}
				// Paragraphs
		else if (trimmedLine) {
			if (! currentElement || currentElement.tagName != 'P') {
				convertLinks();
				currentElement = document.createElement('p');
				const inlineCodeMatches = trimmedLine.match(/`[^`]+`/g);
				
				if (inlineCodeMatches) {
					let remainingText = trimmedLine;
					inlineCodeMatches.forEach(match => {
						const matchIndex = remainingText.indexOf(match);
						const precedingText = remainingText.slice(0, matchIndex);
						const codeText = match.slice(1, -1);
						
						if (precedingText) {
							currentElement.appendChild(document.createTextNode(precedingText));
						}
						
						currentElement.appendChild(createInlineCode(codeText));
						remainingText = remainingText.slice(matchIndex + match.length);
					});
					
					if (remainingText) {
						currentElement.appendChild(document.createTextNode(+remainingText));
					}
				} else {
					currentElement.appendChild( processLinks(trimmedLine) )
				}
				
				targetDiv.appendChild(currentElement);
			} else {
				currentElement.appendChild ( processLinks(" "+ trimmedLine) );
			}
		} else {
			convertLinks();
			currentElement = 0;
		}
	}
	addLineNumbers(targetDiv);


}
