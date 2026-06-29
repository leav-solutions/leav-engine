import TreeExplorer from '../../TreeExplorer';
import {useState, type MouseEvent} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate, useLocation} from 'react-router-dom';
import {Header, Tab, type TabProps} from 'semantic-ui-react';
import useLang from '../../../../hooks/useLang';
import {localizedLabel} from '../../../../utils';
import {type GET_TREE_BY_ID_trees_list} from '../../../../_gqlTypes/GET_TREE_BY_ID';
import TreeInfosTab from './InfosTab';
import PermissionsTab from './PermissionsTab';
import TreeStructure from './TreeStructure';
import CustomConfig from './CustomConfigTab';

export interface IEditTreeMatchParams {
    id: string;
}

interface IEditTreeTabsProps {
    tree: GET_TREE_BY_ID_trees_list | null;
    readonly: boolean;
}

function EditTreeTabs({tree, readonly}: IEditTreeTabsProps): JSX.Element {
    const {t} = useTranslation();
    const {lang} = useLang();
    const navigate = useNavigate();
    const location = useLocation();

    const isCreationMode = tree === null;

    const label = isCreationMode ? t('trees.new') : localizedLabel(tree?.label ?? null, lang) || tree!.id;

    const panes = [
        {
            key: 'infos',
            mustBeDisplayed: true,
            menuItem: t('trees.informations'),
            render: () => (
                <Tab.Pane key="infos" className="grow">
                    <TreeInfosTab tree={tree} readonly={readonly} />
                </Tab.Pane>
            ),
        },
        {
            key: 'structure',
            mustBeDisplayed: !isCreationMode,
            menuItem: t('trees.structure'),
            render: () => (
                <Tab.Pane key="structure" className="grow">
                    <TreeStructure tree={tree} readOnly={readonly} />
                </Tab.Pane>
            ),
        },
        {
            key: 'explorer',
            mustBeDisplayed: !isCreationMode,
            menuItem: t('trees.explorer'),
            render: () => (
                <Tab.Pane key="explorer" className="grow">
                    <TreeExplorer
                        withFakeRoot
                        fakeRootLabel={label}
                        tree={tree as GET_TREE_BY_ID_trees_list}
                        readOnly={readonly}
                    />
                </Tab.Pane>
            ),
        },
        {
            key: 'permissions',
            mustBeDisplayed: !isCreationMode,
            menuItem: t('trees.permissions'),
            render: () => (
                <Tab.Pane key="structure" className="grow">
                    <PermissionsTab tree={tree as GET_TREE_BY_ID_trees_list} readonly={readonly} />
                </Tab.Pane>
            ),
        },
        {
            key: 'custom-config',
            mustBeDisplayed: !isCreationMode,
            menuItem: t('trees.custom-config'),
            render: () => (
                <Tab.Pane key="custom-config" className="height100" style={{padding: '0', border: '0px none'}}>
                    <CustomConfig tree={tree} />
                </Tab.Pane>
            ),
        },
    ].filter(p => p.mustBeDisplayed);

    const tabName = location ? location.hash.replace('#', '') : undefined;
    const [activeIndex, setActiveIndex] = useState<number | undefined>(
        tabName ? panes.findIndex(p => tabName === p.key) : 0,
    );

    const _handleOnTabChange = (event: MouseEvent<HTMLDivElement>, data: TabProps) => {
        if (data.panes && data.activeIndex !== undefined) {
            setActiveIndex(Number(data.activeIndex.toString()));
            navigate(`#${data.panes[data.activeIndex].key}`);
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
