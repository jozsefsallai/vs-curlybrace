import * as vscode from 'vscode';
import * as path from 'path';

let timeout: any = null;
let iterator: number = 0;

const decoration = createDecorationType();

export function activate(context: vscode.ExtensionContext) {
	let activeEditor = vscode.window.activeTextEditor;

	if (activeEditor) {
		startDecorationUpdate();
	}

	vscode.window.onDidChangeActiveTextEditor((editor) => {
		activeEditor = editor;
		if (editor) {
			startDecorationUpdate();
		}
	}, null, context.subscriptions);

	vscode.workspace.onDidChangeTextDocument((e) => {
		if (activeEditor && e.document === activeEditor.document) {
			startDecorationUpdate();
		}
	}, null, context.subscriptions);

	function updateDecorations() {
		if (activeEditor) {
			const text = activeEditor.document.getText();
			activeEditor.setDecorations(decoration, getRange(text, activeEditor));
		}
	}

	function startDecorationUpdate() {
		if (timeout) {
			clearTimeout(timeout);
		}

		timeout = setTimeout(updateDecorations, 500);
	}
}

function getRange(text: string, editor: vscode.TextEditor): vscode.Range[] {
	const ranges: vscode.Range[] = [];

	iterator = 0;

	const curlies = text.split('}');

	if (curlies && curlies.length) {
		curlies.forEach((curly, idx) => {
			if (idx < curlies.length - 1) {
				iterator += curly.length + 1;
				const position = editor.document.positionAt(iterator);
				if (iterator > 1) {
					ranges.push(new vscode.Range(position, position));
				}
			}
		});
	}

	return ranges;
}

function createDecorationType() {
	// @ts-ignore
	const lineHeight = vscode.workspace.getConfiguration('editor', null).get('lineHeight') - 5 + 'px';

	return vscode.window.createTextEditorDecorationType({
		after: {
			contentIconPath: path.join(__dirname, '..', 'src', 'curly.svg'),
			width: lineHeight,
			height: lineHeight,
			margin: '0 0 0 4px'
		},
		rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
	});
}

export function deactivate() {}
