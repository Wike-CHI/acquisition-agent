"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaManager = void 0;
const vscode_1 = require("vscode");
class SchemaManager {
    static initialize(fileMatchPattern, schemaUrl) {
        const schemaConfig = {
            fileMatch: [fileMatchPattern],
            url: schemaUrl,
        };
        const currentSchemas = this.config.get('json.schemas') || [];
        const existingSchemaIndex = currentSchemas.findIndex((schema) => schema.fileMatch.includes(fileMatchPattern));
        // If no existing schema with the same fileMatchPattern, add new schema
        if (existingSchemaIndex === -1) {
            currentSchemas.push(schemaConfig);
            this.updateSchemas(currentSchemas);
            return;
        }
        // If URL is the same, do nothing. Otherwise, update the URL.
        if (currentSchemas[existingSchemaIndex].url !== schemaUrl) {
            currentSchemas[existingSchemaIndex].url = schemaUrl;
            this.updateSchemas(currentSchemas);
        }
    }
    static updateSchemas(schemas) {
        this.config.update('json.schemas', schemas, vscode_1.ConfigurationTarget.Global);
    }
}
exports.SchemaManager = SchemaManager;
SchemaManager.config = vscode_1.workspace.getConfiguration();
//# sourceMappingURL=schema.manager.js.map