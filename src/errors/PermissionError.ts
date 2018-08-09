import {RecordPermissions} from '_types/permissions';

export default class PermissionError extends Error {
    public action: RecordPermissions;

    constructor(action: RecordPermissions, message: string = 'Action forbidden') {
        super(message);

        this.action = action;
    }
}
