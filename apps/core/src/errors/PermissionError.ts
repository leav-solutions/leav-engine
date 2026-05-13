import {type ErrorFieldDetail, ErrorTypes} from '../_types/errors';
import {type PermissionsActions} from '../_types/permissions';
import LeavError from './LeavError';

export default class PermissionError<T> extends LeavError<T> {
    /**
     * Details about fields concerned by this permission
     */
    public action: PermissionsActions;

    public constructor(action: PermissionsActions, fields?: ErrorFieldDetail<T>, message = 'Action forbidden') {
        super(ErrorTypes.PERMISSION_ERROR, message, {fields});
        this.action = action;
    }
}
