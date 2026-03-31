"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplacerGithubImg = void 0;
const error_utils_1 = require("./error.utils");
class ReplacerGithubImg {
    constructor(repository, token) {
        this.replace = async (content) => {
            const replacements = [this.replaceMarkdownImg, this.replaceTagImg];
            let replacedContent = content;
            for (const replacementFunction of replacements) {
                replacedContent = await replacementFunction(replacedContent);
            }
            return replacedContent;
        };
        this.replaceMarkdownImg = async (content) => {
            const markdownImageRegex = /!\[[^\]]*\]\(([^)]+)\)/g;
            return await this.replaceToGithubImgTag(content, markdownImageRegex);
        };
        this.replaceTagImg = async (content) => {
            const htmlImageRegex = /<img src='([^']*)'(?:\s+alt='([^']*)')?>/g;
            return await this.replaceToGithubImgTag(content, htmlImageRegex);
        };
        this.replaceToGithubImgTag = async (content, regex) => {
            const allMatchesContent = Array.from(content.matchAll(regex));
            const replaceImageSourceList = await this.replaceImageGithubToHTML(allMatchesContent);
            let result = content;
            for (const { originalText, imageHTML } of replaceImageSourceList) {
                result = result.replace(originalText, imageHTML);
            }
            return result;
        };
        const repoInfo = this.extractRepoParams(repository);
        if (!repoInfo || !repoInfo.username || !repoInfo.repo) {
            error_utils_1.ErrorManager.outputError('Invalid repository information');
            return;
        }
        this.username = repoInfo?.username;
        this.repo = repoInfo?.repo;
        this.token = token;
    }
    async replaceImageGithubToHTML(imageSources) {
        return await Promise.all(imageSources.map(async (imageSource) => {
            let imageHTML;
            if (this.isGithubImageSource(imageSource[1])) {
                const url = imageSource[1].split('/main')[1];
                const data = await this.getGithubFile(url);
                imageHTML = `<img src="${data.download_url}"/>`;
            }
            else if (this.isGithubLocalImage(imageSource[1])) {
                const data = await this.getGithubFile(imageSource[1]);
                imageHTML = `<img src="${data.download_url}"/>`;
            }
            else {
                imageHTML = `<img src="${imageSource[1]}"/>`;
            }
            return { originalText: imageSource[0], imageHTML };
        }));
    }
    async getGithubFile(url) {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const headers = this.token ? { Authorization: `Bearer ${this.token}` } : {};
        const response = await fetch(`https://api.github.com/repos/${this.username}/${this.repo}/contents${url}`, { headers });
        return await response.json();
    }
    extractRepoParams(url) {
        const match = url.match(/https:\/\/github\.com\/([^/]+)\/([^/]+)/); // regex to get username and repo name from github url
        if (!match)
            return undefined;
        return { username: match?.[1], repo: match?.[2] };
    }
    isGithubImageSource(url) {
        return url.startsWith(`https://github.com/${this.username}/${this.repo}/blob/main/`);
    }
    isGithubLocalImage(url) {
        return url.startsWith('/');
    }
}
exports.ReplacerGithubImg = ReplacerGithubImg;
//# sourceMappingURL=replacerGithubImg.js.map