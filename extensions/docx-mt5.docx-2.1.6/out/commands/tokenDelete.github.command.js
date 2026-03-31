"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenDeleteGithubCommand = void 0;
const credentials_utils_1 = require("../utils/credentials.utils");
class TokenDeleteGithubCommand {
    constructor(context) {
        this.credentialManager = new credentials_utils_1.CredentialManager(context.secrets);
    }
    async execute() {
        await this.credentialManager.deleteTokenAndNotify('github');
    }
}
exports.TokenDeleteGithubCommand = TokenDeleteGithubCommand;
//# sourceMappingURL=tokenDelete.github.command.js.map