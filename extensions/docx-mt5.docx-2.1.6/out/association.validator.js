"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssociationsValidator = void 0;
const vscode_1 = require("vscode");
const repository_strategy_1 = require("./api/repository.strategy");
class AssociationsValidator {
    constructor(baseDir, fileSystem) {
        this.localStrategy = new repository_strategy_1.LocalProviderStrategy();
        this.baseDir = baseDir;
        this.fileSystem = fileSystem;
    }
    async validateAssociations({ associations, }) {
        const dirErrors = await this.validateDirectoryPaths(Object.keys(associations));
        const docErrors = await this.validateDocumentationPaths(associations);
        const dupDocErrors = this.findDuplicateDocsInDirectory(associations);
        const inheritedDupDocErrors = this.findInheritedDuplicateDocsInDirectory(associations);
        const allErrors = [...dirErrors, ...docErrors, ...dupDocErrors, ...inheritedDupDocErrors];
        return allErrors;
    }
    async validateDirectoryPaths(directories) {
        const errors = await Promise.all(directories.map((directory) => this.checkExistence(directory, 'directory')));
        return errors.filter(Boolean);
    }
    async validateDocumentationPaths(associations) {
        const allDocumentPaths = Object.values(associations).flat();
        const errors = await Promise.all(allDocumentPaths.map((doc) => this.localStrategy.isMatch(doc) && this.checkExistence(doc, 'documentationFile')));
        return errors.filter(Boolean);
    }
    findDuplicateDocsInDirectory(associations) {
        const duplicates = [];
        Object.entries(associations).forEach(([directory, docs]) => {
            const seenDocs = new Set();
            docs.forEach((doc) => {
                if (seenDocs.has(doc)) {
                    duplicates.push({
                        errorType: 'DUPLICATE',
                        entityType: 'documentationFile',
                        entityPath: doc,
                        originalLocation: directory,
                        duplicateLocation: directory,
                    });
                }
                else {
                    seenDocs.add(doc);
                }
            });
        });
        return duplicates;
    }
    findInheritedDuplicateDocsInDirectory(associations) {
        const errors = [];
        for (const [parentDir, parentDocs] of Object.entries(associations)) {
            for (const [childDir, childDocs] of Object.entries(associations)) {
                if (childDir.startsWith(parentDir) && childDir !== parentDir) {
                    for (const doc of parentDocs) {
                        if (childDocs.includes(doc)) {
                            errors.push({
                                errorType: 'DUPLICATE',
                                entityType: 'documentationFile',
                                entityPath: doc,
                                originalLocation: parentDir,
                                duplicateLocation: childDir,
                            });
                        }
                    }
                }
            }
        }
        return errors;
    }
    async checkExistence(name, type) {
        const uri = vscode_1.Uri.file(`${this.baseDir}/${name}`);
        try {
            await this.fileSystem.ensureFileExists(uri);
            return; // Entity exists, no error
        }
        catch {
            return {
                errorType: 'MISSING',
                entityType: type,
                entityPath: name,
            }; // Return the error
        }
    }
}
exports.AssociationsValidator = AssociationsValidator;
//# sourceMappingURL=association.validator.js.map