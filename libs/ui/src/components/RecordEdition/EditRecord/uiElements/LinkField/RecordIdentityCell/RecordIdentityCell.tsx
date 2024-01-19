// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {RecordCard} from '_ui/components';
import {PreviewSize} from '_ui/constants';
import {IRecordIdentityWhoAmI} from '_ui/types/records';

interface IRecordIdentityCellProps {
    record: IRecordIdentityWhoAmI;
}

function RecordIdentityCell({record}: IRecordIdentityCellProps): JSX.Element {
    return <RecordCard record={record} size={PreviewSize.small} />;
}

export default RecordIdentityCell;
