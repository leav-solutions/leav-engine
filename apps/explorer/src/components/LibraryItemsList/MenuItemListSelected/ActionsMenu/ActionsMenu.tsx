// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {DeleteOutlined, DownOutlined, ExportOutlined} from '@ant-design/icons';
import {Button, Dropdown, Menu} from 'antd';
import {ReactNode, useState} from 'react';
import {useTranslation} from 'react-i18next';
import DeactivateRecordsModal from '../DeactivateRecordsModal';
import ExportModal from './ExportModal';

interface IMenuAction {
    key: string;
    icon: ReactNode;
    title: string;
    modalComp: (props: any) => JSX.Element;
}

function ActionsMenu(): JSX.Element {
    const {t} = useTranslation();
    const [activeAction, setActiveAction] = useState<string>();

    const actions: IMenuAction[] = [
        {
            key: 'export',
            icon: <ExportOutlined rotate={270} />,
            title: t('export.title'),
            modalComp: ExportModal
        },
        {
            key: 'deactivate',
            icon: <DeleteOutlined />,
            title: t('records_deactivation.title'),
            modalComp: DeactivateRecordsModal
        }
    ];

    const _handleClick = (actionKey: string) => () => {
        setActiveAction(actionKey);
    };

    const _handleCloseModal = () => setActiveAction('');

    return (
        <>
            <Dropdown
                overlay={
                    <Menu
                        items={actions.map(a => ({
                            icon: a.icon,
                            key: a.key,
                            title: a.title,
                            label: a.title,
                            onClick: _handleClick(a.key)
                        }))}
                    ></Menu>
                }
            >
                <Button>
                    {t('menu-selection.actions')} <DownOutlined />
                </Button>
            </Dropdown>
            {actions
                .filter(a => activeAction === a.key)
                .map(a => (
                    <a.modalComp key={a.key} open={activeAction === a.key} onClose={_handleCloseModal} />
                ))}
        </>
    );
}

export default ActionsMenu;
