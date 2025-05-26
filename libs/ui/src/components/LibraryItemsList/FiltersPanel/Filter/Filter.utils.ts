// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeFormat} from '_ui/_gqlTypes';
import dayjs from 'dayjs';

export const getDefaultFilterValueByFormat = (format: AttributeFormat): boolean | string | number => {
    switch (format) {
        case AttributeFormat.boolean:
            return true;
        case AttributeFormat.date:
            return dayjs.utc().startOf('day').unix();
        default:
            return '';
    }
};
