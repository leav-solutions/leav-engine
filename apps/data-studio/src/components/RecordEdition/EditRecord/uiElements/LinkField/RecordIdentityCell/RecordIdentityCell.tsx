// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {RecordCard} from '@leav/ui';
import {IRecordIdentityWhoAmI, PreviewSize} from '_types/types';

interface IRecordIdentityCellProps {
    record: IRecordIdentityWhoAmI;
}

function RecordIdentityCell({record}: IRecordIdentityCellProps): JSX.Element {
    return <RecordCard record={record} size={PreviewSize.small} />;
}

export default RecordIdentityCell;
