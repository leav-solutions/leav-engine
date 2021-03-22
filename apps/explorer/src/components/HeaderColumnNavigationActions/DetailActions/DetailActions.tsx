// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CloseOutlined} from '@ant-design/icons';
import {useMutation} from '@apollo/client';
import {Dropdown, Menu} from 'antd';
import {IconEllipsisVertical} from 'assets/icons/IconEllipsisVertical';
import {StandardBtn} from 'components/app/StyledComponent/StandardBtn';
import {useStateNavigation} from 'Context/StateNavigationContext';
import {removeTreeElementMutation} from 'graphQL/mutations/trees/removeTreeElementMutation';
import {getTreeContentQuery} from 'graphQL/queries/trees/getTreeContentQuery';
import {useActiveTree} from 'hooks/ActiveTreeHook/ActiveTreeHook';
import {useLang} from 'hooks/LangHook/LangHook';
import {useNotifications} from 'hooks/NotificationsHook/NotificationsHook';
import useStateShared from 'hooks/SharedStateHook/SharedReducerHook';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {resetRecordDetail, setRefetchTreeData} from 'Reducer/NavigationReducerActions';
import {localizedLabel} from 'utils';
import {REMOVE_TREE_ELEMENT, REMOVE_TREE_ELEMENTVariables} from '_gqlTypes/REMOVE_TREE_ELEMENT';
import {NotificationChannel, NotificationType} from '_types/types';

interface IDetailActionsProps {
    isDetail: boolean;
    depth: number;
}

function DetailActions({isDetail, depth}: IDetailActionsProps): JSX.Element {
    const {t} = useTranslation();

    const {stateNavigation, dispatchNavigation} = useStateNavigation();
    const {stateShared} = useStateShared();

    const {addNotification} = useNotifications();
    const [{lang}] = useLang();
    const [activeTree] = useActiveTree();

    const [removeFromTree] = useMutation<REMOVE_TREE_ELEMENT, REMOVE_TREE_ELEMENTVariables>(removeTreeElementMutation, {
        refetchQueries: [{query: getTreeContentQuery(depth), variables: {treeId: activeTree?.id}}]
    });

    const handleDeleteCurrentElement = async () => {
        const element = {
            id: stateNavigation.recordDetail.whoAmI.id,
            library: stateNavigation.recordDetail.whoAmI.library.id
        };

        const label = localizedLabel(stateNavigation.recordDetail.whoAmI.label, lang);

        try {
            await removeFromTree({
                variables: {
                    treeId: activeTree.id,
                    element
                }
            });

            addNotification({
                channel: NotificationChannel.trigger,
                type: NotificationType.success,
                content: t('navigation.notifications.success-detach', {
                    elementName: element.id
                })
            });

            dispatchNavigation(resetRecordDetail());
        } catch (e) {
            addNotification({
                channel: NotificationChannel.trigger,
                type: NotificationType.error,
                content: t('navigation.notifications.error-detach', {
                    elementName: label ?? element.id,
                    errorMessage: e.message
                })
            });
        }

        dispatchNavigation(setRefetchTreeData(true));
    };

    const closeDetail = () => {
        dispatchNavigation(resetRecordDetail());
    };
    if (isDetail && stateShared) {
        return (
            <>
                <span role="dropdown-detail-action">
                    <Dropdown
                        overlay={
                            <Menu>
                                <Menu.Item onClick={handleDeleteCurrentElement}>
                                    {t('navigation.actions.detach-element')}
                                </Menu.Item>
                            </Menu>
                        }
                    >
                        <StandardBtn icon={<IconEllipsisVertical />} />
                    </Dropdown>
                </span>
                <StandardBtn icon={<CloseOutlined />} onClick={closeDetail} />
            </>
        );
    }
    return <></>;
}

export default DetailActions;
