// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ErrorFieldDetail, ErrorTypes} from '../_types/errors';

export default class LeavError<T> extends Error {
    /**
     * Details about fields concerned by this permission
     */
    public fields?: ErrorFieldDetail<T>;
    public type: ErrorTypes;

    public constructor(type: ErrorTypes, message: string = 'Action forbidden', fields?: ErrorFieldDetail<T>) {
        super(message);

        this.type = type;
        this.fields = fields;
    }
}
