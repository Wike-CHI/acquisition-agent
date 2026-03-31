"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigGenerator = void 0;
const path_1 = require("path");
const vscode_1 = require("vscode");
const error_utils_1 = require("../utils/error.utils");
const transform_utils_1 = require("../utils/transform.utils");
class ConfigGenerator {
    constructor(fileSystem) {
        this.fileSystem = fileSystem;
    }
    async generateDocxJson(rootPath, configFilePath) {
        try {
            const existingConfig = await this.readDocxJson(configFilePath);
            const mergedIgnorePatterns = Array.from(new Set([...this.fileSystem.ignorePatterns, ...(existingConfig.ignorePatterns ?? [])]));
            const folderObject = await this.createFolderObject(rootPath, mergedIgnorePatterns);
            const newConfig = this.mergeConfigurations(existingConfig, folderObject);
            await this.writeDocxJson(newConfig, configFilePath);
        }
        catch (error) {
            error_utils_1.ErrorManager.outputError(`An error occur when trying to generate the config file. ${error}`);
        }
    }
    async cleanupDocxJson(configFilePath) {
        try {
            const existingConfig = await this.readDocxJson(configFilePath);
            const cleanedConfig = this.sanitizeConfig(existingConfig);
            await this.writeDocxJson(cleanedConfig, configFilePath);
        }
        catch (error) {
            error_utils_1.ErrorManager.outputError(`An error occurred while trying to clean up the config file. ${error}`);
        }
    }
    async createFolderObject(directoryPath, ignorePatterns, parentPath = '') {
        const entries = await this.fileSystem.retrieveNonIgnoredEntries(directoryPath);
        const folderObject = {};
        for (const [name, type] of entries) {
            const fullPath = (0, path_1.join)(parentPath, name);
            // Skip the current entry if it matches any of the ignore patterns
            if (ignorePatterns.some((pattern) => fullPath.includes(pattern))) {
                continue;
            }
            if (type === vscode_1.FileType.Directory) {
                folderObject[fullPath] = []; // Use the full path as the key
                const subfolder = await this.createFolderObject((0, path_1.join)(directoryPath, name), ignorePatterns, fullPath);
                Object.assign(folderObject, subfolder); // Merge with the main object
            }
        }
        return folderObject;
    }
    async readDocxJson(filePath) {
        try {
            const fileContent = await this.fileSystem.readFile(filePath);
            return this.fileSystem.processFileContent(fileContent);
        }
        catch {
            return { ignorePatterns: [], associations: {} };
        }
    }
    mergeConfigurations(existingConfig, folderObject) {
        const newConfig = {
            ignorePatterns: existingConfig.ignorePatterns || [],
            associations: { ...existingConfig.associations },
        };
        for (const key in folderObject) {
            if (!newConfig.associations[key]) {
                newConfig.associations[key] = [];
            }
        }
        newConfig.associations = transform_utils_1.DataTransformManager.sortObjectKeys(newConfig.associations);
        return newConfig;
    }
    async writeDocxJson(config, filePath) {
        try {
            const content = JSON.stringify(config, null, 2);
            await this.fileSystem.writeFile(filePath, content);
        }
        catch (error) {
            error_utils_1.ErrorManager.outputError(`An error occur when trying to write in the config file. ${error}`);
        }
    }
    sanitizeConfig(config) {
        const cleanedAssociations = {};
        for (const [key, value] of Object.entries(config.associations)) {
            if (value.length > 0) {
                cleanedAssociations[key] = value;
            }
        }
        return {
            ignorePatterns: config.ignorePatterns || [],
            associations: cleanedAssociations,
        };
    }
}
exports.ConfigGenerator = ConfigGenerator;
//# sourceMappingURL=config.manager.js.map