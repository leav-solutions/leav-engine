// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {v1 as uuidv1} from 'uuid';
import {ErrorFieldDetail, ErrorTypes} from '../_types/errors';

interface ILeavErrorRecord {
    id: string;
    library: string;
}

interface ILeavErrorDetails {
    fields?: ErrorFieldDetail<any>;
    record?: ILeavErrorRecord;
}

export default class LeavError<T, E = ErrorTypes> extends Error {
    /**
     * Details about fields concerned by this permission
     */
    public fields?: ErrorFieldDetail<T>;
    public type: E;
    public record?: ILeavErrorRecord;
    /**
     * Use this ID to identify the error in logs or for debugging purposes.
     * It is generated using uuid v1, which includes a timestamp and a unique identifier.
     * This allows for tracking the error across different systems and logs.
     */
    public errorId: string;

    public constructor(type: E, message = 'Action forbidden', details?: ILeavErrorDetails) {
        super(message);

        this.type = type;
        this.fields = details?.fields;
        this.record = details?.record;
        this.errorId = uuidv1();
    }
}
