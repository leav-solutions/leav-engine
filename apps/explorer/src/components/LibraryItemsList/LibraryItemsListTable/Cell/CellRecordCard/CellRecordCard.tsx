// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {CSSObject} from 'styled-components';
import {IRecordIdentityWhoAmI, PreviewSize} from '../../../../../_types/types';
import RecordCard from '../../../../shared/RecordCard';

interface ICellRecordCardProps {
    record: IRecordIdentityWhoAmI;
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
