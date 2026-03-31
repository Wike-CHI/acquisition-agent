"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorManager = void 0;
const vscode_1 = require("vscode");
class ErrorManager {
    static initialize() {
        this.outputChannel = vscode_1.window.createOutputChannel('Docx Etx Errors');
    }
    static outputError(message) {
        if (typeof message === 'string') {
            this.outputChannel.appendLine(`Error: ${message}`);
        }
        else {
            const formattedErrors = this.formatEntityErrors(message);
            this.outputChannel.appendLine(formattedErrors);
        }
        this.outputChannel.show(true);
    }
    static formatEntityErrors(errors) {
        let formattedErrors = '';
        errors.forEach((error, index) => {
            formattedErrors += `Error ${index + 1}:\n`;
            if (error.errorType === 'MISSING') {
                formattedErrors += `  - A required ${error.entityType} was not found at: ${error.entityPath}\n`;
            }
            else if (error.errorType === 'DUPLICATE') {
                formattedErrors += `  - Duplicate ${error.entityType} found at: ${error.entityPath}\n`;
                formattedErrors += `    Original Location: ${error.originalLocation}\n`;
                formattedErrors += `    Duplicate Location: ${error.duplicateLocation}\n`;
            }
            else if (error.errorType === 'INVALID') {
                formattedErrors += `  - Invalid ${error.entityType} found at: ${error.entityPath}\n`;
            }
            if (error.errorMsg) {
                formattedErrors += `  - Additional Info: ${error.errorMsg}\n`;
            }
        });
        formattedErrors += `\nPlease make sure the associations are correct. Refer to the documentation for more information: https://github.com/Mehdi-Verfaillie/docx/blob/main/README.md\n`;
        return formattedErrors;
    }
}
exports.ErrorManager = ErrorManager;
//# sourceMappingURL=error.utils.js.map