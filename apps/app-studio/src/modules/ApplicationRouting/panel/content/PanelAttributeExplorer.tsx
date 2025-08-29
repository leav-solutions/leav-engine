// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent} from 'react';
import {useLocation} from 'react-router-dom';
import {Explorer, ThroughConditionFilter} from '@leav/ui';
import {explorerContainer} from './PanelContent.module.css';
import {useExplorerProps} from '../../explorer-panel/useExplorerProps';
import {useItemActions} from '../../explorer-panel/useItemActions';
import {recordSearchParamsName} from '../../routes';
import {ItemActions, LibraryExplorerProps} from '../../types';
import {AttributeType, RecordFilterCondition} from '../../../../__generated__';

interface IPanelExplorerProps {
    libraryId: string;
    attributeSource: string;
    viewId: string | null;
    explorerProps: LibraryExplorerProps;
    actions: ItemActions;
}

export const PanelAttributeExplorer: FunctionComponent<IPanelExplorerProps> = ({
    libraryId,
    attributeSource,
    viewId,
    explorerProps,
    actions
}) => {
    const {search} = useLocation();
    const searchParams = new URLSearchParams(search);
    const {commonExplorerProps} = useExplorerProps({explorerProps});
    const {itemActions} = useItemActions({actions});

    return (
        <div className={explorerContainer}>
            <Explorer
                entrypoint={{
                    type: 'library',
                    libraryId
                }}
                defaultViewSettings={{
                    viewId,
                    filters: [
                        {
                            id: 'filter_to_linked_records',
                            hidden: true,
                            field: attributeSource,
                            subField: 'id',
                            attribute: {
                                id: attributeSource,
                                type: AttributeType.advanced_link,
                                label: 'SHOULD BE HIDDEN'
                            },
                            condition: ThroughConditionFilter.THROUGH,
                            subCondition: RecordFilterCondition.EQUAL,
                            value: searchParams.get(recordSearchParamsName)
                        }
                    ]
                }}
                itemActions={itemActions}
                {...commonExplorerProps}
                defaultPrimaryActions={[]}
                defaultMassActions={[]}
                defaultActionsForItem={['edit']}
            />
        </div>
    );
};
