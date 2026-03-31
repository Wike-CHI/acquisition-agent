"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const sinon_1 = require("sinon");
const github_provider_1 = require("../../provider/github.provider");
const mocha_1 = require("mocha");
(0, mocha_1.describe)('GithubProvider', function () {
    (0, mocha_1.describe)('should get documentation .md github', function () {
        (0, mocha_1.it)('should fetch and return documentation from GitHub', async function () {
            const getContentGithubStub = (0, sinon_1.stub)();
            getContentGithubStub.resolves([
                {
                    type: 'file',
                    name: 'example.md',
                    download_url: 'https://example.com/example.md',
                },
            ]);
            const readFileGithubStub = (0, sinon_1.stub)();
            readFileGithubStub
                .withArgs((0, sinon_1.match)({
                type: 'file',
                name: 'example.md',
                download_url: 'https://example.com/example.md',
            }))
                .resolves({ type: '.md', name: 'example.md', content: 'Mocked file', path: 'path.com' });
            const githubProvider = new github_provider_1.GithubProvider(['https://github.com/owner/repo']);
            githubProvider.getRepoContent = getContentGithubStub;
            githubProvider.getFile = readFileGithubStub;
            const result = await githubProvider.getDocumentations();
            chai_1.assert.isArray(result);
            chai_1.assert.lengthOf(result, 1);
            chai_1.assert.deepEqual(result[0], {
                type: '.md',
                name: 'example.md',
                content: 'Mocked file',
                path: 'path.com',
            });
        });
        (0, mocha_1.it)('should fetch and return list documentation from GitHub', async function () {
            const getContentGithubStub = (0, sinon_1.stub)();
            getContentGithubStub.resolves([
                {
                    type: 'file',
                    name: 'example.md',
                    url: 'https://example.com/example.md',
                },
                {
                    type: 'file',
                    name: 'example2.md',
                    download_url: 'https://example.com/example2.md',
                },
            ]);
            const readFileGithubStub = (0, sinon_1.stub)();
            readFileGithubStub
                .onFirstCall()
                .resolves({ type: '.md', name: 'example.md', content: 'Mocked file 1', path: 'path.com' })
                .onSecondCall()
                .resolves({ type: '.md', name: 'example2.md', content: 'Mocked file 2', path: 'path.com' });
            const githubProvider = new github_provider_1.GithubProvider(['https://github.com/owner/repo']);
            githubProvider.getRepoContent = getContentGithubStub;
            githubProvider.getFile = readFileGithubStub;
            const result = await githubProvider.getDocumentations();
            chai_1.assert.isArray(result);
            chai_1.assert.lengthOf(result, 2);
            chai_1.assert.deepEqual(result[0], {
                type: '.md',
                name: 'example.md',
                content: 'Mocked file 1',
                path: 'path.com',
            });
            chai_1.assert.deepEqual(result[1], {
                type: '.md',
                name: 'example2.md',
                content: 'Mocked file 2',
                path: 'path.com',
            });
        });
        (0, mocha_1.it)('should fetch and return list documentation from the file and all the files in the folder', async function () {
            const getContentGithubStub = (0, sinon_1.stub)();
            getContentGithubStub
                .onFirstCall()
                .resolves([
                {
                    type: 'dir',
                    name: 'example',
                    url: 'https://example.com/?ref=main',
                },
                {
                    type: 'file',
                    name: 'example.md',
                    url: 'https://example.com/example.md',
                },
            ])
                .onSecondCall()
                .resolves([
                {
                    type: 'file',
                    name: 'example2.md',
                    url: 'https://example.com/example2.md',
                },
                {
                    type: 'file',
                    name: 'example3.md',
                    url: 'https://example.com/example3.md',
                },
            ]);
            const readFileGithubStub = (0, sinon_1.stub)();
            readFileGithubStub
                .onFirstCall()
                .resolves({ type: '.md', name: 'example.md', content: 'Mocked file 1', path: 'path.com' })
                .onSecondCall()
                .resolves({ type: '.md', name: 'example2.md', content: 'Mocked file 2', path: 'path.com' })
                .onThirdCall()
                .resolves({ type: '.md', name: 'example3.md', content: 'Mocked file 3', path: 'path.com' });
            const githubProvider = new github_provider_1.GithubProvider(['https://github.com/owner/repo']);
            githubProvider.getRepoContent = getContentGithubStub;
            githubProvider.getFile = readFileGithubStub;
            const result = await githubProvider.getDocumentations();
            chai_1.assert.isArray(result);
            chai_1.assert.lengthOf(result, 3);
            chai_1.assert.deepEqual(result[0], {
                type: '.md',
                name: 'example.md',
                content: 'Mocked file 1',
                path: 'path.com',
            });
            chai_1.assert.deepEqual(result[1], {
                type: '.md',
                name: 'example2.md',
                content: 'Mocked file 2',
                path: 'path.com',
            });
            chai_1.assert.deepEqual(result[2], {
                type: '.md',
                name: 'example3.md',
                content: 'Mocked file 3',
                path: 'path.com',
            });
        });
    });
});
//# sourceMappingURL=github.provider.test.js.map