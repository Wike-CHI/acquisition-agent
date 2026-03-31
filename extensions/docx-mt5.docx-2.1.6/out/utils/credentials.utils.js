"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CredentialManager = void 0;
const vscode_1 = require("vscode");
class CredentialManager {
    constructor(secretStorage) {
        this.openTokenInputBox = async (provider) => {
            const inputValue = await vscode_1.window.showInputBox({
                placeHolder: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Personnal Access Token`,
            });
            if (inputValue) {
                this.saveToken({
                    provider,
                    key: inputValue,
                });
                vscode_1.window.showInformationMessage(`Docx ${provider.charAt(0).toUpperCase() + provider.slice(1)} Personnal Access Token has been saved successfully.
        `, 'Close');
            }
        };
        this.deleteTokenAndNotify = async (provider) => {
            this.deleteToken(provider);
            vscode_1.window.showInformationMessage(`Docx
      ${provider.charAt(0).toUpperCase() + provider.slice(1)} Personnal Access Token has been deleted successfully.`, 'Close');
        };
        this.saveToken = async (token) => {
            await this.secretStorage.store(token.provider, token.key);
        };
        this.getToken = async (provider) => {
            const tokenKey = await this.secretStorage.get(provider);
            if (tokenKey) {
                return {
                    provider,
                    key: tokenKey,
                };
            }
        };
        this.getTokens = async () => {
            const tokens = [];
            for (const provider of this.providers) {
                const token = await this.getToken(provider);
                if (token)
                    tokens.push(token);
            }
            return tokens.length ? tokens : undefined;
        };
        this.deleteToken = (provider) => {
            this.secretStorage.delete(provider);
        };
        this.onTokenChange = (callback) => {
            this.secretStorage.onDidChange(() => {
                callback();
            });
        };
        this.secretStorage = secretStorage;
        this.providers = ['github', 'gitlab'];
    }
}
exports.CredentialManager = CredentialManager;
//# sourceMappingURL=credentials.utils.js.map