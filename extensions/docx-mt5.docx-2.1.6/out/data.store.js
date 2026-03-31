"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataStore = void 0;
class DataStore {
    constructor() {
        this.documentations = [];
        this.jsonConfig = '';
    }
    static getInstance() {
        if (!DataStore.instance) {
            DataStore.instance = new DataStore();
        }
        return DataStore.instance;
    }
}
exports.DataStore = DataStore;
//# sourceMappingURL=data.store.js.map