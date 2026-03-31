"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VsCodeNotifier = void 0;
const vscode_1 = require("vscode");
class VsCodeNotifier {
    notifySuccess(message) {
        vscode_1.window.showInformationMessage(message);
    }
    notifyError(message) {
        vscode_1.window.showErrorMessage(message);
    }
}
exports.VsCodeNotifier = VsCodeNotifier;
//# sourceMappingURL=notifier.utils.js.map