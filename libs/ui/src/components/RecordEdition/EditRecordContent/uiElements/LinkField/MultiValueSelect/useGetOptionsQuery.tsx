import {useQuery} from '@apollo/client';
import {RecordFormAttributeLinkAttributeFragment, SortOrder} from '_ui/_gqlTypes';
import {
    IGetRecordsFromLibraryQuery,
    IGetRecordsFromLibraryQueryVariables,
    getRecordsFromLibraryQuery
} from '_ui/_queries/records/getRecordsFromLibraryQuery';
import {IRecordIdentity} from '_ui/types';
import {KitAvatar, KitSelect} from 'aristid-ds';
import {ComponentProps, useMemo} from 'react';

export const useGetOptionsQuery = ({
    attribute,
    onSelectChange
}: {
    attribute: RecordFormAttributeLinkAttributeFragment;
    onSelectChange: (values: IRecordIdentity[]) => void;
}) => {
    let loading: boolean;
    let data: IGetRecordsFromLibraryQuery;

    if (attribute.linkValuesList?.enable) {
        loading = false;
        data = {records: {list: attribute.linkValuesList.values, totalCount: attribute.linkValuesList.values.length}};
    } else {
        ({loading, data} = useQuery<IGetRecordsFromLibraryQuery, IGetRecordsFromLibraryQueryVariables>(
            getRecordsFromLibraryQuery(),
            {
                fetchPolicy: 'network-only',
                variables: {
                    library: attribute.linked_library.id,
                    limit: 1_000,
                    sort: {
                        field: 'label',
                        order: SortOrder.asc
                    }
                }
            }
        ));
    }

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

    const updateLeavField = (value: string) => {
        const selectedLinkValue = recordList.find(record => record.id === value);

        return onSelectChange([selectedLinkValue]);
    };

    return {loading, selectOptions, updateLeavField};
};