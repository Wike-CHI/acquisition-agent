"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitlabProvider = void 0;
const error_utils_1 = require("../utils/error.utils");
const fileSystem_utils_1 = require("../utils/fileSystem.utils");
const replacerText_utils_1 = require("../utils/replacerText.utils");
class GitlabProvider {
    constructor(repository, token) {
        this.baseUrl = 'https://gitlab.com/api/v4';
        this.fetchDocumentation = async (repositoryContents, documentations) => {
            for (const repositoryContent of repositoryContents) {
                if (repositoryContent.type === 'blob' &&
                    this.fileSystem.isFileOfInterest(repositoryContent.name)) {
                    const documentation = await this.getFile(repositoryContent);
                    if (documentation) {
                        documentation.content = await this.transformImageURL.replacer(documentation.content);
                        documentations.push(documentation);
                    }
                }
            }
        };
        this.token = token;
        this.repository = this.getOwnerRepo(repository);
        this.fileSystem = new fileSystem_utils_1.FileSystemManager();
        this.transformImageURL = new replacerText_utils_1.ReplacerTextProvider(repository[0], token);
    }
    async getDocumentations() {
        const documentations = [];
        const data = await this.getRepoContent(`/projects/${this.repository.owner}%2F${this.repository.name}/repository/tree?ref=main&recursive=true`);
        await this.fetchDocumentation(data, documentations);
        return documentations;
    }
    async getRepoContent(route) {
        const headers = this.token ? { headers: { 'PRIVATE-TOKEN': this.token } } : {};
        const response = await fetch(this.baseUrl + route, headers);
        if (response.status === 401) {
            error_utils_1.ErrorManager.outputError("Gitlab Bad Credential: Votre token d'authentification est invalide ou expiré.");
            return;
        }
        if (response.status === 404) {
            error_utils_1.ErrorManager.outputError("Gitlab repository not found ( add token if it's private repository )");
            return;
        }
        return await response.json();
    }
    async getFile(file) {
        const filePathEncoded = encodeURIComponent(file.path);
        const url = `https://gitlab.com/api/v4/projects/${this.repository.owner}%2F${this.repository.name}/repository/files/${filePathEncoded}/raw`;
        const requestOptions = this.token
            ? { headers: { 'PRIVATE-TOKEN': this.token } }
            : {};
        const response = await fetch(url, requestOptions);
        if (response.status === 401) {
            error_utils_1.ErrorManager.outputError("Gitlab Bad Credential: Votre token d'authentification est invalide ou expiré.");
            return;
        }
        const content = await response.text();
        return {
            type: this.fileSystem.getExtension(file.name),
            name: file.name,
            content: content,
            path: `https://gitlab.com/${this.repository.owner}/${this.repository.name}/-/blob/main/${file.path}`,
        };
    }
    getOwnerRepo(repository) {
        const urlParts = repository[0].split('/');
        return { owner: urlParts[3], name: urlParts[4] };
    }
}
exports.GitlabProvider = GitlabProvider;
//# sourceMappingURL=gitlab.provider.js.map