"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAuthToken = void 0;
const STORAGE_TOKEN_KEY = 'accessToken';
function useAuthToken() {
    const storage = window.sessionStorage;
    return {
        getToken() {
            var _a;
            return (_a = storage.getItem(STORAGE_TOKEN_KEY)) !== null && _a !== void 0 ? _a : '';
        },
        saveToken(token) {
            storage.setItem(STORAGE_TOKEN_KEY, token);
        },
        deleteToken() {
            storage.removeItem(STORAGE_TOKEN_KEY);
        }
    };
}
exports.useAuthToken = useAuthToken;
//# sourceMappingURL=useAuthToken.js.map