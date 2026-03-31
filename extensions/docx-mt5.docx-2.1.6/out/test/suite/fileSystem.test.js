"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const sinon_1 = require("sinon");
const vscode_1 = require("vscode");
const mocha_1 = require("mocha");
const fileSystem_utils_1 = require("../../utils/fileSystem.utils");
const error_utils_1 = require("../../utils/error.utils");
(0, mocha_1.describe)('File Validation', () => {
    let readFileStub;
    let statStub;
    let fileSystem;
    const jsonMock = '{"associations":{"src":["/docx/ifTernary.md","/docx/asyncAwait.md"],"src/Controllers":["/docx/controllers.md"],"src/Modules":["/docx/modules.md"],"src/Utils/dates.ts":["/docx/utils/dates.md"]}}';
    (0, mocha_1.setup)(() => {
        const workspaceFs = { ...vscode_1.workspace.fs };
        // Stubbing for readFile
        readFileStub = (0, sinon_1.stub)(workspaceFs, 'readFile');
        readFileStub
            .withArgs((0, sinon_1.match)((uri) => uri.fsPath.endsWith('association.json')))
            .resolves(new Uint8Array(Buffer.from(jsonMock)));
        readFileStub.rejects(new Error('File not found'));
        // Stubbing for stat
        statStub = (0, sinon_1.stub)(workspaceFs, 'stat');
        statStub.withArgs((0, sinon_1.match)((uri) => uri.fsPath.endsWith('association.json'))).resolves();
        statStub.rejects(new Error('File not found'));
        fileSystem = new fileSystem_utils_1.FileSystemManager(workspaceFs);
    });
    (0, mocha_1.teardown)(() => {
        readFileStub.restore();
        statStub.restore();
    });
    (0, mocha_1.it)('should return true if the file exists', async () => {
        const result = await fileSystem.ensureFileExists(vscode_1.Uri.file('association.json'));
        (0, chai_1.expect)(result).to.be.equal(true);
    });
    (0, mocha_1.it)('should return false if the file does not exist', async () => {
        const result = await fileSystem.ensureFileExists(vscode_1.Uri.file('nonexistentfile.json'));
        (0, chai_1.expect)(result).to.be.equal(false);
    });
    (0, mocha_1.it)('should throw a FileSystemError for unexpected errors', async () => {
        try {
            // @ts-expect-error
            await fileSystem.ensureFileExists(undefined);
            chai_1.expect.fail('Expected ensureFileExists to throw, but it did not.');
        }
        catch (error) {
            (0, chai_1.expect)(error).to.be.instanceOf(vscode_1.FileSystemError);
        }
    });
    (0, mocha_1.it)('should retrieve the file content successfully', async () => {
        const result = await fileSystem.readFile('association.json');
        (0, chai_1.expect)(result).to.be.equal(jsonMock);
    });
    (0, mocha_1.it)('should throw an error if reading the file fails', async () => {
        try {
            await fileSystem.readFile('nonexistentfile.json');
            chai_1.expect.fail('Expected getFileContent to throw, but it did not.');
        }
        catch (error) {
            (0, chai_1.expect)(error.message).to.equal(`Failed to read file content: nonexistentfile.json`);
        }
    });
    (0, mocha_1.it)('should correctly parse valid JSON content', () => {
        const mockContent = '{"name":"John","age":30,"city":"New York"}';
        const expectedOutput = { name: 'John', age: 30, city: 'New York' };
        const result = fileSystem.processFileContent(mockContent);
        (0, chai_1.expect)(result).to.deep.equal(expectedOutput);
    });
    (0, mocha_1.it)('should throw an error for invalid JSON content', () => {
        // Missing quote -> "name":"John <--
        const mockContent = '{"name":"John,"age":30,"city":"New York"}';
        const expectedOutput = { name: 'John', age: 30, city: 'New York' };
        (0, chai_1.expect)(() => fileSystem.processFileContent(mockContent)).to.throw();
    });
    (0, mocha_1.it)('should correctly return the extension for files of interest', () => {
        (0, chai_1.expect)(fileSystem.getExtension('document.md')).to.be.equal('.md');
        (0, chai_1.expect)(fileSystem.getExtension('diagram.bpmn')).to.be.equal('.bpmn');
    });
    (0, mocha_1.it)('should return undefined for files not of interest', () => {
        (0, chai_1.expect)(fileSystem.getExtension('image.ts')).to.be.equal(undefined);
        (0, chai_1.expect)(fileSystem.getExtension('audio.yml')).to.be.equal(undefined);
    });
    (0, mocha_1.it)('should handle filenames without extensions', () => {
        (0, chai_1.expect)(fileSystem.getExtension('README')).to.be.equal(undefined);
    });
    (0, mocha_1.it)('should return true for files of interest', () => {
        (0, chai_1.expect)(fileSystem.isFileOfInterest('document.md')).to.be.equal(true);
        (0, chai_1.expect)(fileSystem.isFileOfInterest('diagram.bpmn')).to.be.equal(true);
    });
    (0, mocha_1.it)('should return false for files not of interest', () => {
        (0, chai_1.expect)(fileSystem.isFileOfInterest('image.png')).to.be.equal(false);
        (0, chai_1.expect)(fileSystem.isFileOfInterest('audio.mp3')).to.be.equal(false);
    });
    (0, mocha_1.it)('should handle filenames without extensions', () => {
        (0, chai_1.expect)(fileSystem.isFileOfInterest('README')).to.be.equal(false);
    });
});
(0, mocha_1.describe)('Folder Validation', () => {
    let readDirectoryStub;
    let manager;
    (0, mocha_1.setup)(() => {
        const workspaceFs = { ...vscode_1.workspace.fs };
        // Stubbing for readDirectory
        readDirectoryStub = (0, sinon_1.stub)(workspaceFs, 'readDirectory');
        readDirectoryStub
            .withArgs((0, sinon_1.match)((uri) => uri.fsPath.endsWith('/test-directory')))
            .resolves([
            ['file1.txt', vscode_1.FileType.File],
            ['subdir', vscode_1.FileType.Directory],
        ]);
        readDirectoryStub
            .withArgs((0, sinon_1.match)((uri) => uri.fsPath.endsWith('/empty-directory')))
            .resolves([]);
        readDirectoryStub.rejects(new Error('Directory not found'));
        manager = new fileSystem_utils_1.FileSystemManager(workspaceFs);
    });
    (0, mocha_1.teardown)(() => {
        readDirectoryStub.restore();
    });
    (0, mocha_1.it)('should correctly read the directory content', async () => {
        const result = await manager.retrieveNonIgnoredEntries('/test-directory');
        (0, chai_1.expect)(result).to.deep.equal([
            ['file1.txt', vscode_1.FileType.File],
            ['subdir', vscode_1.FileType.Directory],
        ]);
    });
    (0, mocha_1.it)('should return an empty array for an empty directory', async () => {
        const result = await manager.retrieveNonIgnoredEntries('/empty-directory');
        (0, chai_1.expect)(result).to.deep.equal([]);
    });
});
(0, mocha_1.describe)('File Writing', () => {
    let writeFileStub;
    let errorOutputStub;
    let fileSystem;
    let fsWrapper;
    (0, mocha_1.before)(() => {
        error_utils_1.ErrorManager.initialize();
    });
    (0, mocha_1.setup)(() => {
        fsWrapper = {
            ...vscode_1.workspace.fs,
            writeFile: async (uri, content) => {
                return vscode_1.workspace.fs.writeFile(uri, content);
            },
        };
        writeFileStub = (0, sinon_1.stub)(fsWrapper, 'writeFile');
        errorOutputStub = (0, sinon_1.stub)(error_utils_1.ErrorManager, 'outputError');
        fileSystem = new fileSystem_utils_1.FileSystemManager(fsWrapper);
    });
    (0, mocha_1.teardown)(() => {
        writeFileStub.restore();
        errorOutputStub.restore();
    });
    (0, mocha_1.it)('should handle write errors gracefully', async () => {
        writeFileStub.rejects(new Error('Some write error'));
        await fileSystem.writeFile('some/file/path', 'some content');
        sinon_1.assert.calledWith(errorOutputStub, 'Failed to write to file: some/file/path. Error: Some write error');
    });
    (0, mocha_1.it)('should write to the file successfully', async () => {
        const uri = vscode_1.Uri.file('some/file/path.txt');
        const content = 'Hello, world!';
        await fileSystem.writeFile(uri.fsPath, content);
        sinon_1.assert.calledWith(writeFileStub, uri, sinon_1.match.instanceOf(Buffer).and(sinon_1.match.has('length', Buffer.from(content).length)));
    });
});
//# sourceMappingURL=fileSystem.test.js.map