"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenDeleteGitlabCommand = void 0;
const credentials_utils_1 = require("../utils/credentials.utils");
class TokenDeleteGitlabCommand {
    constructor(context) {
        this.credentialManager = new credentials_utils_1.CredentialManager(context.secrets);
    }
    async execute() {
        await this.credentialManager.deleteTokenAndNotify('gitlab');
    }
}
exports.TokenDeleteGitlabCommand = TokenDeleteGitlabCommand;
//# sourceMappingURL=tokenDelete.gitlab.command.js.map