// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useState, useEffect} from 'react';
import {IRecordForm} from '_ui/hooks/useGetRecordForm';

/**
 * Hook to manage tab visibility and tab click events in the EditRecordContent component
 * @param recordForm The record form containing tab elements
 * @returns Object containing the visible tab ID and a handler for tab click events
 */
export const useTabManagement = (recordForm: IRecordForm) => {
    // State to track the currently visible tab ID
    const [tabIdVisible, setTabIdVisible] = useState<string | undefined>(undefined);

    // Initialize the visible tab ID when the record form is loaded
    useEffect(() => {
        // When we load the record form, get the ID of the first tab
        const firstTabId = recordForm?.elements
            ?.find(e => e.uiElementType === 'tabs')
            ?.settings?.find(s => s.key === 'tabs')?.value[0]?.id;

        if (firstTabId) {
            setTabIdVisible(firstTabId);
        }
    }, [recordForm]);

    /**
     * Handler for tab click events
     * @param tabIdClicked The ID of the tab that was clicked
     */
    const handleTabClick = (tabIdClicked: string) => {
        setTabIdVisible(tabIdClicked);
    };

    return {
        tabIdVisible,
        handleTabClick
    };
};

export default useTabManagement;
