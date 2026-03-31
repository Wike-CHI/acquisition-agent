"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositoryProvider = void 0;
const vscode_1 = require("vscode");
const github_provider_1 = require("../provider/github.provider");
const gitlab_provider_1 = require("../provider/gitlab.provider");
const local_provider_1 = require("../provider/local.provider");
const fileSystem_utils_1 = require("../utils/fileSystem.utils");
const web_provider_1 = require("../provider/web.provider");
const workspace_utils_1 = require("../utils/workspace.utils");
class RepositoryProvider {
    constructor(config) {
        switch (config.type) {
            case 'local':
                {
                    const workspaceFolder = workspace_utils_1.WorkspaceManager.getWorkspaceFolder();
                    const fileSystem = new fileSystem_utils_1.FileSystemManager(vscode_1.workspace.fs, `${workspaceFolder}/.gitignore`);
                    this.provider = new local_provider_1.LocalProvider(fileSystem);
                }
                break;
            case 'github':
                this.provider = new github_provider_1.GithubProvider(config.repositories, config.token);
                break;
            case 'gitlab':
                this.provider = new gitlab_provider_1.GitlabProvider(config.repositories, config.token);
                break;
            case 'web':
                this.provider = new web_provider_1.WebProvider(config.url);
                break;
            default:
                break;
        }
    }
    get instance() {
        return this.provider;
    }
}
exports.RepositoryProvider = RepositoryProvider;
//# sourceMappingURL=repository.provider.js.map