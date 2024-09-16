// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ErrorFieldDetail, ErrorTypes} from '../_types/errors';

interface ILeavErrorRecord {
    id: string;
    library: string;
}

interface ILeavErrorDetails {
    fields?: ErrorFieldDetail<any>;
    record?: ILeavErrorRecord;
}

export default class LeavError<T> extends Error {
    /**
     * Details about fields concerned by this permission
     */
    public fields?: ErrorFieldDetail<T>;
    public type: ErrorTypes;
    public record?: ILeavErrorRecord;

    public constructor(type: ErrorTypes, message = 'Action forbidden', details?: ILeavErrorDetails) {
        super(message);

        this.type = type;
        this.fields = details?.fields;
        this.record = details?.record;
    }
}
