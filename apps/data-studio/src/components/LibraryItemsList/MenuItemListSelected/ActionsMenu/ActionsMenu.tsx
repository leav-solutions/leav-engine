// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {DeleteOutlined, DownOutlined, ExportOutlined, PictureOutlined} from '@ant-design/icons';
import {Button, Dropdown} from 'antd';
import TriggerPreviewsGenerationModal from 'components/shared/TriggerPreviewsGenerationModal';
import {useActiveLibrary} from 'hooks/ActiveLibHook/ActiveLibHook';
import useSearchReducer from 'hooks/useSearchReducer';
import {ReactNode, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useAppSelector} from 'reduxStore/store';
import {LibraryBehavior} from '_gqlTypes/globalTypes';
import DeactivateRecordsModal from '../DeactivateRecordsModal';
import ExportModal from './ExportModal';

interface IMenuAction {
    key: string;
    icon: ReactNode;
    title: string;
    display: boolean;
    modalComp: (props: any) => JSX.Element;
    modalProps?: any;
}

function ActionsMenu(): JSX.Element {
    const {t} = useTranslation();
    const [activeAction, setActiveAction] = useState<string>();
    const [activeLibrary] = useActiveLibrary();
    const {state: searchState} = useSearchReducer();

    const {selection: selectionState} = useAppSelector(state => state.selection); // keep selection
    const selectedIds = selectionState.selected.map(r => r.id);
    const filters = searchState.filters;

    const actions: IMenuAction[] = [
        {
            key: 'export',
            icon: <ExportOutlined rotate={270} />,
            title: t('export.title'),
            modalComp: ExportModal,
            display: true
        },
        {
            key: 'deactivate',
            icon: <DeleteOutlined />,
            title: t('records_deactivation.title'),
            modalComp: DeactivateRecordsModal,
            display: true
        },
        {
            key: 'generate_previews',
            icon: <PictureOutlined />,
            title: t('files.generate_previews'),
            modalComp: TriggerPreviewsGenerationModal,
            display: activeLibrary.behavior === LibraryBehavior.files,
            modalProps: {
                libraryId: activeLibrary.id,
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
