import {PermissionsActions} from '_types/permissions';

export default class PermissionError extends Error {
    public action: PermissionsActions;

    constructor(action: PermissionsActions, message: string = 'Action forbidden') {
        super(message);

        this.action = action;
    }
}
