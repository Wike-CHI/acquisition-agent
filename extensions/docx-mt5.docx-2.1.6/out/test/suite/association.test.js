"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const sinon_1 = require("sinon");
const vscode_1 = require("vscode");
const mocha_1 = require("mocha");
const association_validator_1 = require("../../association.validator");
const fileSystem_utils_1 = require("../../utils/fileSystem.utils");
const association_manager_1 = require("../../association.manager");
const error_utils_1 = require("../../utils/error.utils");
(0, mocha_1.describe)('Associations JSON Validation', () => {
    const jsonMock = JSON.stringify({
        associations: {
            'src': ['/docx/ifTernary.md', '/docx/asyncAwait.md'],
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'src/Controllers': ['/docx/controllers.md'],
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'src/Modules': ['/docx/modules.md'],
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'src/Utils/dates.ts': ['/docx/utils/dates.md'],
        },
    });
    let fileSystemStub;
    let validatorStub;
    let errorManagerStub;
    let validator;
    let manager;
    (0, mocha_1.setup)(() => {
        fileSystemStub = (0, sinon_1.createStubInstance)(fileSystem_utils_1.FileSystemManager);
        validatorStub = (0, sinon_1.createStubInstance)(association_validator_1.AssociationsValidator);
        errorManagerStub = (0, sinon_1.stub)(error_utils_1.ErrorManager, 'outputError');
        fileSystemStub.ensureFileExists
            .withArgs((0, sinon_1.match)((uri) => {
            return (
            // Folder structure mock
            uri.fsPath.endsWith('src') ||
                uri.fsPath.endsWith('src/Controllers') ||
                uri.fsPath.endsWith('src/Modules') ||
                uri.fsPath.endsWith('src/Utils/dates.ts') ||
                // Documentations mock
                uri.fsPath.endsWith('/docx/ifTernary.md') ||
                uri.fsPath.endsWith('/docx/asyncAwait.md') ||
                uri.fsPath.endsWith('/docx/controllers.md') ||
                uri.fsPath.endsWith('/docx/modules.md') ||
                uri.fsPath.endsWith('/docx/general.md') ||
                uri.fsPath.endsWith('/docx/utils/dates.md'));
        }))
            .resolves();
        fileSystemStub.ensureFileExists.rejects(new Error('File not found'));
        const baseDir = vscode_1.workspace.workspaceFolders?.[0]?.uri?.fsPath ?? '';
        validator = new association_validator_1.AssociationsValidator(baseDir, fileSystemStub);
        manager = new association_manager_1.AssociationsManager();
    });
    (0, mocha_1.teardown)(() => {
        fileSystemStub.ensureFileExists.restore();
        errorManagerStub.restore();
    });
    (0, mocha_1.it)('should ensure all defined directories exist', async () => {
        const jsonConfig = JSON.parse(jsonMock);
        const definedDirectories = Object.keys(jsonConfig.associations);
        const errors = await validator.validateDirectoryPaths(definedDirectories);
        (0, chai_1.expect)(errors, `Some directories do not exist`).to.have.lengthOf(0);
    });
    (0, mocha_1.it)('should detect and return the undefined directories', async () => {
        const jsonMockWithMissingDirectory = JSON.stringify({
            associations: {
                ...JSON.parse(jsonMock).associations,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'src/Services': ['/docx/services.md'],
            },
        });
        const jsonConfig = JSON.parse(jsonMockWithMissingDirectory);
        const definedDirectories = Object.keys(jsonConfig.associations);
        const errors = await validator.validateDirectoryPaths(definedDirectories);
        (0, chai_1.expect)(errors, `Expected missing directories not found`).to.have.length.above(0);
        (0, chai_1.expect)(errors[0].entityPath).to.equal('src/Services');
        (0, chai_1.expect)(errors[0].entityType).to.equal('directory');
    });
    (0, mocha_1.it)('should ensure all defined documentations exist', async () => {
        const jsonConfig = JSON.parse(jsonMock);
        const errors = await validator.validateDocumentationPaths(jsonConfig.associations);
        (0, chai_1.expect)(errors, `Some documentation files do not exist`).to.have.lengthOf(0);
    });
    (0, mocha_1.it)('should not find any duplicated documentation paths if none exist', () => {
        const jsonConfig = JSON.parse(jsonMock);
        const duplicatesList = validator.findDuplicateDocsInDirectory(jsonConfig.associations);
        (0, chai_1.expect)(duplicatesList.length, 'No duplicates should exist but found some').to.equal(0);
    });
    (0, mocha_1.it)('should detect and return duplicated documentation paths', () => {
        const jsonMockWithDuplications = JSON.stringify({
            associations: {
                ...JSON.parse(jsonMock).associations,
                src: ['/docx/general.md', '/docx/ifTernary.md', '/docx/asyncAwait.md', '/docx/general.md'],
            },
        });
        const jsonConfig = JSON.parse(jsonMockWithDuplications);
        const duplicatesList = validator.findDuplicateDocsInDirectory(jsonConfig.associations);
        (0, chai_1.expect)(duplicatesList.length, `Expected duplicates not found`).to.be.greaterThan(0);
        const duplicateError = duplicatesList[0];
        (0, chai_1.expect)(duplicateError.errorType).to.equal('DUPLICATE');
        (0, chai_1.expect)(duplicateError.entityType).to.equal('documentationFile');
        (0, chai_1.expect)(duplicateError.entityPath).to.equal('/docx/general.md');
        (0, chai_1.expect)(duplicateError.originalLocation).to.equal('src');
        (0, chai_1.expect)(duplicateError.duplicateLocation).to.equal('src');
    });
    (0, mocha_1.it)('should ensure no documentation is inherited in child directories', () => {
        const jsonConfig = JSON.parse(jsonMock);
        const duplicatesList = validator.findInheritedDuplicateDocsInDirectory(jsonConfig.associations);
        (0, chai_1.expect)(duplicatesList.length, `Documentation inherited in child directories`).to.equal(0);
    });
    (0, mocha_1.it)('should return an error object if a documentation is inherited in child directories', () => {
        const jsonMockWithInheritedDocs = JSON.stringify({
            associations: {
                ...JSON.parse(jsonMock).associations,
                'src': ['/docx/general.md', '/docx/ifTernary.md', '/docx/asyncAwait.md'],
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'src/Controllers': ['/docx/controllers.md', '/docx/general.md'],
            },
        });
        const jsonConfig = JSON.parse(jsonMockWithInheritedDocs);
        const duplicatesList = validator.findInheritedDuplicateDocsInDirectory(jsonConfig.associations);
        (0, chai_1.expect)(duplicatesList.length, `Expected inherited documentation not found`).to.be.greaterThan(0);
        const error = duplicatesList[0];
        (0, chai_1.expect)(error.errorType).to.equal('DUPLICATE');
        (0, chai_1.expect)(error.entityType).to.equal('documentationFile');
    });
    (0, mocha_1.it)('should validate provided JSON and detect all issues', async () => {
        const faultyData = {
            associations: {
                'src': ['/docx/nonExistent.md', '/docx/asyncAwait.md'],
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'src/nonExistentDir': ['/docx/ifTernary.md'],
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'src/Controllers': ['/docx/controllers.md', '/docx/ifTernary.md'],
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'src/Modules': ['/docx/asyncAwait.md'],
            },
        };
        const errors = await validator.validateAssociations(faultyData);
        (0, chai_1.expect)(errors).to.be.an('array').that.has.length.above(0);
        const missingDocErrors = errors?.filter((err) => err.errorType === 'MISSING' && err.entityType === 'documentationFile') ?? [];
        (0, chai_1.expect)(missingDocErrors).to.have.lengthOf(1);
        (0, chai_1.expect)(missingDocErrors[0].entityPath).to.equal('/docx/nonExistent.md');
        const missingDirErrors = errors?.filter((err) => err.errorType === 'MISSING' && err.entityType === 'directory') ?? [];
        (0, chai_1.expect)(missingDirErrors).to.have.lengthOf(1);
        (0, chai_1.expect)(missingDirErrors[0].entityPath).to.equal('src/nonExistentDir');
        const duplicateDocErrors = errors?.filter((err) => err.errorType === 'DUPLICATE');
        (0, chai_1.expect)(duplicateDocErrors).to.have.lengthOf(1);
        const inheritedDupDocErrors = validator.findInheritedDuplicateDocsInDirectory(faultyData.associations);
        (0, chai_1.expect)(inheritedDupDocErrors).to.be.an('array').that.has.length.above(0);
    });
    (0, mocha_1.it)('should return an empty array if validation errors occur', async () => {
        validatorStub.validateAssociations.resolves([]);
        const result = await manager.associate([], JSON.parse(jsonMock), 'src');
        (0, chai_1.expect)(result).to.deep.equal([]);
    });
    (0, mocha_1.it)('should return an empty array if no associated docs for currUserPath', async () => {
        validatorStub.validateAssociations.resolves([]);
        fileSystemStub.processFileContent.returns({ associations: {} });
        const result = await manager.associate([], JSON.parse(jsonMock), 'nonexistentPath');
        (0, chai_1.expect)(result).to.deep.equal([]);
    });
    (0, mocha_1.it)('should return associated documentations for currUserPath', async () => {
        const mockDoc = [
            { name: 'ifTernary.md', path: '/docx/ifTernary.md', type: '.md', content: 'content' },
            { name: 'asyncAwait.md', path: '/docx/asyncAwait.md', type: '.md', content: 'content' },
            {
                name: 'someOtherDoc.md',
                path: '/docx/someOtherDoc.md',
                type: '.md',
                content: 'content',
            },
        ];
        fileSystemStub.processFileContent.returns(JSON.parse(jsonMock));
        const srcResult = await manager.associate(mockDoc, JSON.parse(jsonMock), 'src');
        (0, chai_1.expect)(srcResult).to.have.length(2);
        (0, chai_1.expect)(srcResult[0].path).to.equal('/docx/asyncAwait.md');
        (0, chai_1.expect)(srcResult[1].path).to.equal('/docx/ifTernary.md');
        fileSystemStub.processFileContent.returns(JSON.parse(jsonMock));
    });
    (0, mocha_1.it)('should return associated documentations for currUserPath including parent associations', async () => {
        const mockDoc = [
            { name: 'ifTernary.md', path: '/docx/ifTernary.md', type: '.md', content: 'content' },
            { name: 'asyncAwait.md', path: '/docx/asyncAwait.md', type: '.md', content: 'content' },
            { name: 'controllers.md', path: '/docx/controllers.md', type: '.md', content: 'content' },
            { name: 'modules.md', path: '/docx/modules.md', type: '.md', content: 'content' },
            { name: 'dates.md', path: '/docx/utils/dates.md', type: '.md', content: 'content' },
        ];
        fileSystemStub.processFileContent.returns(JSON.parse(jsonMock));
        // Test for a child directory. Expecting both parent (src) and its own (src/Modules) associations.
        const modulesResult = await manager.associate(mockDoc, JSON.parse(jsonMock), 'src/Modules');
        (0, chai_1.expect)(modulesResult).to.have.length(3); // Including parent's documentation
        (0, chai_1.expect)(modulesResult.some((doc) => doc.path === '/docx/ifTernary.md')).to.be.equal(true);
        (0, chai_1.expect)(modulesResult.some((doc) => doc.path === '/docx/asyncAwait.md')).to.be.equal(true);
        (0, chai_1.expect)(modulesResult.some((doc) => doc.path === '/docx/modules.md')).to.be.equal(true);
    });
});
//# sourceMappingURL=association.test.js.map