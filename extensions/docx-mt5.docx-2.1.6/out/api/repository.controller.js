"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositoryController = void 0;
const association_validator_1 = require("../association.validator");
const structural_validator_1 = require("../structural.validator");
const error_utils_1 = require("../utils/error.utils");
const fileSystem_utils_1 = require("../utils/fileSystem.utils");
const workspace_utils_1 = require("../utils/workspace.utils");
const repository_factory_1 = require("./repository.factory");
const repository_strategy_1 = require("./repository.strategy");
class RepositoryController {
    constructor(json, fileSystem = new fileSystem_utils_1.FileSystemManager()) {
        this.baseDir = workspace_utils_1.WorkspaceManager.getWorkspaceFolder();
        this.providerStrategies = [
            new repository_strategy_1.LocalProviderStrategy(),
            new repository_strategy_1.RepositoryProviderStrategy(),
            new repository_strategy_1.WebProviderStrategy(),
        ];
        this.fileSystem = fileSystem;
        this.validator = new association_validator_1.AssociationsValidator(this.baseDir, this.fileSystem);
        this.configMapper = new ProviderConfigMapper(this.providerStrategies);
    }
    static async create(json, tokens = [], fileSystem = new fileSystem_utils_1.FileSystemManager()) {
        const instance = new RepositoryController(json, fileSystem);
        await instance.initialize(json, tokens);
        return instance;
    }
    async initialize(json, tokens) {
        const config = this.fileSystem.processFileContent(json);
        await this.validateConfig(config);
        const providerConfigs = await this.configMapper.mapConfigToProviders(config, tokens);
        this.repository = new repository_factory_1.RepositoryFactory(providerConfigs);
    }
    async getDocumentations() {
        try {
            return await this.repository.getDocumentations();
        }
        catch (error) {
            error_utils_1.ErrorManager.outputError(`Failed to fetch documentations ${error}`);
            return [];
        }
    }
    async validateConfig(config) {
        if (!config)
            error_utils_1.ErrorManager.outputError('Invalid configuration: Cannot find .docx.json file.');
        const structuralErrors = structural_validator_1.StructuralValidator.validateConfigStructure(config);
        const associationErrors = await this.validator.validateAssociations(config);
        const errors = [...structuralErrors, ...associationErrors];
        if (errors.length)
            error_utils_1.ErrorManager.outputError(errors);
    }
}
exports.RepositoryController = RepositoryController;
class ProviderConfigMapper {
    constructor(providerStrategies) {
        this.providerStrategies = providerStrategies;
    }
    async mapConfigToProviders(config, tokens) {
        const providerConfigsMap = new Map();
        for (const docLocations of Object.values(config.associations)) {
            for (const docLocation of docLocations) {
                const matchingStrategy = this.providerStrategies.find((strategy) => strategy.isMatch(docLocation));
                if (matchingStrategy) {
                    const providerConfig = matchingStrategy.getProviderConfig(docLocation, tokens, config.ignorePatterns);
                    const key = JSON.stringify(providerConfig); // Create a unique key for each config
                    providerConfigsMap.set(key, providerConfig);
                }
            }
        }
        return Array.from(providerConfigsMap.values());
    }
}
//# sourceMappingURL=repository.controller.js.map