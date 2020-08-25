import {CheckOutlined, CloseOutlined} from '@ant-design/icons';
import objectPath from 'object-path';
import React from 'react';
import {checkTypeIsLink} from '../../../../utils';
import {AttributeFormat, AttributeType, IItemsColumn, PreviewSize} from '../../../../_types/types';
import RecordCard from '../../../shared/RecordCard';

interface CellProps {
    value: any;
    column?: IItemsColumn;
    size: PreviewSize;
    format?: AttributeFormat;
    isMultiple?: boolean;
}

const Cell = ({value, column, size, format, isMultiple}: CellProps) => {
    if (value !== undefined && value !== null) {
        // handle infos column
        if (!column) {
            return <RecordCard record={{...value}} size={size} />;
        }

        switch (format) {
            case AttributeFormat.extended:
                if (column.extendedData) {
                    let parseValue = {};

                    try {
                        parseValue = JSON.parse(value);
                    } catch {
                        return 'error';
                    }

                    // Remove the attribute name from the path and change it to array
                    const extendedPathArr = column.extendedData.path.split('.');
                    extendedPathArr.shift();

                    return (
                        <Cell
                            value={objectPath.get(parseValue, extendedPathArr)}
                            column={column}
                            size={size}
                            format={column.extendedData.format}
                            isMultiple={isMultiple}
                        />
                    );
                }
                return;
            case AttributeFormat.boolean:
                return value ? <CheckOutlined /> : <CloseOutlined />;
            case AttributeFormat.numeric:
            case AttributeFormat.text:
            default:
                if (isMultiple) {
                    return value?.map(val => (
                        <Cell
                            value={val}
                            column={column}
                            size={size}
                            format={format}
                            isMultiple={!!Array.isArray(val)}
                        />
                    ));
                } else if (checkTypeIsLink(column.type)) {
                    return <RecordCard record={{...value.whoAmI}} size={size} />;
                } else if (column.type === AttributeType.tree) {
                    return (
                        <RecordCard key={value?.record?.whoAmI?.id} record={{...value?.record?.whoAmI}} size={size} />
                    );
                }

                return value;
        }
    }

    return <span>{value}</span>;
};

export default Cell;
