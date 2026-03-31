"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssociationsManager = void 0;
const transform_utils_1 = require("./utils/transform.utils");
class AssociationsManager {
    constructor() {
        this.transform = transform_utils_1.DataTransformManager;
    }
    /**
     * Associates the given documentations based on the provided JSON configuration and user path.
     *
     * The function processes the configuration, validates it, and returns the associated documentations
     * for the current user path, including those inherited from parent directories.
     *
     * @public
     * @param {Documentation[]} documentations - The list of all available documentations.
     * @param {string} json - The JSON string containing the documentation associations configuration.
     * @param {string} currUserPath - The current user path.
     * @returns {Promise<Documentation[]>} - A promise that resolves to a list of associated documentations.
     */
    async associate(documentations, config, currUserPath) {
        const associatedDocsPaths = this.getAssociatedDocsPaths(currUserPath, config);
        if (!associatedDocsPaths.length)
            return [];
        return this.transform.sortDataByTypeAndName(documentations.filter((doc) => associatedDocsPaths.includes(doc.path)));
    }
    /**
     * Retrieves all associated document paths for a given directory, including inherited ones.
     *
     * @private
     * @param {string} currUserPath - The current user path.
     * @param {Object} config - Contain the associations object mapping directories to their document paths.
     * @returns {string[]} - A list of document paths associated with the given user path.
     */
    getAssociatedDocsPaths(currUserPath, config) {
        let docsPaths = config.associations[currUserPath] || [];
        for (const [dir, docs] of Object.entries(config.associations)) {
            if (currUserPath.startsWith(dir) && currUserPath !== dir) {
                // If dir is a parent of currUserPath
                docsPaths = [...docsPaths, ...docs];
            }
        }
        // Remove duplicates
        return [...new Set(docsPaths)];
    }
}
exports.AssociationsManager = AssociationsManager;
//# sourceMappingURL=association.manager.js.map