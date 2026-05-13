import {useEffect, useState} from 'react';
import {RecordFilterCondition, usePanelAttributeCountLazyQuery} from '../../../../../__generated__';
import {type AttributeExplorerPanel} from '_ui/hooks/useIFrameMessenger/types';

interface IUseGetPanelsAttributeCounts {
    panels: AttributeExplorerPanel[];
    recordId: string | undefined;
}

export const useGetPanelsAttributeCounts = ({panels, recordId}: IUseGetPanelsAttributeCounts) => {
    const [getPanelAttributeCount] = usePanelAttributeCountLazyQuery();
    const [panelsCounts, setPanelsCounts] = useState<Record<string, number>>({});

    useEffect(() => {
        if (!recordId || panels.length === 0) {
            setPanelsCounts({});
            return;
        }

        Promise.allSettled(
            panels.map(async panel => {
                const result = await getPanelAttributeCount({
                    variables: {
                        library: panel.libraryId,
                        filters: [
                            {
                                field: `${panel.attributeSource}.id`,
                                condition: RecordFilterCondition.EQUAL,
                                value: recordId,
                            },
                        ],
                    },
                });
                return {panelId: panel.id, count: result.data?.records.totalCount};
            }),
        ).then(results => {
            const counts: Record<string, number> = {};
            results.forEach(result => {
                if (result.status === 'fulfilled' && result.value.count !== undefined) {
                    counts[result.value.panelId] = result.value.count;
                }
            });
            setPanelsCounts(counts);
        });
    }, [recordId, panels.length, getPanelAttributeCount]);

    return {panelsCounts};
};
