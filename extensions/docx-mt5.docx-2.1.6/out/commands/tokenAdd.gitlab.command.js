"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenAddGitlabCommand = void 0;
const credentials_utils_1 = require("../utils/credentials.utils");
class TokenAddGitlabCommand {
    constructor(context) {
        this.credentialManager = new credentials_utils_1.CredentialManager(context.secrets);
    }
    async execute() {
        await this.credentialManager.openTokenInputBox('gitlab');
    }
}
exports.TokenAddGitlabCommand = TokenAddGitlabCommand;
//# sourceMappingURL=tokenAdd.gitlab.command.js.map