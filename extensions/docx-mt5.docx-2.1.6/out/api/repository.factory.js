"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositoryFactory = void 0;
const repository_provider_1 = require("./repository.provider");
class RepositoryFactory {
    constructor(configs) {
        this.providers = [];
        for (const config of configs) {
            this.providers.push(new repository_provider_1.RepositoryProvider(config).instance);
        }
    }
    async getDocumentations() {
        const allDocs = [];
        for (const provider of this.providers) {
            const docs = await provider.getDocumentations();
            allDocs.push(...docs);
        }
        return allDocs;
    }
}
exports.RepositoryFactory = RepositoryFactory;
//# sourceMappingURL=repository.factory.js.map