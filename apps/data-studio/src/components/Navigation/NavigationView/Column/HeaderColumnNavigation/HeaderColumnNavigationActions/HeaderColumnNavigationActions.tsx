// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Button} from 'antd';
import {useActiveTree} from 'hooks/useActiveTree';
import {useTreeLibraryAllowedAsChild} from 'hooks/useTreeLibraryAllowedAsChild';
import {useTranslation} from 'react-i18next';
import {addInfo} from 'reduxStore/infos';
import {useAppDispatch, useAppSelector} from 'reduxStore/store';
import {IInfo, InfoChannel, InfoType} from '_types/types';
import DefaultActions from './DefaultActions';
import SelectionActions from './SelectionActions';
import {OnMessagesFunc} from './_types';

interface IActiveHeaderCellNavigationProps {
    depth: number;
    isDetail?: boolean;
}

function HeaderColumnNavigationActions({depth, isDetail}: IActiveHeaderCellNavigationProps): JSX.Element {
    const {t} = useTranslation();
    const navigation = useAppSelector(state => state.navigation);
    const dispatch = useAppDispatch();
    const [activeTree] = useActiveTree();

    const currentPositionInPath = depth;
    const parent = navigation.path[currentPositionInPath - 1];
    const {libraries: allowedChildrenLibraries} = useTreeLibraryAllowedAsChild(activeTree?.id, parent);
    const allowedLibrariesIds = allowedChildrenLibraries.map(l => l.library.id);

    const _displayMessages: OnMessagesFunc = (tMessageSuccess, tMessageFail, messages) => {
        if (messages.countValid) {
            const info: IInfo = {
                channel: InfoChannel.trigger,
                type: InfoType.success,
                content: t(tMessageSuccess, {
                    nb: messages.countValid
                })
            };

            dispatch(addInfo(info));
        }

        delete messages.countValid;
        const errors = Object.keys(messages.errors);

        for (const error of errors) {
            const info: IInfo = {
                channel: InfoChannel.trigger,
                type: InfoType.warning,
                content: t(tMessageFail, {
                    elements: (messages.errors[error] as string[]).reduce(
                        (acc, elementLabel) => (acc ? `${acc}, ${elementLabel}` : `${elementLabel}`),
                        ''
                    ),
                    errorMessage: error
                })
            };

            dispatch(addInfo(info));
        }
    };

    if (!activeTree) {
        return null;
    }

    return (
        <Button.Group style={{height: '30px'}}>
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
        </Button.Group>
    );
}

export default HeaderColumnNavigationActions;
