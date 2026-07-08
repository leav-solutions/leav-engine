import {Space, message} from 'antd';
import {useTranslation} from 'react-i18next';
import {type OnMessagesFunc} from '../../_types';
import {useTreeExplorerState} from '../../store/useTreeExplorerState';
import {useTreeLibraryAllowedAsChild} from '../../hooks/useTreeLibraryAllowedAsChild';
import {DefaultActions} from './DefaultActions';
import {SelectionActions} from './SelectionActions';
import {actionsBar} from './headerColumnNavigationActions.module.css';

interface IHeaderColumnNavigationActionsProps {
    depth: number;
    isDetail?: boolean;
}

export const HeaderColumnNavigationActions = ({depth, isDetail}: IHeaderColumnNavigationActionsProps) => {
    const {t} = useTranslation();
    const {activeTree, path} = useTreeExplorerState();

    const parent = path[depth - 1];
    const {libraries: allowedChildrenLibraries} = useTreeLibraryAllowedAsChild(activeTree.id, parent);
    const allowedLibrariesIds = allowedChildrenLibraries.map(l => l.library.id);

    const _displayMessages: OnMessagesFunc = (tMessageSuccess, tMessageFail, messages) => {
        if (messages.countValid) {
            message.success(t(tMessageSuccess, {nb: messages.countValid}));
        }

        for (const error of Object.keys(messages.errors)) {
            message.warning(
                t(tMessageFail, {
                    elements: messages.errors[error].reduce(
                        (acc, elementLabel) => (acc ? `${acc}, ${elementLabel}` : `${elementLabel}`),
                        '',
                    ),
                    errorMessage: error,
                }),
            );
        }
    };

    return (
        <Space.Compact className={actionsBar}>
            <SelectionActions
                parent={parent}
                allowedChildrenLibraries={allowedLibrariesIds}
                onMessages={_displayMessages}
            />
            <DefaultActions
                parent={parent}
                isDetail={isDetail}
                allowedChildrenLibraries={allowedChildrenLibraries}
                onMessages={_displayMessages}
            />
        </Space.Compact>
    );
};
