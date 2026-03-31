"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const sinon_1 = require("sinon");
const gitlab_provider_1 = require("../../provider/gitlab.provider");
const mocha_1 = require("mocha");
(0, mocha_1.describe)('GitlabProvider', function () {
    (0, mocha_1.describe)('should get documentation .md from GitLab', function () {
        (0, mocha_1.it)('should fetch and return documentation from GitLab', async function () {
            const getContentGitlabStub = (0, sinon_1.stub)();
            getContentGitlabStub.resolves([
                {
                    type: 'blob',
                    name: 'example.md',
                },
            ]);
            const readFileGitlabStub = (0, sinon_1.stub)();
            readFileGitlabStub
                .withArgs((0, sinon_1.match)({
                type: 'blob',
                name: 'example.md',
            }))
                .resolves({ type: '.md', name: 'example.md', content: 'Mocked file', path: 'path.com' });
            const gitlabProvider = new gitlab_provider_1.GitlabProvider(['https://gitlab.com/owner/repo']);
            gitlabProvider.getRepoContent = getContentGitlabStub;
            gitlabProvider.getFile = readFileGitlabStub;
            const result = await gitlabProvider.getDocumentations();
            chai_1.assert.isArray(result);
            chai_1.assert.lengthOf(result, 1);
            chai_1.assert.deepEqual(result[0], {
                type: '.md',
                name: 'example.md',
                content: 'Mocked file',
                path: 'path.com',
            });
        });
    });
});
//# sourceMappingURL=gitlab.provider.test.js.map