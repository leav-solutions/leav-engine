// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    DeleteOutlined,
    ExpandAltOutlined,
    InfoCircleOutlined,
    OrderedListOutlined,
    PlusCircleOutlined,
    PlusOutlined,
    SearchOutlined
} from '@ant-design/icons';
import {useMutation, useQuery} from '@apollo/client';
import {Dropdown, Menu, message} from 'antd';
import {IconEllipsisVertical} from 'assets/icons/IconEllipsisVertical';
import {StandardBtn} from 'components/app/StyledComponent/StandardBtn';
import EditRecordModal from 'components/RecordEdition/EditRecordModal';
import SearchModal from 'components/SearchModal';
import {addTreeElementMutation} from 'graphQL/mutations/trees/addTreeElementMutation';
import {removeTreeElementMutation} from 'graphQL/mutations/trees/removeTreeElementMutation';
import {IActiveTree} from 'graphQL/queries/cache/activeTree/getActiveTreeQuery';
import {getTreeLibraries} from 'graphQL/queries/trees/getTreeLibraries';
import {useLang} from 'hooks/LangHook/LangHook';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {resetNavigationRecordDetail, setNavigationRecordDetail, setNavigationRefetchTreeData} from 'redux/navigation';
import {addNotification} from 'redux/notifications';
import {useAppDispatch, useAppSelector} from 'redux/store';
import {localizedTranslation} from 'utils';
import {ADD_TREE_ELEMENT, ADD_TREE_ELEMENTVariables} from '_gqlTypes/ADD_TREE_ELEMENT';
import {GET_TREE_LIBRARIES, GET_TREE_LIBRARIESVariables} from '_gqlTypes/GET_TREE_LIBRARIES';
import {TreeElementInput} from '_gqlTypes/globalTypes';
import {RecordIdentity_whoAmI} from '_gqlTypes/RecordIdentity';
import {REMOVE_TREE_ELEMENT, REMOVE_TREE_ELEMENTVariables} from '_gqlTypes/REMOVE_TREE_ELEMENT';
import {INotification, ISharedStateSelectionSearch, NotificationChannel, NotificationType} from '_types/types';

interface IDefaultActionsProps {
    isDetail: boolean;
    parent?: RecordIdentity_whoAmI;
    activeTree: IActiveTree;
}

function DefaultActions({activeTree, isDetail, parent}: IDefaultActionsProps): JSX.Element {
    const {t} = useTranslation();
    const {selectionState: selectionStat} = useAppSelector(state => ({selectionState: state.selection}));
    const dispatch = useAppDispatch();

    const [{lang}] = useLang();

    const [searchModalVisible, setSearchModalVisible] = useState(false);
    const [editRecordModalVisible, setEditRecordModalVisible] = useState(false);
    const [createRecordLibrary, setCreateRecordLibrary] = useState('');
    const [createRecordModalVisible, setCreateRecordModalVisible] = useState(false);
    const [libId, setLibId] = useState('');

    const {data: treeLibraries} = useQuery<GET_TREE_LIBRARIES, GET_TREE_LIBRARIESVariables>(getTreeLibraries, {
        variables: {
            treeId: activeTree.id
        }
    });
    const [addToTree] = useMutation<ADD_TREE_ELEMENT, ADD_TREE_ELEMENTVariables>(addTreeElementMutation);
    const [removeFromTree] = useMutation<REMOVE_TREE_ELEMENT, REMOVE_TREE_ELEMENTVariables>(removeTreeElementMutation);

    const showSearch = (selectedLibId: string) => {
        setLibId(selectedLibId);
        setSearchModalVisible(true);
    };

    const _handleSubmitAddBySearch = async (selection: ISharedStateSelectionSearch) => {
        if (selection.selected.length) {
            let messages: {
                countValid: number;
                errors: {[x: string]: string[]};
            } = {
                countValid: 0,
                errors: {}
            };

            const parentElement = parent?.id
                ? {
                      id: parent.id,
                      library: parent.library.id
                  }
                : null;

            for (const elementSelected of selection.selected) {
                const treeElement: TreeElementInput = {
                    id: elementSelected.id,
                    library: elementSelected.library
                };
                try {
                    await addToTree({
                        variables: {
                            treeId: activeTree.id,
                            element: treeElement,
                            parent: parentElement
                        }
                    });
                    messages = {...messages, countValid: messages.countValid + 1};
                } catch (e) {
                    if (e.graphQLErrors && e.graphQLErrors.length) {
                        const errorMessageParent = e.graphQLErrors[0].extensions.fields?.parent;
                        const errorMessageElement = e.graphQLErrors[0].extensions.fields?.element;

                        if (errorMessageParent) {
                            messages.errors[errorMessageParent] = [
                                ...(messages.errors[errorMessageParent] ?? []),
                                elementSelected.id
                            ];
                        }
                        if (errorMessageElement) {
                            messages.errors[errorMessageElement] = [
                                ...(messages.errors[errorMessageElement] ?? []),
                                elementSelected.label || elementSelected.id
                            ];
                        }
                    }
                }
            }

            if (messages.countValid) {
                const notification: INotification = {
                    channel: NotificationChannel.trigger,
                    type: NotificationType.success,
                    content: t('navigation.notifications.success-add', {
                        nb: messages.countValid
                    })
                };
                dispatch(addNotification(notification));
            }

            delete messages.countValid;
            const errors = Object.keys(messages.errors);

            for (const error of errors) {
                const notification = {
                    channel: NotificationChannel.trigger,
                    type: NotificationType.warning,
                    content: t('navigation.notifications.error-add', {
                        elements: (messages.errors[error] as string[]).reduce(
                            (acc, elementLabel) => (acc ? `${acc}, ${elementLabel}` : `${elementLabel}`),
                            ''
                        ),
                        errorMessage: error
                    })
                };
                dispatch(addNotification(notification));
            }

            dispatch(setNavigationRefetchTreeData(true));
            dispatch(resetNavigationRecordDetail());
        }
    };

    const _handleClickDetails = () => {
        dispatch(setNavigationRecordDetail({id: parent.id, whoAmI: parent}));
    };

    const _handleAfterCreateRecord = async (newRecord: RecordIdentity_whoAmI) => {
        let notification: INotification;
        try {
            await addToTree({
                variables: {
                    treeId: activeTree.id,
                    element: {
                        id: newRecord.id,
                        library: newRecord.library.id
                    },
                    parent: parent
                        ? {
                              id: parent.id,
                              library: parent.library.id
                          }
                        : null
                }
            });

            notification = {
                channel: NotificationChannel.trigger,
                type: NotificationType.success,
                content: t('navigation.notifications.success-add', {nb: 1})
            };
            dispatch(setNavigationRefetchTreeData(true));
            dispatch(resetNavigationRecordDetail());
        } catch (err) {
            if (err.graphQLErrors && err.graphQLErrors.length) {
                const errorMessageParent = err.graphQLErrors[0].extensions.fields?.parent;
                const errorMessageElement = err.graphQLErrors[0].extensions.fields?.element;

                notification = {
                    channel: NotificationChannel.trigger,
                    type: NotificationType.error,
                    content: t('navigation.notifications.error-add', {
                        elements: newRecord.label ?? newRecord.id,
                        errorMessage: errorMessageParent || errorMessageElement || ''
                    })
                };
            } else {
                notification = {
                    channel: NotificationChannel.trigger,
                    type: NotificationType.error,
                    content: err.message
                };
            }
        }
        dispatch(addNotification(notification));
    };

    const _handleOpenEditRecordModal = () => setEditRecordModalVisible(true);
    const _handleCloseEditRecordModal = () => setEditRecordModalVisible(false);

    const _handleOpenCreateRecordModal = (library: string) => () => {
        setCreateRecordModalVisible(true);
        setCreateRecordLibrary(library);
    };
    const _handleCloseCreateRecordModal = () => setCreateRecordModalVisible(false);

    const _handleClickDetach = async () => {
        const element = {
            id: parent.id,
            library: parent.library.id
        };

        const label = parent.label;

        let notification: INotification;
        try {
            await removeFromTree({
                variables: {
                    treeId: activeTree.id,
                    element
                }
            });

            notification = {
                channel: NotificationChannel.trigger,
                type: NotificationType.success,
                content: t('navigation.notifications.success-detach', {nb: 1})
            };
        } catch (e) {
            notification = {
                channel: NotificationChannel.trigger,
                type: NotificationType.error,
                content: t('navigation.notifications.error-detach', {
                    elementName: label ?? element.id,
                    errorMessage: e.message
                })
            };
        }

        dispatch(addNotification(notification));
        dispatch(resetNavigationRecordDetail());
        dispatch(setNavigationRefetchTreeData(true));
    };

    const _handleClickClassifiedIn = () => message.warn(t('global.feature_not_available'));
    const _handleClickOrder = () => message.warn(t('global.feature_not_available'));

    const availableLibraries = treeLibraries?.trees.list[0].libraries ?? [];
    return (
        <>
            {searchModalVisible && (
                <SearchModal
                    visible={searchModalVisible}
                    setVisible={setSearchModalVisible}
                    submitAction={_handleSubmitAddBySearch}
                    libId={libId}
                />
            )}
            {editRecordModalVisible && (
                <EditRecordModal
                    open={editRecordModalVisible}
                    library={parent.library.id}
                    record={parent}
                    onClose={_handleCloseEditRecordModal}
                />
            )}
            {createRecordModalVisible && (
                <EditRecordModal
                    open={createRecordModalVisible}
                    library={createRecordLibrary}
                    record={null}
                    onClose={_handleCloseCreateRecordModal}
                    afterCreate={_handleAfterCreateRecord}
                />
            )}
            {!selectionStat.selection.selected.length && (
                <>
                    {availableLibraries.length > 1 ? (
                        <>
                            <Dropdown
                                overlay={
                                    <Menu>
                                        {treeLibraries?.trees.list[0].libraries.map(library => (
                                            <Menu.Item
                                                key={library.library.id}
                                                onClick={() => showSearch(library.library.id)}
                                            >
                                                {localizedTranslation(library.library.label, lang)}
                                            </Menu.Item>
                                        ))}
                                    </Menu>
                                }
                            >
                                <StandardBtn icon={<PlusCircleOutlined />} />
                            </Dropdown>
                            <Dropdown
                                overlay={
                                    <Menu>
                                        {treeLibraries?.trees.list[0].libraries.map(library => (
                                            <Menu.Item
                                                key={library.library.id}
                                                onClick={_handleOpenCreateRecordModal(library.library.id)}
                                            >
                                                {localizedTranslation(library.library.label, lang)}
                                            </Menu.Item>
                                        ))}
                                    </Menu>
                                }
                            >
                                <StandardBtn icon={<PlusOutlined />} />
                            </Dropdown>
                        </>
                    ) : (
                        <>
                            <StandardBtn
                                icon={<PlusCircleOutlined />}
                                aria-label="add-by-search"
                                onClick={() => showSearch(availableLibraries[0]?.library.id ?? null)}
                            />
                            <StandardBtn
                                icon={<PlusOutlined />}
                                aria-label="add-by-creation"
                                onClick={_handleOpenCreateRecordModal(availableLibraries[0]?.library.id ?? null)}
                            />
                        </>
                    )}

                    <span data-testid="dropdown-tree-actions">
                        <Dropdown
                            placement="bottomRight"
                            overlay={
                                <Menu>
                                    {!!parent && (
                                        <>
                                            {!isDetail && (
                                                <Menu.Item icon={<InfoCircleOutlined />} onClick={_handleClickDetails}>
                                                    {t('navigation.actions.details')}
                                                </Menu.Item>
                                            )}
                                            <Menu.Item
                                                icon={<ExpandAltOutlined />}
                                                onClick={_handleOpenEditRecordModal}
                                            >
                                                {t('navigation.actions.edit')}
                                            </Menu.Item>
                                        </>
                                    )}
                                    <Menu.Item icon={<SearchOutlined />} onClick={_handleClickClassifiedIn}>
                                        {t('navigation.actions.classified_in')}
                                    </Menu.Item>
                                    <Menu.Divider />
                                    <Menu.Item icon={<OrderedListOutlined />} onClick={_handleClickOrder}>
                                        {t('navigation.actions.order')}
                                    </Menu.Item>
                                    {!!parent && (
                                        <Menu.Item icon={<DeleteOutlined />} onClick={_handleClickDetach}>
                                            {t('navigation.actions.detach')}
                                        </Menu.Item>
                                    )}
                                </Menu>
                            }
                        >
                            <StandardBtn icon={<IconEllipsisVertical />} />
                        </Dropdown>
                    </span>
                </>
            )}
        </>
    );
}

export default DefaultActions;
