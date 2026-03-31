"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtensionManager = void 0;
const vscode_1 = require("vscode");
const command_registry_1 = require("./commands/command.registry");
const command_factory_1 = require("./commands/command.factory");
class ExtensionManager {
    constructor(context) {
        this.commandRegistry = new command_registry_1.CommandRegistry();
        this.context = context;
        // Configure the commands
        this.configureCommands();
    }
    configureCommands() {
        this.commandRegistry.register('docx.generateDocxJson', command_factory_1.CommandFactory.createGenerateDocxJsonCommand());
        this.commandRegistry.register('docx.cleanupDocxJson', command_factory_1.CommandFactory.createCleanupDocxJsonCommand());
        this.commandRegistry.register('docx.openDropdown', command_factory_1.CommandFactory.createDropdownCommand());
        this.commandRegistry.register('docx.addGithubToken', command_factory_1.CommandFactory.createGithubTokenCommand(this.context));
        this.commandRegistry.register('docx.deleteGithubToken', command_factory_1.CommandFactory.deleteGithubTokenCommand(this.context));
        this.commandRegistry.register('docx.addGitlabToken', command_factory_1.CommandFactory.createGitlabTokenCommand(this.context));
        this.commandRegistry.register('docx.deleteGitlabToken', command_factory_1.CommandFactory.deleteGitlabTokenCommand(this.context));
    }
    registerCommands(context) {
        for (const commandName in this.commandRegistry.commands) {
            const disposable = vscode_1.commands.registerCommand(commandName, async () => {
                await this.commandRegistry.get(commandName).execute();
            });
            context.subscriptions.push(disposable);
        }
    }
}
exports.ExtensionManager = ExtensionManager;
//# sourceMappingURL=extension.manager.js.map