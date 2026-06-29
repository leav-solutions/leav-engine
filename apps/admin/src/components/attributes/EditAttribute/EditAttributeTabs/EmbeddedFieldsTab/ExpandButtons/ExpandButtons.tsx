import {type Dispatch, type SetStateAction} from 'react';
import {useTranslation} from 'react-i18next';
import {map, type TreeItem} from '@nosferatu500/react-sortable-tree';
import {Button, ButtonGroup} from 'semantic-ui-react';
import {type IFlatItem} from '../EmbeddedFieldsTab';

interface IExpandButtonProps {
    flatItems: TreeItem[];
    setFlatItems: Dispatch<SetStateAction<IFlatItem[]>>;
}

function ExpandButtons({flatItems, setFlatItems: setTreeItems}: IExpandButtonProps): JSX.Element {
    const {t} = useTranslation();

    const expandedAll = () => {
        map({
            treeData: flatItems,
            callback: ({node}) => {
                setTreeItems(es =>
                    es.map(e =>
                        e.id === node.id
                            ? {
                                  ...e,
                                  expanded: true,
                              }
                            : e,
                    ),
                );
                return {...node, expanded: true};
            },
            getNodeKey: ({treeIndex}) => treeIndex,
            ignoreCollapsed: false,
        });
    };

    const reduceAll = () => {
        map({
            treeData: flatItems,
            callback: ({node}) => {
                setTreeItems(es =>
                    es.map(e =>
                        e.id === node.id
                            ? {
                                  ...e,
                                  expanded: false,
                              }
                            : e,
                    ),
                );
                return {...node, expanded: false};
            },
            getNodeKey: ({treeIndex}) => treeIndex,
            ignoreCollapsed: false,
        });
    };

    return (
        <div>
            <ButtonGroup compact widths="1">
                <Button size="mini" onClick={expandedAll}>
                    {t('admin.expanded')}
                </Button>

                <Button size="mini" onClick={reduceAll}>
                    {t('admin.reduce')}
                </Button>
            </ButtonGroup>
        </div>
    );
}

export default ExpandButtons;
