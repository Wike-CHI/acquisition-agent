"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenAddGithubCommand = void 0;
const credentials_utils_1 = require("../utils/credentials.utils");
class TokenAddGithubCommand {
    constructor(context) {
        this.credentialManager = new credentials_utils_1.CredentialManager(context.secrets);
    }
    async execute() {
        await this.credentialManager.openTokenInputBox('github');
    }
}
exports.TokenAddGithubCommand = TokenAddGithubCommand;
//# sourceMappingURL=tokenAdd.github.command.js.map