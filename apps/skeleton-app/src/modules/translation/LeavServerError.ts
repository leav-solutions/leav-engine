export class LeavServerError extends Error {
    public constructor() {
        super('Server Error, please make sure Leav is connected!');
    }
}
