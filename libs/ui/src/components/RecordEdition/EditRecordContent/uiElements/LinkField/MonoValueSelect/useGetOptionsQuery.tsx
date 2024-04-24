// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import {SortOrder} from '_ui/_gqlTypes';
import {
    IGetRecordsFromLibraryQuery,
    IGetRecordsFromLibraryQueryVariables,
    getRecordsFromLibraryQuery
} from '_ui/_queries/records/getRecordsFromLibraryQuery';
import {KitSelect} from 'aristid-ds';
import {ComponentProps, useMemo} from 'react';
import {RecordFormElementsValueLinkValue} from '_ui/hooks/useGetRecordForm';
import {IRecordIdentity} from '_ui/types';
import sortBy from 'lodash/sortBy';

export const useGetOptionsQuery = ({
    activeValue,
    linkedLibraryId,
    onSelectChange
}: {
    activeValue: RecordFormElementsValueLinkValue | undefined;
    linkedLibraryId: string;
    onSelectChange: (values: IRecordIdentity[]) => void;
}) => {
    const {loading, data} = useQuery<IGetRecordsFromLibraryQuery, IGetRecordsFromLibraryQueryVariables>(
        getRecordsFromLibraryQuery(),
        {
            fetchPolicy: 'network-only',
            variables: {
                library: linkedLibraryId,
                limit: 20, // TODO: should be a xStream configuration
                sort: {
                    field: 'created_at',
                    order: SortOrder.desc
                }
            }
        }
    );

    // const recordList = useMemo(() => data?.records?.list.toSorted() ?? [], [data]); // TODO: when toSorted method available (ie. TS >= 5.2.0)
    const recordList = useMemo(() => sortBy(data?.records?.list, 'whoAmI.label'), [data]);

    const selectOptions = useMemo<ComponentProps<typeof KitSelect>['options']>(
        () =>
            recordList.map(recordItem => ({
                value: recordItem.whoAmI.id,
                label: recordItem.whoAmI.label,
                idCard: {
                    title: recordItem.whoAmI.label,
                    avatarProps: {
                        size: 'small',
                        shape: 'square',
                        imageFit: 'contain',
                        src: recordItem.whoAmI.preview?.small,
                        label: recordItem.whoAmI.label
                    }
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
                avatarProps: {
                    size: 'small',
                    shape: 'square',
                    imageFit:'contain',
                    src: activeValue.linkValue.whoAmI.preview?.small,
                    label:activeValue.linkValue.whoAmI.label
                }
            }
        });
    }

    const updateLeavField = (value: string) => {
        const selectedLinkValue = recordList.find(record => record.id === value);

        return onSelectChange([selectedLinkValue ?? activeValue.linkValue]);
    };

    return {loading, selectOptions: augmentedSelectOptionsWithActive, updateLeavField};
};
