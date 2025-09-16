// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent} from 'react';
import {useLocation, useNavigate, useParams, useSearchParams} from 'react-router-dom';
import {Explorer, ThroughConditionFilter, useLang} from '@leav/ui';
import {mapToCommonExplorerProps} from '../../explorer-panel/mapperToExplorerProps';
import {mapperToItemActions} from '../../explorer-panel/mapperToItemActions';
import {ItemActions, LibraryExplorerProps} from '../../types';
import {AttributeType, RecordFilterCondition} from '../../../../__generated__';
import {explorerContainer} from './PanelContent.module.css';

interface IPanelExplorerProps {
    libraryId: string;
    attributeSource: string;
    viewId: string | undefined;
    explorerProps: LibraryExplorerProps | undefined;
    actions: ItemActions;
    recordId: string | null;
}

export const PanelAttributeExplorer: FunctionComponent<IPanelExplorerProps> = ({
    libraryId,
    attributeSource,
    viewId,
    explorerProps,
    actions,
    recordId
}) => {
    const {lang} = useLang();
    const navigate = useNavigate();
    const {panelId} = useParams();
    const [searchParams] = useSearchParams();

    const linkExplorerProps = explorerProps ? mapToCommonExplorerProps({explorerProps}) : {};
    const itemActions = mapperToItemActions({actions, lang, navigate, panelId, searchParams});

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
                            value: recordId
                        }
                    ]
                }}
                itemActions={itemActions}
                {...linkExplorerProps}
                defaultPrimaryActions={[]}
                defaultMassActions={[]}
                defaultActionsForItem={['edit']}
            />
        </div>
    );
};
