"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const workspace_utils_1 = require("../../utils/workspace.utils");
const sinon = require("sinon");
(0, mocha_1.describe)('WorkspaceManager Tests', () => {
    (0, mocha_1.afterEach)(() => {
        sinon.restore();
    });
    (0, mocha_1.it)('should return undefined when there is no active editor', async () => {
        sinon.stub(vscode_1.window, 'activeTextEditor').value(undefined);
        const path = workspace_utils_1.WorkspaceManager.getCurrentUserPath();
        (0, chai_1.expect)(path).to.be.equal(undefined);
    });
    (0, mocha_1.it)('should return the correct path when there is an active editor', async () => {
        const fakeDocument = {
            uri: vscode_1.Uri.file('/accountController.ts'),
        };
        const fakeEditor = {
            document: fakeDocument,
        };
        sinon.stub(vscode_1.window, 'activeTextEditor').value(fakeEditor);
        const path = workspace_utils_1.WorkspaceManager.getCurrentUserPath();
        (0, chai_1.expect)(path).to.equal('/accountController.ts');
    });
});
//# sourceMappingURL=workspace.test.js.map