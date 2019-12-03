import {ErrorFieldDetail, ErrorTypes} from '../_types/errors';
import {PermissionsActions} from '../_types/permissions';

export default class PermissionError<T> extends Error {
    /**
     * Details about fields concerned by this permission
     */
    public fields: ErrorFieldDetail<T>;
    public action: PermissionsActions;

    public type: ErrorTypes;

    constructor(action: PermissionsActions, fields?: ErrorFieldDetail<T>, message: string = 'Action forbidden') {
        super(message);

        this.type = ErrorTypes.PERMISSION_ERROR;
        this.action = action;
        this.fields = fields;
    }
}
