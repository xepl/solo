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

var prev = 0;

function $_(elementId) {
	return document.getElementById(elementId);
}

function ET(event) {
	let target;

	if (event.target) {
		target = event.target;
	} else if (event.srcElement) {
		target = event.srcElement;
	}

	if (target.nodeType === 3) {
		target = target.parentNode;
	}

	return target;
}


function clearHtml(listOfIds) {
	const ids = listOfIds.split(':');

	ids.forEach(id => {
		const element = document.getElementById(id);
		if (element) 
			element.innerHTML = "";
	});
}


function RightPanel(width)
{
	const panel   = document.getElementById("right");
	const content = document.getElementById("content");

	if (panel.style.display === 'none' || !panel.style.display)
	{
		panel.style.display = 'block';
		panel.style.setProperty('--right_col_width', width);
		content.style.marginRight = `var(--right_col_width)`;
	}
	else
	{
		panel.style.display       = 'none';
		content.style.marginRight = '0';
	}
}

function oneWay() {
	$_('right').innerHTML = '';
	const target = $_('content');
	if ( target.firstChild != undefined && target.firstChild.id === 'mdview')
		return;
    const layout = `<div id="mdview"></div>`;

	target.innerHTML = layout;
}

function Get(targetElement, url) {
    fetch(url)
        .then(response => response.text())
		.then(text => targetElement.innerHTML=text)
        .catch(error => {
            console.error('An error occurred:', error);
            targetElement.textContent = 'Failed to load content.';
        });
}


async function GetXmlButtons(url, id )
{
	try {
		const response    = await fetch(url);
		const xmlString   = await response.text();
		const parser      = new DOMParser();
		const xmlDoc      = parser.parseFromString(xmlString, "text/xml");
		const rootElement = xmlDoc.documentElement.firstChild;
		const targetDiv   = document.getElementById(id);

		function createCustomButtons(modules, parent, path = "", indent = 0) {
			for (const module of modules) {
				const tagPath = `${path}${module.tagName}/`;
				const button1 = document.createElement('button');
					  button1.innerText = module.tagName;
					  button1.className = "twoway";
					  button1.style.marginLeft = `${indent}px`;
					  button1.onclick = () => { splitSelect( this.event, $_('content'), `${tagPath.slice(0, -1)}!observer`, `${tagPath.slice(0, -1)}!shadows`); }
				parent.appendChild(button1);

				if (module.children.length) {
					createCustomButtons(module.children, parent, tagPath, indent + 20);
				}
			}
		}
		createCustomButtons(rootElement.children, targetDiv);
	} catch (error) {
		console.error('An error occurred:', error);
		targetDiv.textContent = 'Failed to load content.';
	}
}

function LoadScripts(into, url) {
	fetch(url)
		.then(response => response.text())
		.then(text => {
			if (into) {
				Show_script( into, text );
			 }
		})

		.catch(error => {
			console.error('An error occurred:', error);
			targetElement.textContent = 'Failed to load content.';
		});
}

function Show_normal(targetDiv, data) {
	targetDiv.innerHTML = data;
}

function Show_text(targetDiv, data) {
	targetDiv.innerText = data;
}

function Show_script(targetElement, text) {

	const tempDiv = document.createElement("div");
	tempDiv.innerHTML = text;

	// Remove and reinsert scripts
	tempDiv.querySelectorAll('script').forEach(script => script.remove());
	targetElement.innerHTML = tempDiv.innerHTML;

	tempDiv.innerHTML = text;
	tempDiv.querySelectorAll('script').forEach(oldScript => {
		const newScript = document.createElement('script');
		newScript.textContent = oldScript.textContent;
		document.body.appendChild(newScript).remove();
		});
}


function Tog(_obj, _to) {
	_obj.style.display = (_obj.style.display == 'none' ? _to: 'none');
}

function Debug(_obj, _event) {
	var tgt = ET(_event);

	tgt.classList.toggle("up");

	if ( tgt.nextSibling )
		tgt.nextSibling.remove( "code" );

	Tog(tgt.parentNode.nextSibling, 'block');
	return !(_event.cancelBubble = true);
}

function PreThis(t) { t.classList.toggle( "code" );}

function splitSelect(event, into, lhc, rhc ) {
	var buttonWidth = event.target.offsetWidth;
	var clickPosition = event.clientX - event.target.getBoundingClientRect().left;

	if (clickPosition < buttonWidth / 2) {
		return LoadScripts( into, lhc );
	} else {
		return LoadScripts( into, rhc );
	}
}

function scrollToLine(lineNumber, prearea) {
	const previouslyHighlighted = prearea.querySelector('.highlighted-line');
	if (previouslyHighlighted) {
		previouslyHighlighted.classList.remove('highlighted-line');
	}

	const lineElement = prearea.querySelector(`[data-line-number="${lineNumber}"]`);
	if (lineElement) {
		lineElement.classList.add('highlighted-line');
		lineElement.scrollIntoView();
	}
}

function addLineNumbers(element) {
    const spans = element.querySelectorAll('span[data-line-number]');

    spans.forEach(span => {
        const lineNumberSpan = document.createElement('span');
        
        const lineNumber = span.getAttribute('data-line-number');
        
        lineNumberSpan.textContent = lineNumber + " ";
        lineNumberSpan.className = 'line-number';

        span.insertBefore(lineNumberSpan, span.firstChild);
    });
}

function removeTabs(element) {
    element.innerHTML = element.innerHTML.replace(/\t/g, '    ');
}


function fetchTime() {
	const xhr = new XMLHttpRequest();
	xhr.open('GET', '/brain$observer', true);
	xhr.onload = function () {
		if (this.status === 200) {
			document.getElementById('time').textContent = this.responseText;
			fetchTime();
		}
	};
	xhr.onerror = function () {
		console.error('Request error...');
		// Retry after a delay in case of error
		setTimeout(fetchTime, 5000);
	};
	xhr.send();
}

function GrabNGo(target, url, post_fn) {
    if (!window.pathStack) {
        window.pathStack = [];
    }
    window.pathStack.push({
        url: target.getAttribute('data-current-url'),
        scrollPosition: target.scrollTop,
        postFunction: target.getAttribute('data-current-post-fn')
    });
    target.setAttribute('data-current-url', url);
    target.setAttribute('data-current-post-fn', post_fn.name);

    fetch(url)
        .then(response => response.text())
        .then(text => {
            post_fn(target, text);
            target.style.display = 'block';
            target.scrollTo(0, 0);
        })
        .catch(error => target.textContent = 'Error loading content: ' + error.message);
}

function goBack(target) {
    if (window.pathStack.length > 0) {
        const lastState = window.pathStack.pop();
        fetch(lastState.url)
            .then(response => response.text())
            .then(text => {
                const postFunction = window[lastState.postFunction];
                postFunction(target, text);
				target.setAttribute('data-current-url', lastState.url);
                target.style.display = 'block';
				target.scrollTo(0, lastState.scrollPosition);
            })
            .catch(error => target.textContent = 'Error loading content: ' + error.message);
    }
}


window.addEventListener('load', function() {
	Get( $_('footer'), 'solo!footer'  );
	Get( $_('top-nav'), 'solo!top_nav') ;
	Get( $_('sec-nav'), 'solo!sec_nav') ;
	oneWay();
	GrabNGo( $_('mdview'), 'docs/xepl-solo.md', Show_md );
});

