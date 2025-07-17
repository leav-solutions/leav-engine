// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useGetRecordFormElementsValuesLazyQuery} from '_ui/_gqlTypes';
import {useEffect, useState} from 'react';
import {IRecordForm, RecordFormElement} from '_ui/hooks/useGetRecordForm';

export const useGetVisibleValues = (formIdToLoad: string, recordForm: IRecordForm, tabIdVisible: string) => {
    const elementsValuesFetched = [];

    const [recordFormWithValues, setRecordFormWithValues] = useState<IRecordForm>(null);
    const [elementsValues, setElementsValues] = useState([]);
    const [elementIdsVisible, setElementIdsVisible] = useState<string[]>([]);

    const [getRecordFormElementsValues] = useGetRecordFormElementsValuesLazyQuery({
        fetchPolicy: 'no-cache'
    });

    const getElementIdsVisible = (): string[] => {
        // Find element ids from record.elements that are in the first page of a tab or are not a tab
        const containerToExclude = [];

        recordForm.elements.forEach(el => {
            if (el.uiElementType === 'tabs') {
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
            if (!recordForm || !formIdToLoad || !tabIdVisible) {
                return;
            }

            const elementIds = getElementIdsVisible();
            setElementIdsVisible(elementIds);

            // List of elementIds that we don't have fetched their values yet
            const elementIdsToFetch = elementIds.filter(e => !elementsValuesFetched.includes(e));

            if (!elementIdsToFetch.length) {
                return;
            }

            elementsValuesFetched.push(elementIdsToFetch);

            const result = await getRecordFormElementsValues({
                variables: {
                    libraryId: recordForm.library.id,
                    recordId: recordForm.recordId,
                    formId: formIdToLoad,
                    elementIds: elementIdsToFetch
                }
            });

            const recordFormElementValues = result.data?.getRecordFormElementsValues;
            setElementsValues(recordFormElementValues);

            // Merge new values into recordForm
            setRecordFormWithValues({
                ...recordForm,
                elements: recordForm.elements.map(e => {
                    const elementValue = elementsValues.find(v => v.id === e.id);
                    if (elementValue) {
                        return {
                            ...e,
                            values: elementValue.values
                        };
                    } else {
                        return e;
                    }
                })
            });
        })();
    }, [formIdToLoad, recordForm, tabIdVisible]);

    // Create a refetch function for computed fields
    const refetchComputeFields = async () => {
        const result = await getRecordFormElementsValues({
            variables: {
                libraryId: recordForm.library.id,
                recordId: recordForm.recordId,
                formId: formIdToLoad,
                elementIds: elementIdsVisible
            }
        });
        setElementsValues(result.data?.getRecordFormElementsValues);
    };

    return {
        elementsValues,
        refetchComputeFields,
        recordFormWithValues
    };
};
