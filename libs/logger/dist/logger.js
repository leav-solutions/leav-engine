"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.configureLogger = configureLogger;
// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
const winston = __importStar(require("winston"));
const config_1 = require("./config");
function configureLogger(config) {
    const transports = [
        new winston.transports.Console({
            format: config.useJsonFormat
                ? winston.format.json()
                : winston.format.combine(winston.format.colorize(), winston.format.simple())
        })
    ];
    if (config.destinationFile) {
        transports.push(new winston.transports.File({
            filename: config.destinationFile,
            format: config.useJsonFormat ? winston.format.json() : winston.format.simple()
        }));
    }
    winston.configure({
        level: config.level,
        handleExceptions: true,
        transports
    });
    winston.info(`Logger configured with level=${config.level}`);
}
// Default logger configuration, for testing and to avoid errors if not configured
configureLogger(config_1.loggerConfig);
// Avoid to much dependency from winston if not necessary for now
exports.logger = winston;
//# sourceMappingURL=logger.js.map