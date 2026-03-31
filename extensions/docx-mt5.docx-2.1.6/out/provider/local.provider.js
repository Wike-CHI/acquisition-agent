"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalProvider = void 0;
const workspace_utils_1 = require("../utils/workspace.utils");
const vscode_1 = require("vscode");
class LocalProvider {
    constructor(fileSystem) {
        this.fileSystem = fileSystem;
        this.fileSystem = fileSystem;
    }
    async getDocumentations() {
        const directoryPath = workspace_utils_1.WorkspaceManager.getWorkspaceFolderUri();
        return await this.fetchDocumentation(directoryPath);
    }
    async fetchDocumentation(directoryUri) {
        const entries = (await this.fileSystem.retrieveNonIgnoredEntries(directoryUri.fsPath)) ?? [];
        let documentation = [];
        for (const [filename, fileType] of entries) {
            const filePath = vscode_1.Uri.joinPath(directoryUri, filename);
            if (fileType === vscode_1.FileType.Directory) {
                const nestedDocs = await this.fetchDocumentation(filePath);
                documentation = documentation.concat(nestedDocs);
            }
            else if (this.fileSystem.isFileOfInterest(filename)) {
                const content = await this.fileSystem.readFile(filePath.fsPath);
                documentation.push({
                    name: filename,
                    path: vscode_1.workspace.asRelativePath(filePath.path),
                    type: this.fileSystem.getExtension(filename),
                    content: content,
                });
            }
        }
        return documentation;
    }
}
exports.LocalProvider = LocalProvider;
//# sourceMappingURL=local.provider.js.map