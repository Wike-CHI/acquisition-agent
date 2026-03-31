"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GithubProvider = void 0;
const fileSystem_utils_1 = require("../utils/fileSystem.utils");
const replacerText_utils_1 = require("../utils/replacerText.utils");
const error_utils_1 = require("../utils/error.utils");
class GithubProvider {
    constructor(repository, token) {
        this.fetchDocumentation = async (repositoryContents, documentations) => {
            for (const repositoryContent of repositoryContents) {
                if (repositoryContent.type === 'file' &&
                    this.fileSystem.isFileOfInterest(repositoryContent.name)) {
                    const documentation = await this.getFile(repositoryContent);
                    documentation.content = await this.transformImageURL.replacer(documentation.content);
                    documentations.push(documentation);
                }
                if (repositoryContent.type === 'dir') {
                    const data = await this.getRepoContent(repositoryContent.url);
                    await this.fetchDocumentation(data, documentations);
                }
            }
        };
        this.repository = this.getOwnerRepo(repository);
        this.fileSystem = new fileSystem_utils_1.FileSystemManager();
        this.transformImageURL = new replacerText_utils_1.ReplacerTextProvider(repository[0], token);
        this.token = token;
    }
    async getDocumentations() {
        const documentations = [];
        const data = await this.getRepoContent(`https://api.github.com/repos/${this.repository.owner}/${this.repository.name}/contents`);
        await this.fetchDocumentation(data, documentations);
        return documentations;
    }
    async getRepoContent(route) {
        const headers = this.token ? { Authorization: `Bearer ${this.token}` } : {};
        const response = await fetch(route, { headers });
        if (response.status === 401) {
            error_utils_1.ErrorManager.outputError("Github Bad Credential: Votre token d'authentification est invalide ou expiré.");
            return;
        }
        if (response.status === 403) {
            error_utils_1.ErrorManager.outputError('Github API rate limit exceeded add token for higher limit');
            return;
        }
        return await response.json();
    }
    async getFile(file) {
        const data = await this.getRepoContent(file.url);
        return {
            type: this.fileSystem.getExtension(file.name),
            name: file.name,
            content: atob(data.content),
            path: file.html_url,
        };
    }
    getOwnerRepo(repository) {
        const urlParts = repository[0].split('/');
        return { owner: urlParts[3], name: urlParts[4] };
    }
}
exports.GithubProvider = GithubProvider;
//# sourceMappingURL=github.provider.js.map