// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ComponentProps, type FunctionComponent} from 'react';
import {KitBreadcrumb, KitIdCard, KitTypography} from 'aristid-ds';
import {useTranslation} from 'react-i18next';
import {NEW_RECORD_ID} from '@leav/ui';
import {useGetRecordIdCardQuery} from '../../../../__generated__';
import {PanelIdCardSkeleton} from './PanelIdCardSkeleton';
import {RecordIdCardDescription} from './RecordIdCardDescription';

export const RecordIdCard: FunctionComponent<{
    currentRecordId?: string;
    libraryId: string | null;
    avatarSize: 'l' | 'm';
}> = ({currentRecordId, libraryId, avatarSize}) => {
    const {t} = useTranslation();
    const {data, loading} = useGetRecordIdCardQuery({
        variables: {
            id: currentRecordId,
            libraryId,
        },
        skip: !currentRecordId || !libraryId,
    });

    // Complete breadcrumb data here
    const breadcrumbItems = data?.records?.list?.[0]?.whoAmI?.parentContext
        ?.map(pc => ({
            title: pc.label,
        }))
        .reverse();

    const avatarProps: ComponentProps<typeof KitIdCard>['avatarProps'] =
        data?.records?.list?.[0]?.whoAmI?.preview?.small || data?.records?.list?.[0]?.whoAmI?.label
            ? {
                  shape: 'square',
                  src: data?.records?.list?.[0]?.whoAmI?.preview?.small,
                  label: data?.records?.list?.[0]?.whoAmI?.label,
                  size: avatarSize,
              }
            : undefined;

    const labelsProps: Pick<ComponentProps<typeof KitIdCard>, 'title' | 'description'> = currentRecordId ===
    NEW_RECORD_ID
        ? {
              title: <KitTypography.Title level="h2">{t('record_edition.new_record')}</KitTypography.Title>,
          }
        : {
              title: <KitBreadcrumb items={breadcrumbItems} />,
              description: (
                  <RecordIdCardDescription
                      label={data?.records?.list?.[0]?.whoAmI?.label ?? data?.records?.list?.[0]?.id}
                      sublabel={data?.records?.list?.[0]?.whoAmI?.subLabel}
                  />
              ),
          };

    return loading ? <PanelIdCardSkeleton /> : <KitIdCard size="s" {...labelsProps} avatarProps={avatarProps} />;
};
