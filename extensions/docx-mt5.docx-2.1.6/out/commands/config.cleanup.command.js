"use strict";
// File: cleanupDocxJson.command.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.CleanupDocxJsonCommand = void 0;
const error_utils_1 = require("../utils/error.utils");
const workspace_utils_1 = require("../utils/workspace.utils");
const path_1 = require("path");
class CleanupDocxJsonCommand {
    constructor(configGenerator, configFilePath, notifier) {
        this.configGenerator = configGenerator;
        this.configFilePath = configFilePath;
        this.notifier = notifier;
        this.rootPath = workspace_utils_1.WorkspaceManager.getWorkspaceFolder();
    }
    async execute() {
        if (!this.rootPath)
            return error_utils_1.ErrorManager.outputError('Unable to find the rootPath of your project');
        const fullConfigFilePath = (0, path_1.join)(this.rootPath, this.configFilePath);
        try {
            await this.configGenerator.cleanupDocxJson(fullConfigFilePath);
            this.notifier.notifySuccess('.docx.json file cleaned up successfully!');
        }
        catch (error) {
            this.notifier.notifyError(`Failed to clean up .docx.json file: ${error}`);
        }
    }
}
exports.CleanupDocxJsonCommand = CleanupDocxJsonCommand;
//# sourceMappingURL=config.cleanup.command.js.map