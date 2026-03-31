"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebProviderStrategy = exports.RepositoryProviderStrategy = exports.LocalProviderStrategy = void 0;
const error_utils_1 = require("../utils/error.utils");
const transform_utils_1 = require("../utils/transform.utils");
const knownRepositories = ['github.com', 'gitlab.com'];
class LocalProviderStrategy {
    isMatch(docLocation) {
        return !docLocation.startsWith('http');
    }
    getProviderConfig(docLocation, tokens, ignorePatterns) {
        return { type: 'local', ignorePatterns };
    }
}
exports.LocalProviderStrategy = LocalProviderStrategy;
class RepositoryProviderStrategy {
    isMatch(docLocation) {
        return knownRepositories.some((domain) => docLocation.includes(domain));
    }
    getProviderConfig(docLocation, tokens) {
        docLocation = transform_utils_1.DataTransformManager.removeQueryParamsFromUrl(docLocation);
        const domain = knownRepositories.find((domain) => docLocation.includes(domain));
        if (!domain) {
            error_utils_1.ErrorManager.outputError(`Unrecognized repository domain in URL: ${docLocation}`);
            throw new Error(`Unrecognized repository domain in URL: ${docLocation}`);
        }
        const repositoryName = this.extractRepositoryName(domain);
        let token;
        if (tokens && tokens.length > 0) {
            token = tokens.find((token) => token.provider === repositoryName)?.key;
        }
        return {
            type: repositoryName,
            repositories: [docLocation],
            token,
        };
    }
    extractRepositoryName(domain) {
        const type = domain.split('.')[0];
        if (type === 'github')
            return type;
        if (type === 'gitlab')
            return type;
        error_utils_1.ErrorManager.outputError(`Unrecognized repository type: ${type}`);
        throw new Error(`Unrecognized repository type: ${type}`);
    }
}
exports.RepositoryProviderStrategy = RepositoryProviderStrategy;
class WebProviderStrategy {
    isMatch(docLocation) {
        return (docLocation.startsWith('http') &&
            knownRepositories.every((domain) => !docLocation.includes(domain)));
    }
    getProviderConfig(docLocation) {
        return { type: 'web', url: docLocation };
    }
}
exports.WebProviderStrategy = WebProviderStrategy;
//# sourceMappingURL=repository.strategy.js.map