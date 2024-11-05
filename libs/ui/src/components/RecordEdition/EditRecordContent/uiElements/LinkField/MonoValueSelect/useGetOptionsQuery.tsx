// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import {SortOrder} from '_ui/_gqlTypes';
import {
    IGetRecordsFromLibraryQuery,
    IGetRecordsFromLibraryQueryVariables,
    getRecordsFromLibraryQuery
} from '_ui/_queries/records/getRecordsFromLibraryQuery';
import {RecordFormElementsValueLinkValue} from '_ui/hooks/useGetRecordForm';
import {IRecordIdentity} from '_ui/types';
import sortBy from 'lodash/sortBy';
import {KitSelect, AntSkeleton} from 'aristid-ds';
import {useState, useMemo, ComponentProps} from 'react';

const RECORDS_LIMIT = 20; // TODO: should be configurable
const MINIMAL_SEARCH_LENGTH = 2;

type RecordOptions = ComponentProps<typeof KitSelect>['options'];

export const useGetOptionsQuery = ({
    activeValue,
    linkedLibraryId,
    onSelectChange
}: {
    activeValue: RecordFormElementsValueLinkValue | undefined;
    linkedLibraryId: string;
    onSelectChange: (values: Array<{value: IRecordIdentity; idValue: string}>) => void;
}) => {
    const initialSearchVariables: IGetRecordsFromLibraryQueryVariables = {
        library: linkedLibraryId,
        limit: RECORDS_LIMIT,
        sort: {
            field: 'created_at',
            order: SortOrder.desc
        }
    };
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [initialQueryTotalCount, setInitialQueryTotalCount] = useState(0);
    const [optionsType, setOptionsType] = useState<'suggestions' | 'search'>('suggestions');

    const {loading: isQueryLoading, data, refetch} = useQuery<
        IGetRecordsFromLibraryQuery,
        IGetRecordsFromLibraryQueryVariables
    >(getRecordsFromLibraryQuery([], true), {
        fetchPolicy: 'network-only',
        variables: initialSearchVariables,
        onCompleted: queryData => {
            // This is called only after the first fetch, so we can store the total count without searching.
            setInitialQueryTotalCount(queryData?.records?.totalCount ?? 0);
        }
    });

    // const recordList = useMemo(() => data?.records?.list.toSorted() ?? [], [data]); // TODO: when toSorted method available (ie. TS >= 5.2.0)
    const recordList = useMemo(() => sortBy(data?.records?.list, 'whoAmI.label'), [data]);

    const selectOptions = useMemo<RecordOptions>(
        () =>
            isSearchLoading // Might become unnecessary when DS handles loading better
                ? Array.from({length: 10}).map((_, index): RecordOptions[number] => ({
                      value: `skeleton-${index}`,
                      idCard: {
                          //@ts-expect-error KitIdCard doesn't allow a ReactNode as title, but it's fine at runtime
                          title: <AntSkeleton.Input active />,
                          avatarProps: {
                              src: <AntSkeleton.Avatar active />
                          }
                      }
                  }))
                : recordList.map(recordItem => {
                      const recordLabel = recordItem.whoAmI.label ?? recordItem.whoAmI.id;

                      return {
                          value: recordItem.whoAmI.id,
                          label: recordLabel,
                          idCard: {
                              title: recordLabel,
                              avatarProps: {
                                  size: 'small',
                                  shape: 'square',
                                  imageFit: 'contain',
                                  src: recordItem.whoAmI.preview?.small,
                                  label: recordLabel
                              }
                          }
                      };
                  }),
        [recordList, isSearchLoading]
    );

    const augmentedSelectOptionsWithActive = [...selectOptions];

    if (activeValue && recordList.findIndex(record => record.id === activeValue.linkValue.id) === -1) {
        augmentedSelectOptionsWithActive.push({
            value: activeValue.linkValue.whoAmI.id,
            label: activeValue.linkValue.whoAmI.label,
            idCard: {
                title: activeValue.linkValue.whoAmI.label,
                avatarProps: {
                    size: 'small',
                    shape: 'square',
                    imageFit: 'contain',
                    src: activeValue.linkValue.whoAmI.preview?.small,
                    label: activeValue.linkValue.whoAmI.label
                }
            }
        });
    }

    const updateLeavField = (value: string) => {
        const selectedLinkValue = recordList.find(record => record.id === value);

        return onSelectChange([{value: selectedLinkValue ?? activeValue.linkValue, idValue: null}]);
    };

    const runFullTextSearch = async (searchText: string) => {
        const isSearchTextEmpty = searchText === '';
        if (!isSearchTextEmpty && searchText.length < MINIMAL_SEARCH_LENGTH) {
            return;
        }

        setIsSearchLoading(true);
        await refetch(
            isSearchTextEmpty
                ? {...initialSearchVariables, fullText: undefined}
                : {
                      ...initialSearchVariables,
                      sort: undefined,
                      fullText: searchText
                  }
        );
        setOptionsType(isSearchTextEmpty ? 'suggestions' : 'search');
        setIsSearchLoading(false);
    };

    return {
        loading: isQueryLoading || isSearchLoading,
        selectOptions: augmentedSelectOptionsWithActive,
        updateLeavField,
        runFullTextSearch,
        totalCount: initialQueryTotalCount,
        searchResultCount: data?.records?.totalCount ?? 0,
        suggestionsCount: Math.min(RECORDS_LIMIT, initialQueryTotalCount),
        optionsType
    };
};
