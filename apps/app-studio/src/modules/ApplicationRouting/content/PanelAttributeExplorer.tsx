// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent} from 'react';
import {useNavigate} from 'react-router-dom';
import {Explorer, ThroughConditionFilter, useExecuteSaveValueBatchMutation, useLang} from '@leav/ui';
import {useApplicationSettingsContext} from '../../../config/application-instance/application-settings/ApplicationSettingsContext';
import {mapToCommonExplorerProps} from './explorer-panel/mapperToCommonExplorerProps';
import {mapperToItemActions} from './explorer-panel/mapperToItemActions';
import {type ItemActions, type ExplorerProps} from '../types';
import {AttributeType, RecordFilterCondition} from '../../../__generated__';

import {explorerContainer} from './panelContent.module.css';

interface IPanelExplorerProps {
    libraryId: string;
    attributeSource: string;
    viewId: string | undefined;
    explorerProps: ExplorerProps | undefined;
    actions: ItemActions;
    recordId: string | null;
}

export const PanelAttributeExplorer: FunctionComponent<IPanelExplorerProps> = ({
    libraryId,
    attributeSource,
    viewId,
    explorerProps,
    actions,
    recordId,
}) => {
    const [application] = useApplicationSettingsContext();
    const {lang} = useLang();
    const navigate = useNavigate();

    const {saveValues} = useExecuteSaveValueBatchMutation();

    const commonExplorerProps = explorerProps ? mapToCommonExplorerProps({explorerProps}) : {};
    const itemActions = mapperToItemActions({actions, application, lang, navigate, libraryId});

    return (
        <div className={explorerContainer}>
            <Explorer
                {...commonExplorerProps}
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
                                type: AttributeType.simple_link, // because it can be only mono-valued
                                label: 'SHOULD BE HIDDEN',
                            },
                            condition: ThroughConditionFilter.THROUGH,
                            subCondition: RecordFilterCondition.EQUAL,
                            value: recordId,
                        },
                    ],
                    ...commonExplorerProps.defaultViewSettings,
                }}
                entrypoint={{
                    type: 'library',
                    libraryId,
                }}
                itemActions={itemActions}
                hideFirstActionLabel
                defaultCallbacks={{
                    primary: {
                        create: ({recordIdCreated}) =>
                            // TODO: should be deleted when explorer used panels instead of modal form
                            saveValues(
                                {
                                    id: recordIdCreated,
                                    library: {
                                        id: libraryId,
                                    },
                                },
                                [
                                    {
                                        attribute: attributeSource,
                                        idValue: null,
                                        value: recordId,
                                    },
                                ],
                            ),
                    },
                }}
            />
        </div>
    );
};
