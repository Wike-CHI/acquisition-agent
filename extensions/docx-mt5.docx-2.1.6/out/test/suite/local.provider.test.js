"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("mocha");
const sinon = require("sinon");
const chai_1 = require("chai");
const vscode_1 = require("vscode");
const fileSystem_utils_1 = require("../../utils/fileSystem.utils");
const local_provider_1 = require("../../provider/local.provider");
(0, mocha_1.describe)('fetchDocumentation', () => {
    let fileSystem;
    let localProvider;
    (0, mocha_1.setup)(() => {
        fileSystem = new fileSystem_utils_1.FileSystemManager();
        localProvider = new local_provider_1.LocalProvider(fileSystem);
        sinon
            .stub(fileSystem, 'retrieveNonIgnoredEntries')
            .withArgs(vscode_1.Uri.file('/test-directory').fsPath)
            .resolves([
            ['document.md', vscode_1.FileType.File],
            ['diagram.bpmn', vscode_1.FileType.File],
            ['sub-directory', vscode_1.FileType.Directory],
        ])
            .withArgs(vscode_1.Uri.file('/test-directory/sub-directory').fsPath)
            .resolves([['nested-doc.md', vscode_1.FileType.File]]);
        sinon
            .stub(fileSystem, 'readFile')
            .withArgs(vscode_1.Uri.file('/test-directory/document.md').fsPath)
            .resolves(Buffer.from('MD Content').toString())
            .withArgs(vscode_1.Uri.file('/test-directory/diagram.bpmn').fsPath)
            .resolves(Buffer.from('BPMN Content').toString())
            .withArgs(vscode_1.Uri.file('/test-directory/sub-directory/nested-doc.md').fsPath)
            .resolves(Buffer.from('Nested MD Content').toString());
    });
    (0, mocha_1.teardown)(() => sinon.restore());
    (0, mocha_1.it)('should fetch documentation for files of interest including nested directories', async () => {
        const result = await localProvider.fetchDocumentation(vscode_1.Uri.file('/test-directory'));
        (0, chai_1.expect)(result).to.deep.equal([
            {
                name: 'document.md',
                path: '/test-directory/document.md',
                type: '.md',
                content: 'MD Content',
            },
            {
                name: 'diagram.bpmn',
                path: '/test-directory/diagram.bpmn',
                type: '.bpmn',
                content: 'BPMN Content',
            },
            {
                name: 'nested-doc.md',
                path: '/test-directory/sub-directory/nested-doc.md',
                type: '.md',
                content: 'Nested MD Content',
            },
        ]);
    });
    (0, mocha_1.it)('should return an empty array if no documentation files are found', async () => {
        const result = await localProvider.fetchDocumentation(vscode_1.Uri.file('/empty-directory'));
        (0, chai_1.expect)(result).to.deep.equal([]);
    });
});
//# sourceMappingURL=local.provider.test.js.map