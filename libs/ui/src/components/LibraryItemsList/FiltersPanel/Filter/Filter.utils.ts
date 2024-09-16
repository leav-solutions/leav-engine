// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeFormat} from '_ui/_gqlTypes';
import moment from 'moment/moment';

export const getDefaultFilterValueByFormat = (format: AttributeFormat): boolean | string | number => {
    switch (format) {
        case AttributeFormat.boolean:
            return true;
        case AttributeFormat.date:
            return moment().utcOffset(0).startOf('day').unix();
        default:
            return '';
    }
};
