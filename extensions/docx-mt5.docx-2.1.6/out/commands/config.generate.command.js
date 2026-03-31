"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateDocxJsonCommand = void 0;
const error_utils_1 = require("../utils/error.utils");
const workspace_utils_1 = require("../utils/workspace.utils");
const path_1 = require("path");
class GenerateDocxJsonCommand {
    constructor(configGenerator, configFilePath, notifier) {
        this.configGenerator = configGenerator;
        this.configFilePath = configFilePath;
        this.notifier = notifier;
        this.rootPath = workspace_utils_1.WorkspaceManager.getWorkspaceFolder();
        this.configGenerator = configGenerator;
        this.configFilePath = configFilePath;
        this.notifier = notifier;
    }
    async execute() {
        if (!this.rootPath)
            return error_utils_1.ErrorManager.outputError('Unable to find the rootPath of your project');
        const fullConfigFilePath = (0, path_1.join)(this.rootPath, this.configFilePath);
        try {
            await this.configGenerator.generateDocxJson(this.rootPath, fullConfigFilePath);
            this.notifier.notifySuccess('.docx.json file generated successfully!');
        }
        catch (error) {
            this.notifier.notifyError(`Failed to generate .docx.json file: ${error}`);
        }
    }
}
exports.GenerateDocxJsonCommand = GenerateDocxJsonCommand;
//# sourceMappingURL=config.generate.command.js.map