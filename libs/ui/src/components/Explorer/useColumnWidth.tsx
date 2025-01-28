// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {isTypeStandard} from '@leav/utils';
import {IExplorerData} from './_types';
import {useEffect, useRef, useState} from 'react';
import {AttributeFormat} from '_ui/_gqlTypes';

const FieldColumnWidth = {
    TINY: 125,
    SMALL: 150,
    MEDIUM: 250,
    LARGE: 300
};

const _getFieldColumWidth = (field: IExplorerData['attributes'][string]): number => {
    if (!field || !isTypeStandard(field.type) || field.multiple_values) {
        return FieldColumnWidth.LARGE;
    }

    switch (field.format) {
        case AttributeFormat.boolean:
            return FieldColumnWidth.TINY;
        case AttributeFormat.numeric:
        case AttributeFormat.date:
            return FieldColumnWidth.SMALL;
        case AttributeFormat.date_range:
            return FieldColumnWidth.LARGE;
        default:
            return FieldColumnWidth.MEDIUM;
    }
};

export const useColumnWidth = () => {
    const ref = useRef<HTMLDivElement | null>(null);
    const [columnWidth, setColumnWidth] = useState(FieldColumnWidth.TINY);

    useEffect(() => {
        if (ref.current) {
            const columnElement = ref.current;
            const columnElementtWidth = columnElement.getBoundingClientRect().width;
            const lastColumnsInlinePadding = 36;

            if (columnElementtWidth !== columnWidth - lastColumnsInlinePadding) {
                setColumnWidth(columnElementtWidth + lastColumnsInlinePadding);
            }
        }
    }, [ref.current]);

    return {
        ref,
        getFieldColumnWidth: _getFieldColumWidth,
        columnWidth
    };
};
