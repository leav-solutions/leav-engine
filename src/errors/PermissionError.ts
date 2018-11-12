import {ErrorTypes} from '../_types/errors';
import {PermissionsActions} from '../_types/permissions';

export default class PermissionError extends Error {
    public action: PermissionsActions;

    public type: ErrorTypes;

    constructor(action: PermissionsActions, message: string = 'Action forbidden') {
        super(message);

        this.type = ErrorTypes.PERMISSION_ERROR;
        this.action = action;
    }
}
