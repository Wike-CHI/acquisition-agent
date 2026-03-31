"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSystemManager = void 0;
const minimatch_1 = require("minimatch");
const vscode_1 = require("vscode");
const error_utils_1 = require("./error.utils");
const extensionsOfInterest = ['.md', '.bpmn', '.html'];
class FileSystemManager {
    constructor(fs = vscode_1.workspace.fs, gitignoreFilePath) {
        this.fs = fs;
        this.ignorePatterns = ['.git'];
        this.fs = fs;
        if (gitignoreFilePath)
            this.loadGitignorePatterns(gitignoreFilePath);
    }
    async ensureFileExists(uri) {
        try {
            await this.fs.stat(uri);
            return true;
        }
        catch (error) {
            if (error instanceof Error && error?.message === 'File not found') {
                return false;
            }
            throw vscode_1.FileSystemError.FileNotFound(uri);
        }
    }
    async readFile(filePath) {
        try {
            const fileUint8Array = await this.fs.readFile(vscode_1.Uri.file(filePath));
            return new TextDecoder().decode(fileUint8Array);
        }
        catch (error) {
            throw new Error(`Failed to read file content: ${filePath}`);
        }
    }
    async retrieveNonIgnoredEntries(directoryPath) {
        const directoryEntries = await this.getDirectoryEntries(directoryPath);
        return directoryEntries.filter(this.filterOutIgnoredDirectories(directoryPath));
    }
    processFileContent(fileContent) {
        return JSON.parse(fileContent);
    }
    getExtension(filename) {
        const ext = '.' + filename.split('.').pop()?.toLowerCase();
        return extensionsOfInterest.includes(ext) ? ext : undefined;
    }
    isFileOfInterest(filename) {
        return !!this.getExtension(filename);
    }
    async writeFile(filePath, content) {
        try {
            const uri = vscode_1.Uri.file(filePath);
            const contentBuffer = typeof content === 'string' ? Buffer.from(content) : content;
            await this.fs.writeFile(uri, contentBuffer);
        }
        catch (error) {
            error_utils_1.ErrorManager.outputError(`Failed to write to file: ${filePath}. ${error}`);
        }
    }
    filterOutIgnoredDirectories(directoryPath) {
        return ([entryName, entryType]) => {
            if (entryType === vscode_1.FileType.Directory) {
                const fullPath = this.buildFullPath(directoryPath, entryName);
                return !this.isEntryIgnored(fullPath, entryName);
            }
            return true;
        };
    }
    async getDirectoryEntries(directoryPath) {
        try {
            return await this.fs.readDirectory(vscode_1.Uri.file(directoryPath));
        }
        catch (error) {
            error_utils_1.ErrorManager.outputError(`Something went wrong when trying to read local directories ${error}`);
            return [];
        }
    }
    buildFullPath(directoryPath, entryName) {
        return vscode_1.Uri.file(directoryPath).with({
            path: vscode_1.Uri.file(directoryPath).path + '/' + entryName,
        }).fsPath;
    }
    isEntryIgnored(fullPath, entryName) {
        return this.ignorePatterns.some((pattern) => this.isPatternMatching(pattern, fullPath, entryName));
    }
    isPatternMatching(pattern, fullPath, entryName) {
        const isRootLevel = pattern.startsWith('/');
        const normalizedPattern = this.normalizePattern(pattern);
        const matchFullPath = isRootLevel
            ? fullPath.startsWith(normalizedPattern)
            : fullPath.includes(normalizedPattern);
        const matchEntryName = (0, minimatch_1.minimatch)(entryName, normalizedPattern) || (0, minimatch_1.minimatch)(fullPath, normalizedPattern);
        return matchEntryName || matchFullPath;
    }
    normalizePattern(pattern) {
        return pattern.replace(/^\//, ''); // Remove leading slash
    }
    async loadGitignorePatterns(gitignoreFilePath) {
        try {
            const fileContent = await this.readFile(gitignoreFilePath);
            const gitignorePatterns = fileContent
                .split('\n')
                .filter((pattern) => pattern && !pattern.startsWith('#'));
            this.ignorePatterns = [...this.ignorePatterns, ...gitignorePatterns];
        }
        catch (error) {
            /* empty */
        }
    }
}
exports.FileSystemManager = FileSystemManager;
//# sourceMappingURL=fileSystem.utils.js.map