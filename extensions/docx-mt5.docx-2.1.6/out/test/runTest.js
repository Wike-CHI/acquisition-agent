"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const test_electron_1 = require("@vscode/test-electron");
async function main() {
    try {
        // The folder containing the Extension Manifest package.json
        // Passed to `--extensionDevelopmentPath`
        const extensionDevelopmentPath = (0, path_1.resolve)(__dirname, '../../');
        // The path to test runner
        // Passed to --extensionTestsPath
        const extensionTestsPath = (0, path_1.resolve)(__dirname, './suite/index');
        // Download VS Code, unzip it and run the integration test
        await (0, test_electron_1.runTests)({ extensionDevelopmentPath, extensionTestsPath });
    }
    catch (err) {
        console.error('Failed to run tests', err);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=runTest.js.map