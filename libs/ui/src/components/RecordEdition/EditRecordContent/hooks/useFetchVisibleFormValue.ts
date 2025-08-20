// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useGetRecordFormElementsValuesLazyQuery} from '_ui/_gqlTypes';
import {useEffect, useState} from 'react';
import {IRecordForm, RecordFormElement} from '_ui/hooks/useGetRecordForm';
import {FormUIElementTypes} from '@leav/utils';

/**
 * Hook to fetch values from visible elements in a form (elements in the visible tab + other elements outside a tab)
 * @param formIdToLoad
 * @param recordForm
 * @param tabIdVisible
 */
export const useFetchVisibleFormValue = (
    formIdToLoad: string,
    isCreationForm: boolean,
    recordForm: IRecordForm,
    tabIdVisible: string
) => {
    const [error, setError] = useState(null);
    const [recordFormWithValues, setRecordFormWithValues] = useState<IRecordForm>(null);
    const [elementIdsVisible, setElementIdsVisible] = useState<string[]>([]);
    const [elementsIdsFetched, setElementsIdsFetched] = useState<string[]>([]);

    const [getRecordFormElementsValues, {loading}] = useGetRecordFormElementsValuesLazyQuery({
        fetchPolicy: 'no-cache'
    });

    // Get all elements visible
    const getElementIdsVisible = (): string[] => {
        // Find element ids from record.elements that are in the first page of a tab or are not a tab
        const containerToExclude = [];

        recordForm.elements.forEach(el => {
            if (el.uiElementType === FormUIElementTypes.TABS) {
                const tabSettings = el.settings?.find(s => s.key === 'tabs');

                // Exclude all tab ids that are not equals to tabIdVisible variable
                containerToExclude.push(...tabSettings.value.filter(e => e.id !== tabIdVisible).map(e => e.id));
            }
        });

        // Find all elements visible
        return recordForm.elements
            .filter(
                e =>
                    // filters all elements where containers id contains /${e.id}
                    !containerToExclude.some(c => e.containerId?.includes(c))
            )
            .map(e => e.id);
    };

    useEffect(() => {
        (async () => {
            if (!recordForm || !formIdToLoad || tabIdVisible === undefined) {
                return;
            }

            // skip on creation form
            if (isCreationForm) {
                return;
            }

            const elementIds = getElementIdsVisible();
            setElementIdsVisible(elementIds);

            // List of elementIds that we don't have fetched their values yet
            const elementIdsToFetch = elementIds.filter(e => !elementsIdsFetched.includes(e));

            if (!elementIdsToFetch.length) {
                return;
            }

            try {
                const result = await getRecordFormElementsValues({
                    variables: {
                        libraryId: recordForm.library.id,
                        recordId: recordForm.recordId,
                        formId: formIdToLoad,
                        elementIds: elementIdsToFetch
                    }
                });

                setElementsIdsFetched([...elementsIdsFetched, ...elementIdsToFetch]);

                const recordFormElementValues = (result.data?.getRecordFormElementsValues ||
                    []) as unknown as RecordFormElement[];
                updateRecordFormWithValues(recordFormElementValues);
            } catch (e) {
                setError(e);
            }
        })();
    }, [formIdToLoad, isCreationForm, recordForm, tabIdVisible]);

    // Merge new values into recordForm
    const updateRecordFormWithValues = (elementsValues: RecordFormElement[]) => {
        setRecordFormWithValues({
            ...recordForm,
            elements: recordForm.elements.map(e => {
                const elementValue = elementsValues.find((v: RecordFormElement) => v.id === e.id);
                if (elementValue) {
                    return {
                        ...e,
                        values: elementValue.values,
                        valueError: elementValue.valueError
                    };
                } else {
                    return e;
                }
            })
        });
    };

    // Create a refetch function for computed fields
    const refetchRecordFormWithValues = async () => {
        try {
            const result = await getRecordFormElementsValues({
                variables: {
                    libraryId: recordForm.library.id,
                    recordId: recordForm.recordId,
                    formId: formIdToLoad,
                    elementIds: elementIdsVisible
                }
            });
            updateRecordFormWithValues(
                (result.data?.getRecordFormElementsValues || []) as unknown as RecordFormElement[]
            );
        } catch (e) {
            setError(e);
        }
    };

    return {
        loading,
        error,
        refetchRecordFormWithValues,
        recordFormWithValues
    };
};
