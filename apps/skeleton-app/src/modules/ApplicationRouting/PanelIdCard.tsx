// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useGetRecordIdCardQuery} from '../../__generated__';
import {KitIdCard} from 'aristid-ds';
import {FunctionComponent} from 'react';
import {PanelIdCardSkeleton} from './PanelIdCardSkeleton';

export const PanelIdCard: FunctionComponent<{currentRecordId?: string; libraryId?: string}> = ({
    currentRecordId,
    libraryId
}) => {
    const {data, loading} = useGetRecordIdCardQuery({
        variables: {
            id: currentRecordId,
            libraryId
        },
        skip: !currentRecordId || !libraryId
    });

    return loading ? (
        <PanelIdCardSkeleton />
    ) : (
        <KitIdCard
            size="large"
            title={data?.records?.list?.[0]?.whoAmI?.label}
            description={data?.records?.list?.[0]?.whoAmI?.subLabel}
        />
    );
};
