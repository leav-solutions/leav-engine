"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultLoggerConfig = void 0;
exports.envToBool = envToBool;
// duplicate of libs/config-manager/src/envTo.ts
// to avoid adding this dependency here for now
function envToBool(value, defaultValue = false) {
    const v = value?.trim().toLowerCase();
    if (v === 'true' || v === '1' || v === 'yes') {
        return true;
    }
    if (v === 'false' || v === '0' || v === 'no') {
        return false;
    }
    return defaultValue;
}
exports.defaultLoggerConfig = {
    level: process.env.LOG_LEVEL || 'info',
    silent: envToBool(process.env.LOG_SILENT, process.env.TS_JEST === '1'),
    destinationFile: process.env.LOG_FILE,
    useJsonFormat: envToBool(process.env.LOG_USE_JSON_FORMAT, false)
};
//# sourceMappingURL=config.js.map