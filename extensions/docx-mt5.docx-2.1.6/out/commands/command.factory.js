"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandFactory = void 0;
const vscode_1 = require("vscode");
const config_manager_1 = require("../config/config.manager");
const fileSystem_utils_1 = require("../utils/fileSystem.utils");
const notifier_utils_1 = require("../utils/notifier.utils");
const workspace_utils_1 = require("../utils/workspace.utils");
const index_1 = require("./index");
class CommandFactory {
    static createCleanupDocxJsonCommand() {
        return new index_1.CleanupDocxJsonCommand(this.configGenerator, '.docx.json', this.notifier);
    }
    static createGenerateDocxJsonCommand() {
        return new index_1.GenerateDocxJsonCommand(this.configGenerator, '.docx.json', this.notifier);
    }
    static createDropdownCommand() {
        return new index_1.DropdownCommand(this.fileSystem);
    }
    static createGithubTokenCommand(context) {
        return new index_1.TokenAddGithubCommand(context);
    }
    static deleteGithubTokenCommand(context) {
        return new index_1.TokenDeleteGithubCommand(context);
    }
    static createGitlabTokenCommand(context) {
        return new index_1.TokenAddGitlabCommand(context);
    }
    static deleteGitlabTokenCommand(context) {
        return new index_1.TokenDeleteGitlabCommand(context);
    }
}
exports.CommandFactory = CommandFactory;
_a = CommandFactory;
CommandFactory.workspaceFolder = workspace_utils_1.WorkspaceManager.getWorkspaceFolder();
CommandFactory.fileSystem = new fileSystem_utils_1.FileSystemManager(vscode_1.workspace.fs, `${_a.workspaceFolder}/.gitignore`);
CommandFactory.configGenerator = new config_manager_1.ConfigGenerator(_a.fileSystem);
CommandFactory.notifier = new notifier_utils_1.VsCodeNotifier();
//# sourceMappingURL=command.factory.js.map