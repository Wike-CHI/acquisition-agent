"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandRegistry = void 0;
class CommandRegistry {
    constructor() {
        this.commands = {};
    }
    register(commandName, command) {
        this.commands[commandName] = command;
    }
    get(commandName) {
        return this.commands[commandName];
    }
}
exports.CommandRegistry = CommandRegistry;
//# sourceMappingURL=command.registry.js.map