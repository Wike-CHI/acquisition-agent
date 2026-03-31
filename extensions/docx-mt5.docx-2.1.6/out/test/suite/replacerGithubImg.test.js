"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const replacerText_utils_1 = require("../../utils/replacerText.utils");
const replacerGithubImg_1 = require("../../utils/replacerGithubImg");
const sinon = require("sinon");
(0, mocha_1.describe)('Replacer github image', () => {
    (0, mocha_1.it)('should transform markdown local github image to github url html image tag', async () => {
        const replacerGithubImg = new replacerGithubImg_1.ReplacerGithubImg('https://github.com/user/repo', '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');
        const getGithubFileStub = sinon.stub(replacerGithubImg, 'getGithubFile');
        getGithubFileStub.resolves({
            download_url: 'https://raw.githubusercontent.com/user/repo/main/image.jpg',
        });
        const content = 'Some text ![alt text](/image.jpg) some more text';
        const result = await replacerGithubImg.replace(content);
        getGithubFileStub.restore();
        (0, chai_1.expect)(result).to.include('Some text <img src="https://raw.githubusercontent.com/user/repo/main/image.jpg"/> some more text');
    });
    (0, mocha_1.it)('should keep markdown external image links unchanged', async () => {
        const imageParse = new replacerText_utils_1.ReplacerTextProvider('https://github.com/user/repo');
        const content = 'Some text ![alt text](https://external.com/image.jpg) some more text';
        const result = await imageParse.replacer(content);
        (0, chai_1.expect)(result).to.include('Some text <img src="https://external.com/image.jpg"/> some more text');
    });
    (0, mocha_1.it)('should keep external image with github  links unchanged', async () => {
        const imageParse = new replacerText_utils_1.ReplacerTextProvider('https://github.com/user/repo');
        const content = '<img src="https://github.com/image.jpg"/>';
        const result = await imageParse.replacer(content);
        (0, chai_1.expect)(result).to.include('<img src="https://github.com/image.jpg"/>');
    });
    (0, mocha_1.it)('should transform relative paths in HTML image tags', async () => {
        const replacerGithubImg = new replacerGithubImg_1.ReplacerGithubImg('https://github.com/user/repo', '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');
        const getGithubFileStub = sinon.stub(replacerGithubImg, 'getGithubFile');
        getGithubFileStub.resolves({
            download_url: 'https://raw.githubusercontent.com/user/repo/main/image.jpg',
        });
        const content = "<img src='/image.jpg'>";
        const result = await replacerGithubImg.replace(content);
        getGithubFileStub.restore();
        (0, chai_1.expect)(result).to.include('<img src="https://raw.githubusercontent.com/user/repo/main/image.jpg"/>');
    });
    (0, mocha_1.it)('should keep HTML image tags with external links unchanged', async () => {
        const replacerGithubImg = new replacerGithubImg_1.ReplacerGithubImg('https://github.com/user/repo', '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');
        const content = '<img src="https://external.com/image.jpg"/>';
        const result = await replacerGithubImg.replace(content);
        (0, chai_1.expect)(result).to.include('<img src="https://external.com/image.jpg"/>');
    });
});
(0, mocha_1.describe)('Markdown Image Regex', function () {
    const markdownImageRegex = /!\[[^\]]*\]\(([^)]+)\)/g;
    (0, mocha_1.it)('should match markdown image syntax', function () {
        const input = 'ssssss sssss ![alt text](https://github.com/image.jpg) xxxxxxxxx';
        const matches = input.match(markdownImageRegex);
        (0, chai_1.expect)(matches?.[0]).to.equal('![alt text](https://github.com/image.jpg)');
    });
    (0, mocha_1.it)('should not match non-markdown image syntax', function () {
        const input = '<img src="https://github.com/image.jpg"/>';
        const matches = input.match(markdownImageRegex);
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        (0, chai_1.expect)(matches).to.be.null;
    });
});
(0, mocha_1.describe)('HTML Image Regex', function () {
    const htmlImageRegex = /<img src='([^']*)'(?:\s+alt='([^']*)')?\s*\/?>/g;
    (0, mocha_1.it)('should match HTML image tag', function () {
        const input = "xxxxxxxx <img src='https://github.com/image.jpg' alt='image'/> xxxxxxxx ";
        const matches = input.match(htmlImageRegex);
        (0, chai_1.expect)(matches?.[0]).to.equal("<img src='https://github.com/image.jpg' alt='image'/>");
    });
    (0, mocha_1.it)('should not match non-HTML image tag', function () {
        const input = '![alt text](https://github.com/image.jpg)';
        const matches = input.match(htmlImageRegex);
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        (0, chai_1.expect)(matches).to.be.null;
    });
});
//# sourceMappingURL=replacerGithubImg.test.js.map