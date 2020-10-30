import React from 'react';
import {CSSObject} from 'styled-components';
import {PreviewSize, RecordIdentity_whoAmI} from '../../../../../_types/types';
import RecordCard from '../../../../shared/RecordCard';

interface ICellRecordCardProps {
    record: RecordIdentity_whoAmI;
    size: PreviewSize;
    style?: CSSObject;
    lang?: string[];
}

const labelLengthLimit = 20;
function CellRecordCard({record, size, style, lang}: ICellRecordCardProps): JSX.Element {
    const displayLabel =
        record.label && record.label.length > labelLengthLimit
            ? record?.label?.substr(0, labelLengthLimit) + '...'
            : record?.label;

    const recordValue = {...record, label: displayLabel};
    return <RecordCard record={recordValue} size={size} lang={lang} style={style} />;
}

export default CellRecordCard;
