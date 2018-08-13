import {RecordPermissionsActions} from '_types/permissions';

export default class PermissionError extends Error {
    public action: RecordPermissionsActions;

    constructor(action: RecordPermissionsActions, message: string = 'Action forbidden') {
        super(message);

        this.action = action;
    }
}
