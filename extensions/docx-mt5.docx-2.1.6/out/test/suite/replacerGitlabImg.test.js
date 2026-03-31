"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const replacerText_utils_1 = require("../../utils/replacerText.utils");
(0, mocha_1.describe)('Replacer gitlab image', () => {
    (0, mocha_1.it)('should transform markdown local gitlab image to gitlab url html image tag', async () => {
        const imageParse = new replacerText_utils_1.ReplacerTextProvider('https://gitlab.com/user/repo');
        const content = 'Some text ![alt text](/image.jpg) some more text';
        const result = await imageParse.replacer(content);
        (0, chai_1.expect)(result).to.include('Some text <img src="data:image/png;base64,eyJtZXNzYWdlIjoiNDA0IFByb2plY3QgTm90IEZvdW5kIn0="/> some more text');
    });
    (0, mocha_1.it)('should transform relative paths in HTML image tags', async () => {
        const imageParse = new replacerText_utils_1.ReplacerTextProvider('https://gitlab.com/user/repo');
        const content = "<img src='/image.jpg'>";
        const result = await imageParse.replacer(content);
        (0, chai_1.expect)(result).to.include('<img src="data:image/png;base64,eyJtZXNzYWdlIjoiNDA0IFByb2plY3QgTm90IEZvdW5kIn0="/>');
    });
});
//# sourceMappingURL=replacerGitlabImg.test.js.map