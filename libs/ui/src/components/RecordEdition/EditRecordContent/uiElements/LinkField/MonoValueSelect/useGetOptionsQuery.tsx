import {useQuery} from '@apollo/client';
import {RecordFormAttributeLinkAttributeFragment, SortOrder} from '_ui/_gqlTypes';
import {
    IGetRecordsFromLibraryQuery,
    IGetRecordsFromLibraryQueryVariables,
    getRecordsFromLibraryQuery
} from '_ui/_queries/records/getRecordsFromLibraryQuery';
import {KitAvatar, KitSelect} from 'aristid-ds';
import {ComponentProps, useMemo} from 'react';
import {SubmitValueFunc} from '../../../_types';
import {RecordFormElementsValueLinkValue} from '_ui/hooks/useGetRecordForm';

export const useGetOptionsQuery = ({
    activeValue,
    linkedLibraryId,
    onSelectChange
}: {
    activeValue: RecordFormElementsValueLinkValue | undefined;
    linkedLibraryId: string;
    onSelectChange: SubmitValueFunc;
}) => {
    const {loading, data} = useQuery<IGetRecordsFromLibraryQuery, IGetRecordsFromLibraryQueryVariables>(
        getRecordsFromLibraryQuery(),
        {
            fetchPolicy: 'network-only',
            variables: {
                library: linkedLibraryId,
                limit: 20,
                sort: {
                    field: 'label',
                    order: SortOrder.asc
                }
            }
        }
    );

    const recordList = useMemo(() => data?.records?.list ?? [], [data]);

    const selectOptions = useMemo<ComponentProps<typeof KitSelect>['options']>(
        () =>
            recordList.map(recordItem => ({
                value: recordItem.whoAmI.id,
                label: recordItem.whoAmI.label,
                idCard: {
                    title: recordItem.whoAmI.label,
                    avatar: (
                        <KitAvatar
                            size={'small'}
                            shape={'square'}
                            imageFit={'contain'}
                            src={recordItem.whoAmI.preview?.small}
                            label={recordItem.whoAmI.label}
                        />
                    )
                }
            })),
        [recordList]
    );

    const augmentedSelectOptionsWithActive = selectOptions;

    if (activeValue && recordList.findIndex(record => record.id === activeValue.linkValue.id) === -1) {
        augmentedSelectOptionsWithActive.push({
            value: activeValue.linkValue.whoAmI.id,
            label: activeValue.linkValue.whoAmI.label,
            idCard: {
                title: activeValue.linkValue.whoAmI.label,
                avatar: (
                    <KitAvatar
                        size={'small'}
                        shape={'square'}
                        imageFit={'contain'}
                        src={activeValue.linkValue.whoAmI.preview?.small}
                        label={activeValue.linkValue.whoAmI.label}
                    />
                )
            }
        });
    }

    const updateLeavField = ({
        attribute,
        idValue,
        value
    }: {
        attribute: RecordFormAttributeLinkAttributeFragment;
        idValue: string | null;
        value: string;
    }) => {
        const selectedLinkValue = recordList.find(record => record.id === value);

        return onSelectChange(
            [
                {
                    attribute,
                    idValue,
                    value: selectedLinkValue ?? activeValue.linkValue
                }
            ],
            null
        );
    };

    return {loading, selectOptions: augmentedSelectOptionsWithActive, updateLeavField};
};
