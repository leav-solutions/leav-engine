// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {History, Location} from 'history';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Header, Tab, TabProps} from 'semantic-ui-react';
import useLang from '../../../../hooks/useLang';
import {localizedLabel} from '../../../../utils';
import {GET_TREE_BY_ID_trees_list} from '../../../../_gqlTypes/GET_TREE_BY_ID';
import TreeInfosTab from './InfosTab';
import PermissionsTab from './PermissionsTab';
import StructureTab from './StructureTab';

export interface IEditTreeMatchParams {
    id: string;
}

interface IEditTreeTabsProps {
    tree: GET_TREE_BY_ID_trees_list | null;
    readonly: boolean;
    history: History;
    location?: Location;
}

function EditTreeTabs({tree, readonly, history, location}: IEditTreeTabsProps): JSX.Element {
    const {t} = useTranslation();
    const {lang} = useLang();
    const isCreationMode = tree === null;

    const label = isCreationMode ? t('trees.new') : localizedLabel(tree?.label ?? null, lang) || tree!.id;

    const panes = [
        {
            key: 'infos',
            mustBeDisplayed: true,
            menuItem: t('trees.informations'),
            render: () => (
                <Tab.Pane key="infos" className="grow">
                    <TreeInfosTab tree={tree} readonly={readonly} history={history} />
                </Tab.Pane>
            )
        },
        {
            key: 'structure',
            mustBeDisplayed: !isCreationMode,
            menuItem: t('trees.structure'),
            render: () => (
                <Tab.Pane key="structure" className="grow">
                    <StructureTab tree={tree as GET_TREE_BY_ID_trees_list} readonly={readonly} />
                </Tab.Pane>
            )
        },
        {
            key: 'permissions',
            mustBeDisplayed: !isCreationMode,
            menuItem: t('trees.permissions'),
            render: () => (
                <Tab.Pane key="structure" className="grow">
                    <PermissionsTab tree={tree as GET_TREE_BY_ID_trees_list} readonly={readonly} />
                </Tab.Pane>
            )
        }
    ].filter(p => p.mustBeDisplayed);

    const tabName = location ? location.hash.replace('#', '') : undefined;
    const [activeIndex, setActiveIndex] = useState<number | undefined>(
        tabName ? panes.findIndex(p => tabName === p.key) : 0
    );

    const _handleOnTabChange = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, data: TabProps) => {
        if (data.panes && data.activeIndex !== undefined) {
            setActiveIndex(Number(data.activeIndex.toString()));
            history?.push(`#${data.panes[data.activeIndex].key}`);
        }
    };

    return (
        <>
            <Header className="no-grow">{label}</Header>
            <Tab
                activeIndex={activeIndex}
                onTabChange={_handleOnTabChange}
                menu={{secondary: true, pointing: true}}
                panes={panes}
                className="grow flex-col height100"
            />
        </>
    );
}

export default EditTreeTabs;
