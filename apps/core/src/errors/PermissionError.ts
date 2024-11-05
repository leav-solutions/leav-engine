// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ErrorFieldDetail, ErrorTypes} from '../_types/errors';
import {PermissionsActions} from '../_types/permissions';
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
