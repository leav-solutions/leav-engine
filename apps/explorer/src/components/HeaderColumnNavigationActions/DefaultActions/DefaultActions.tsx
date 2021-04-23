// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {SearchOutlined} from '@ant-design/icons';
import {useMutation, useQuery} from '@apollo/client';
import {Dropdown, Menu} from 'antd';
import {IconEllipsisVertical} from 'assets/icons/IconEllipsisVertical';
import {StandardBtn} from 'components/app/StyledComponent/StandardBtn';
import SearchModal from 'components/SearchModal';
import {useStateNavigation} from 'Context/StateNavigationContext';
import {addTreeElementMutation} from 'graphQL/mutations/trees/addTreeElementMutation';
import {IActiveTree} from 'graphQL/queries/cache/activeTree/getActiveTreeQuery';
import {IRecordAndChildren} from 'graphQL/queries/trees/getTreeContentQuery';
import {getTreeLibraries} from 'graphQL/queries/trees/getTreeLibraries';
import {useLang} from 'hooks/LangHook/LangHook';
import {useNotifications} from 'hooks/NotificationsHook/NotificationsHook';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {setRefetchTreeData} from 'Reducer/NavigationReducerActions';
import {useAppSelector} from 'redux/store';
import {localizedLabel} from 'utils';
import {ADD_TREE_ELEMENT, ADD_TREE_ELEMENTVariables} from '_gqlTypes/ADD_TREE_ELEMENT';
import {GET_TREE_LIBRARIES, GET_TREE_LIBRARIESVariables} from '_gqlTypes/GET_TREE_LIBRARIES';
import {TreeElementInput} from '_gqlTypes/globalTypes';
import {INavigationPath, ISharedStateSelectionSearch, NotificationChannel, NotificationType} from '_types/types';

interface IDefaultActionsProps {
    isDetail: boolean;
    setItems?: React.Dispatch<React.SetStateAction<IRecordAndChildren[]>>;
    parent?: INavigationPath;
    activeTree: IActiveTree;
}

function DefaultActions({activeTree, setItems, isDetail, parent}: IDefaultActionsProps): JSX.Element {
    const {t} = useTranslation();
    const {selectionStat} = useAppSelector(state => ({selectionStat: state.selection}));

    const [{lang}] = useLang();
    const {addNotification} = useNotifications();
    const {dispatchNavigation} = useStateNavigation();

    const [modalVisible, setModalVisible] = useState(false);
    const [libId, setLibId] = useState('');

    const {data: treeLibraries} = useQuery<GET_TREE_LIBRARIES, GET_TREE_LIBRARIESVariables>(getTreeLibraries, {
        variables: {
            treeId: activeTree.id
        }
    });
    const [addToTree] = useMutation<ADD_TREE_ELEMENT, ADD_TREE_ELEMENTVariables>(addTreeElementMutation);

    const showSearch = (selectedLibId: string) => {
        setLibId(selectedLibId);
        setModalVisible(true);
    };

    const sortItems = (sort: 'asc' | 'desc') => {
        if (setItems) {
            setItems(items => {
                const newItems = [...items].sort((a, b) => {
                    if (sort === 'asc') {
                        return parseInt(a.record.whoAmI.id, 10) - parseInt(b.record.whoAmI.id, 10);
                    }
                    return parseInt(b.record.whoAmI.id, 10) - parseInt(a.record.whoAmI.id, 10);
                });

                return newItems;
            });
        }
    };
    const handleSortAsc = () => {
        sortItems('asc');
    };

    const handleSortDesc = () => {
        sortItems('desc');
    };

    const submitAction = async (selection: ISharedStateSelectionSearch) => {
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
                      library: parent.library
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
                addNotification({
                    channel: NotificationChannel.trigger,
                    type: NotificationType.success,
                    content: t('navigation.notifications.success-add', {
                        nb: messages.countValid
                    })
                });
            }

            delete messages.countValid;
            const errors = Object.keys(messages.errors);

            for (const error of errors) {
                addNotification({
                    channel: NotificationChannel.trigger,
                    type: NotificationType.warning,
                    content: t('navigation.notifications.error-add', {
                        elements: (messages.errors[error] as string[]).reduce(
                            (acc, elementLabel) => (acc ? `${acc}, ${elementLabel}` : `${elementLabel}`),
                            ''
                        ),
                        errorMessage: error
                    })
                });
            }

            dispatchNavigation(setRefetchTreeData(true));
        }
    };

    if (!isDetail) {
        return (
            <>
                <SearchModal
                    visible={modalVisible}
                    setVisible={setModalVisible}
                    submitAction={submitAction}
                    libId={libId}
                />
                {!selectionStat.selection.selected.length && (
                    <>
                        <Dropdown
                            overlay={
                                <Menu>
                                    {treeLibraries?.trees.list[0].libraries.map(library => (
                                        <Menu.Item
                                            key={library.library.id}
                                            onClick={() => showSearch(library.library.id)}
                                        >
                                            {localizedLabel(library.library.label, lang)}
                                        </Menu.Item>
                                    ))}
                                </Menu>
                            }
                        >
                            <StandardBtn icon={<SearchOutlined />} />
                        </Dropdown>

                        <span data-testid="dropdown-tree-actions">
                            <Dropdown
                                placement="bottomRight"
                                overlay={
                                    <Menu>
                                        <Menu>
                                            <Menu.Item onClick={handleSortAsc}>
                                                {t('navigation.actions.sort-asc')}
                                            </Menu.Item>
                                            <Menu.Item onClick={handleSortDesc}>
                                                {t('navigation.actions.sort-desc')}
                                            </Menu.Item>
                                        </Menu>
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
    return <></>;
}

export default DefaultActions;
