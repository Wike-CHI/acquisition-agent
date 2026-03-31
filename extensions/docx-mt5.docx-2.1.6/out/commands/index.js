"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DropdownCommand = exports.TokenDeleteGitlabCommand = exports.TokenDeleteGithubCommand = exports.TokenAddGitlabCommand = exports.TokenAddGithubCommand = exports.CleanupDocxJsonCommand = exports.GenerateDocxJsonCommand = void 0;
const config_generate_command_1 = require("./config.generate.command");
Object.defineProperty(exports, "GenerateDocxJsonCommand", { enumerable: true, get: function () { return config_generate_command_1.GenerateDocxJsonCommand; } });
const config_cleanup_command_1 = require("./config.cleanup.command");
Object.defineProperty(exports, "CleanupDocxJsonCommand", { enumerable: true, get: function () { return config_cleanup_command_1.CleanupDocxJsonCommand; } });
const tokenAdd_github_command_1 = require("./tokenAdd.github.command");
Object.defineProperty(exports, "TokenAddGithubCommand", { enumerable: true, get: function () { return tokenAdd_github_command_1.TokenAddGithubCommand; } });
const tokenAdd_gitlab_command_1 = require("./tokenAdd.gitlab.command");
Object.defineProperty(exports, "TokenAddGitlabCommand", { enumerable: true, get: function () { return tokenAdd_gitlab_command_1.TokenAddGitlabCommand; } });
const tokenDelete_github_command_1 = require("./tokenDelete.github.command");
Object.defineProperty(exports, "TokenDeleteGithubCommand", { enumerable: true, get: function () { return tokenDelete_github_command_1.TokenDeleteGithubCommand; } });
const tokenDelete_gitlab_command_1 = require("./tokenDelete.gitlab.command");
Object.defineProperty(exports, "TokenDeleteGitlabCommand", { enumerable: true, get: function () { return tokenDelete_gitlab_command_1.TokenDeleteGitlabCommand; } });
const dropdown_command_1 = require("./dropdown.command");
Object.defineProperty(exports, "DropdownCommand", { enumerable: true, get: function () { return dropdown_command_1.DropdownCommand; } });
//# sourceMappingURL=index.js.map