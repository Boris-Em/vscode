/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import * as assert from 'assert';
import {ILink} from 'vs/editor/common/modes';
import {ILinkComputerTarget, computeLinks} from 'vs/editor/common/modes/linkComputer';

class SimpleLinkComputerTarget implements ILinkComputerTarget {

	constructor(private _lines:string[]) {
		// Intentional Empty
	}

	public getLineCount(): number {
		return this._lines.length;
	}

	public getLineContent(lineNumber:number): string {
		return this._lines[lineNumber - 1];
	}
}

function myComputeLinks(lines:string[]): ILink[] {
	var target = new SimpleLinkComputerTarget(lines);
	return computeLinks(target);
}

function assertLink(text:string, extractedLink:string): void {
	var startColumn = 0,
		endColumn = 0,
		chr: string,
		i = 0;

	for (i = 0; i < extractedLink.length; i++) {
		chr = extractedLink.charAt(i);
		if (chr !== ' ' && chr !== '\t') {
			startColumn = i + 1;
			break;
		}
	}

	for (i = extractedLink.length - 1; i >= 0; i--) {
		chr = extractedLink.charAt(i);
		if (chr !== ' ' && chr !== '\t') {
			endColumn = i + 2;
			break;
		}
	}

	var r = myComputeLinks([text]);
	assert.deepEqual(r, [{
		range: {
			startLineNumber: 1,
			startColumn: startColumn,
			endLineNumber: 1,
			endColumn: endColumn
		},
		url: extractedLink.substring(startColumn - 1, endColumn - 1)
	}]);
}

suite('Editor Modes - Link Computer', () => {

	test('Null model',() => {
		var r = computeLinks(null);
		assert.deepEqual(r, []);
	});

	test('Parsing', () => {

		assertLink(
			'x = "http://foo.bar";',
			'     http://foo.bar  '
		);

		assertLink(
			'x = (http://foo.bar);',
			'     http://foo.bar  '
		);

		assertLink(
			'x = [http://foo.bar];',
			'     http://foo.bar  '
		);

		assertLink(
			'x = \'http://foo.bar\';',
			'     http://foo.bar  '
		);

		assertLink(
			'x =  http://foo.bar ;',
			'     http://foo.bar  '
		);

		assertLink(
			'x = <http://foo.bar>;',
			'     http://foo.bar  '
		);

		assertLink(
			'x = {http://foo.bar};',
			'     http://foo.bar  '
		);

		assertLink(
			'(see http://foo.bar)',
			'     http://foo.bar  '
		);
		assertLink(
			'[see http://foo.bar]',
			'     http://foo.bar  '
		);
		assertLink(
			'{see http://foo.bar}',
			'     http://foo.bar  '
		);
		assertLink(
			'<see http://foo.bar>',
			'     http://foo.bar  '
		);
		assertLink(
			'<url>http://mylink.com</url>',
			'     http://mylink.com      '
		);
		assertLink(
			'// Click here to learn more. https://go.microsoft.com/fwlink/?LinkID=513275&clcid=0x409',
			'                             https://go.microsoft.com/fwlink/?LinkID=513275&clcid=0x409'
		);
		assertLink(
			'// Click here to learn more. https://msdn.microsoft.com/en-us/library/windows/desktop/aa365247(v=vs.85).aspx',
			'                             https://msdn.microsoft.com/en-us/library/windows/desktop/aa365247(v=vs.85).aspx'
		);
		assertLink(
			'// https://github.com/projectkudu/kudu/blob/master/Kudu.Core/Scripts/selectNodeVersion.js',
			'   https://github.com/projectkudu/kudu/blob/master/Kudu.Core/Scripts/selectNodeVersion.js'
		);
		assertLink(
			'<!-- !!! Do not remove !!!   WebContentRef(link:https://go.microsoft.com/fwlink/?LinkId=166007, area:Admin, updated:2015, nextUpdate:2016, tags:SqlServer)   !!! Do not remove !!! -->',
			'                                                https://go.microsoft.com/fwlink/?LinkId=166007                                                                                        '
		);
		assertLink(
			'For instructions, see https://go.microsoft.com/fwlink/?LinkId=166007.</value>',
			'                      https://go.microsoft.com/fwlink/?LinkId=166007         '
		);
		assertLink(
			'For instructions, see https://msdn.microsoft.com/en-us/library/windows/desktop/aa365247(v=vs.85).aspx.</value>',
			'                      https://msdn.microsoft.com/en-us/library/windows/desktop/aa365247(v=vs.85).aspx         '
		);

		// foo bar (see http://www.w3schools.com/tags/att_iframe_sandbox.asp)
	});
});
