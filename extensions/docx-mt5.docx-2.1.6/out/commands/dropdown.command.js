"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DropdownCommand = void 0;
const association_manager_1 = require("../association.manager");
const data_store_1 = require("../data.store");
const workspace_utils_1 = require("../utils/workspace.utils");
const webview_1 = require("../webview/webview");
const vscode_1 = require("vscode");
class DropdownCommand {
    constructor(fileSystem) {
        this.fileSystem = fileSystem;
        this.dataStore = data_store_1.DataStore.getInstance();
        this.fileSystem = fileSystem;
    }
    async execute() {
        const currentUserPath = workspace_utils_1.WorkspaceManager.getCurrentUserPath();
        if (!currentUserPath)
            return;
        const manager = new association_manager_1.AssociationsManager();
        const filteredDocumentations = await manager.associate(this.dataStore.documentations, this.fileSystem.processFileContent(this.dataStore.jsonConfig), currentUserPath);
        const selectedDoc = await vscode_1.window.showQuickPick(filteredDocumentations.map((doc) => {
            return { label: doc.name, content: doc.content, path: doc.path, type: doc.type };
        }));
        if (selectedDoc) {
            (0, webview_1.webView)({
                name: selectedDoc.label,
                content: selectedDoc.content,
                path: selectedDoc.path,
                type: selectedDoc.type,
            });
        }
    }
}
exports.DropdownCommand = DropdownCommand;
//# sourceMappingURL=dropdown.command.js.map