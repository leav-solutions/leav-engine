// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {DeleteOutlined, DownOutlined, ExportOutlined, PictureOutlined} from '@ant-design/icons';
import {Button, Dropdown} from 'antd';
import {ReactNode, useState} from 'react';
import {DeactivateRecordsModal} from '_ui/components/DeactivateRecordsModal';
import {ExportModal} from '_ui/components/ExportModal';
import {TriggerPreviewsGenerationModal} from '_ui/components/TriggerPreviewsGenerationModal';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {LibraryBehavior} from '_ui/_gqlTypes';
import useSearchReducer from '../../hooks/useSearchReducer';

interface IMenuAction {
    key: string;
    icon: ReactNode;
    title: string;
    display: boolean;
    modalComp: (props: any) => JSX.Element;
    modalProps?: any;
}

function ActionsMenu(): JSX.Element {
    const {t} = useSharedTranslation();
    const [activeAction, setActiveAction] = useState<string>();
    const {state: searchState} = useSearchReducer();

    const selectedIds = searchState.selection.selected.map(r => r.id);
    const filters = searchState.filters;

    const actions: IMenuAction[] = [
        {
            key: 'export',
            icon: <ExportOutlined rotate={270} />,
            title: t('export.title'),
            modalComp: ExportModal,
            modalProps: {
                library: searchState.library.id,
                selection: searchState.selection,
                filters: searchState.filters
            },
            display: true
        },
        {
            key: 'deactivate',
            icon: <DeleteOutlined />,
            title: t('records_deactivation.title'),
            modalComp: DeactivateRecordsModal,
            modalProps: {
                library: searchState.library.id,
                selection: searchState.selection,
                filters: searchState.filters
            },
            display: true
        },
        {
            key: 'generate_previews',
            icon: <PictureOutlined />,
            title: t('files.generate_previews'),
            modalComp: TriggerPreviewsGenerationModal,
            display: searchState.library.behavior === LibraryBehavior.files,
            modalProps: {
                libraryId: searchState.library.id,
                recordIds: selectedIds,
                filters
            }
        }
    ].filter(a => a.display);

    const _handleClick = (actionKey: string) => () => {
        setActiveAction(actionKey);
    };

    const _handleCloseModal = () => setActiveAction('');

    return (
        <>
            <Dropdown
                menu={{
                    items: actions.map(a => ({
                        icon: a.icon,
                        key: a.key,
                        title: a.title,
                        label: a.title,
                        onClick: _handleClick(a.key)
                    }))
                }}
            >
                <Button>
                    {t('menu-selection.actions')} <DownOutlined />
                </Button>
            </Dropdown>
            {actions
                .filter(a => activeAction === a.key)
                .map(a => (
                    <a.modalComp
                        key={a.key}
                        open={activeAction === a.key}
                        onClose={_handleCloseModal}
                        {...a.modalProps}
                    />
                ))}
        </>
    );
}

export default ActionsMenu;
