// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ComponentProps, type FunctionComponent} from 'react';
import {KitBreadcrumb, KitIdCard, KitTypography} from 'aristid-ds';
import {useTranslation} from 'react-i18next';
import {NEW_RECORD_ID, useGetRecordIdCard} from '@leav/ui';
import {PanelIdCardSkeleton} from './PanelIdCardSkeleton';
import {RecordIdCardDescription} from './RecordIdCardDescription';

export const RecordIdCard: FunctionComponent<{
    currentRecordId?: string;
    libraryId: string | null;
    avatarSize: 'l' | 'm';
}> = ({currentRecordId, libraryId, avatarSize}) => {
    const {t} = useTranslation();
    const {data, loading} = useGetRecordIdCard(currentRecordId, libraryId);

    // Complete breadcrumb data here
    const breadcrumbItems = data?.whoAmI?.parentContext
        ?.map(pc => ({
            title: pc.label,
        }))
        .reverse();

    const avatarProps: ComponentProps<typeof KitIdCard>['avatarProps'] =
        data?.whoAmI?.preview?.small || data?.whoAmI?.label
            ? {
                  shape: 'square',
                  src: data?.whoAmI?.preview?.small,
                  label: data?.whoAmI?.label,
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
                  <RecordIdCardDescription label={data?.whoAmI?.label ?? data?.id} sublabel={data?.whoAmI?.subLabel} />
              ),
          };

    return loading ? <PanelIdCardSkeleton /> : <KitIdCard size="s" {...labelsProps} avatarProps={avatarProps} />;
};
