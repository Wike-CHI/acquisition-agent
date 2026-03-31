"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructuralValidator = void 0;
class StructuralValidator {
    static validateConfigStructure(config) {
        const associationsTypeErrors = this.validateAssociationsKeyStructure(config);
        if (associationsTypeErrors.length > 0)
            return associationsTypeErrors;
        const associationsDirectoriesErrors = this.validateDirectoriesKeyStructure(config);
        const associationsDocsErrors = this.validateDocsValuesStructure(config);
        const reverseSlashErrors = this.findBackSlashInPaths(config);
        const allErrors = [
            ...associationsTypeErrors,
            ...associationsDirectoriesErrors,
            ...associationsDocsErrors,
            ...reverseSlashErrors,
        ];
        return allErrors;
    }
    static validateAssociationsKeyStructure(config) {
        const errors = [];
        if (!config.associations) {
            errors.push({
                errorType: 'MISSING',
                entityType: 'associationsKey',
                entityPath: '',
                errorMsg: 'Expected a key named "associations" in the config file.',
            });
        }
        else if (typeof config.associations !== 'object' || Array.isArray(config.associations)) {
            errors.push({
                errorType: 'INVALID',
                entityType: 'associationsKey',
                entityPath: '',
                errorMsg: 'Expected an object for the "associations" key in the config file.',
            });
        }
        return errors;
    }
    static validateDirectoriesKeyStructure(config) {
        const errors = [];
        for (const directory of Object.keys(config.associations)) {
            if (typeof directory !== 'string' || directory === '') {
                errors.push({
                    errorType: 'MISSING',
                    entityType: 'directory',
                    entityPath: '',
                    errorMsg: 'Expected a string for directory path. Example: "src/controllers" or "src/controllers/auth.ts".',
                });
            }
        }
        return errors;
    }
    static validateDocsValuesStructure(config) {
        const errors = [];
        for (const [directories, documentations] of Object.entries(config.associations)) {
            if (!Array.isArray(documentations)) {
                errors.push({
                    errorType: 'INVALID',
                    entityType: 'documentationFile',
                    entityPath: '',
                    errorMsg: 'Expected an array of documentation files path. Example: ["doc1.md", "doc2.md"]',
                });
                break;
            }
            for (const [i, documentation] of documentations.entries()) {
                if (typeof documentation !== 'string') {
                    errors.push({
                        errorType: 'INVALID',
                        entityType: 'documentationFile',
                        entityPath: '',
                        errorMsg: 'Expected a string in the array of documentation files path. Example: ["doc1.md", "doc2.md"]',
                    });
                }
                else if (!documentation) {
                    errors.push({
                        errorType: 'MISSING',
                        entityType: 'documentationFile',
                        entityPath: directories
                            ? `directory ${directories[i]}`
                            : 'not found, directory is also missing',
                        errorMsg: 'Missing documentation file path. Example: ["doc1.md", "doc2.md"].',
                    });
                }
            }
        }
        return errors;
    }
    static findBackSlashInPaths(config) {
        const errors = [];
        for (const directory of Object.keys(config.associations)) {
            if (directory.includes('\\')) {
                errors.push({
                    errorType: 'INVALID',
                    entityType: 'directory',
                    entityPath: directory,
                    errorMsg: 'Expected forward slash (/) instead of backward slash (\\) in directory path.',
                });
            }
        }
        for (const documentations of Object.values(config.associations)) {
            if (!Array.isArray(documentations) || !documentations || !documentations.length) {
                break;
            }
            for (const documentation of documentations) {
                if (documentation.includes('\\')) {
                    errors.push({
                        errorType: 'INVALID',
                        entityType: 'documentationFile',
                        entityPath: documentation,
                        errorMsg: 'Expected forward slash (/) instead of backward slash (\\) in documentation file path.',
                    });
                }
            }
        }
        return errors;
    }
}
exports.StructuralValidator = StructuralValidator;
StructuralValidator.isJsonFile = (str) => {
    try {
        JSON.parse(str);
        return true;
    }
    catch (e) {
        return false;
    }
};
//# sourceMappingURL=structural.validator.js.map