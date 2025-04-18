export class LeavServerError extends Error {
    constructor() {
        super('Server Error, please make sure Leav is connected!');
    }
}
