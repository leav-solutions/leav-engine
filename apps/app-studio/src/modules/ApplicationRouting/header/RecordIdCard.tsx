// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useContext, type ComponentProps, type FunctionComponent} from 'react';
import {useGetLibraryNameQuery, useGetRecordIdCardQuery} from '../../../__generated__';
import {KitBreadcrumb, KitIdCard} from 'aristid-ds';
import {PanelIdCardSkeleton} from './PanelIdCardSkeleton';
import {localizedTranslation} from '@leav/utils';
import {LangContext} from '_ui/contexts';
import {RecordIdCardDescription} from './RecordIdCardDescription';

export const RecordIdCard: FunctionComponent<{
    currentRecordId?: string;
    libraryId: string | null;
    avatarSize: 'l' | 'm';
}> = ({currentRecordId, libraryId, avatarSize}) => {
    const {lang} = useContext(LangContext);
    const {data, loading} = useGetRecordIdCardQuery({
        variables: {
            id: currentRecordId,
            libraryId
        },
        skip: !currentRecordId || !libraryId
    });

    // TODO Remove the library label part to display breadcrumb instead
    const {data: libraryData, loading: libraryLoading} = useGetLibraryNameQuery({
        variables: {
            libraryId
        },
        skip: libraryId === null
    });

    // Complete breadcrumb data here
    const breadcrumbItems: ComponentProps<typeof KitBreadcrumb>['items'] = [
        {
            title: localizedTranslation(libraryData?.libraries?.list?.[0]?.label, lang)
        }
    ];

    const avatarProps: ComponentProps<typeof KitIdCard>['avatarProps'] =
        data?.records?.list?.[0]?.whoAmI?.preview?.small || data?.records?.list?.[0]?.whoAmI?.label
            ? {
                  shape: 'square',
                  src: data?.records?.list?.[0]?.whoAmI?.preview?.small,
                  label: data?.records?.list?.[0]?.whoAmI?.label,
                  size: avatarSize
              }
            : undefined;

    const isLoading = loading || libraryLoading;

    return isLoading ? (
        <PanelIdCardSkeleton />
    ) : (
        <KitIdCard
            size="s"
            title={<KitBreadcrumb items={breadcrumbItems} />}
            description={
                <RecordIdCardDescription
                    label={data?.records?.list?.[0]?.whoAmI?.label}
                    sublabel={data?.records?.list?.[0]?.whoAmI?.subLabel}
                />
            }
            avatarProps={avatarProps}
        />
    );
};
