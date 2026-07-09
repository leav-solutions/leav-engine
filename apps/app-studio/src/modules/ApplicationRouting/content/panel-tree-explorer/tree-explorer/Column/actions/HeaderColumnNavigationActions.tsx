import {Space} from 'antd';
import {KitAlert} from 'aristid-ds';
import {useTranslation} from 'react-i18next';
import {INFO_NOTIFICATION_DURATION, SUCCESS_NOTIFICATION_DURATION} from '_ui/constants';
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
            KitAlert.success({
                message: t(tMessageSuccess, {nb: messages.countValid}),
                duration: SUCCESS_NOTIFICATION_DURATION,
                showIcon: true,
            });
        }

        for (const error of Object.keys(messages.errors)) {
            KitAlert.warning({
                message: t(tMessageFail, {
                    elements: messages.errors[error].reduce(
                        (acc, elementLabel) => (acc ? `${acc}, ${elementLabel}` : `${elementLabel}`),
                        '',
                    ),
                    errorMessage: error,
                }),
                duration: INFO_NOTIFICATION_DURATION,
                showIcon: true,
            });
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
