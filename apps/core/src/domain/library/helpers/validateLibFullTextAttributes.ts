// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ILibrary} from '_types/library';
import {ErrorFieldDetail, Errors} from '../../../_types/errors';
import {difference} from 'lodash';

export default (attributes: string[], fullTextAttributes: string[]): ErrorFieldDetail<ILibrary> => {
    const errors: ErrorFieldDetail<ILibrary> = {};

    if (difference(fullTextAttributes, attributes).length) {
        errors.fullTextAttributes = {
            msg: Errors.INVALID_FULLTEXT_ATTRIBUTES,
            vars: {fullTextAttributes: fullTextAttributes.join(', ')}
        };
    }

    return errors;
};
