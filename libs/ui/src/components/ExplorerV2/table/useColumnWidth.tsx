import {isTypeStandard} from '@leav/utils';
import {type CellAttributeProperties} from '../_types';
import {useEffect, useRef, useState} from 'react';
import {AttributeFormat} from '_ui/_gqlTypes';

const minmimumWidthForOneLineActionHeader = 60;

const FieldColumnWidth = {
    TINY: 125,
    SMALL: 150,
    MEDIUM: 250,
    LARGE: 300,
};

const _getFieldColumWidth = (field?: CellAttributeProperties): number => {
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

export const lastColumnsInlinePadding = 36;

export const useColumnWidth = () => {
    const ref = useRef<HTMLDivElement | null>(null);
    const [columnWidth, setColumnWidth] = useState(FieldColumnWidth.TINY);

    useEffect(() => {
        if (ref.current) {
            const columnElement = ref.current;
            const columnElementtWidth = columnElement.getBoundingClientRect().width;

            if (columnElementtWidth !== columnWidth - lastColumnsInlinePadding) {
                setColumnWidth(columnElementtWidth + lastColumnsInlinePadding);
            }
        }
    }, [ref.current]);

    return {
        ref,
        getFieldColumnWidth: _getFieldColumWidth,
        columnWidth,
        actionsColumnHeaderWidth: Math.max(columnWidth - lastColumnsInlinePadding, minmimumWidthForOneLineActionHeader),
    };
};
