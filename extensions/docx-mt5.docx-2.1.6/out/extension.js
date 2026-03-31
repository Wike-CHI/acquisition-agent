"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode_1 = require("vscode");
const workspace_utils_1 = require("./utils/workspace.utils");
const fileSystem_utils_1 = require("./utils/fileSystem.utils");
const error_utils_1 = require("./utils/error.utils");
const schema_manager_1 = require("./config/schema.manager");
const repository_controller_1 = require("./api/repository.controller");
const credentials_utils_1 = require("./utils/credentials.utils");
const extension_manager_1 = require("./extension.manager");
const data_store_1 = require("./data.store");
async function activate(context) {
    const configFilename = '.docx.json';
    const fileSystem = new fileSystem_utils_1.FileSystemManager();
    const workspaceFolder = workspace_utils_1.WorkspaceManager.getWorkspaceFolder();
    const credentialManager = new credentials_utils_1.CredentialManager(context.secrets);
    const configFileObserver = vscode_1.workspace.createFileSystemWatcher(`${workspaceFolder}/${configFilename}`);
    error_utils_1.ErrorManager.initialize();
    schema_manager_1.SchemaManager.initialize(`/${configFilename}`, 'https://raw.githubusercontent.com/Mehdi-Verfaillie/docx/main/src/config/.docx.schema.json');
    const dataStore = data_store_1.DataStore.getInstance();
    let tokens = await credentialManager.getTokens();
    const refreshDocumentations = async () => {
        try {
            const jsonConfig = await fileSystem.readFile(`${workspaceFolder}/${configFilename}`);
            dataStore.jsonConfig = jsonConfig;
            const repositoryController = await repository_controller_1.RepositoryController.create(dataStore.jsonConfig, tokens);
            const documentations = await repositoryController.getDocumentations();
            dataStore.documentations = documentations;
        }
        catch (error) {
            /** empty */
        }
    };
    /** Initial fetch */
    await refreshDocumentations();
    configFileObserver.onDidChange(async () => {
        await refreshDocumentations();
    });
    credentialManager.onTokenChange(async () => {
        tokens = await credentialManager.getTokens();
        await refreshDocumentations();
    });
    new extension_manager_1.ExtensionManager(context).registerCommands(context);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map