// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ErrorFieldDetail, ErrorTypes} from '../_types/errors';
import {PermissionsActions} from '../_types/permissions';

export default class PermissionError<T> extends Error {
    /**
     * Details about fields concerned by this permission
     */
    public fields: ErrorFieldDetail<T>;
    public action: PermissionsActions;

    public type: ErrorTypes;

    public constructor(action: PermissionsActions, fields?: ErrorFieldDetail<T>, message: string = 'Action forbidden') {
        super(message);

        this.type = ErrorTypes.PERMISSION_ERROR;
        this.action = action;
        this.fields = fields;
    }
}
