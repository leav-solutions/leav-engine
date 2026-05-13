import {useMemo, type ReactNode} from 'react';
import {useGetThreadStatusOptionsQuery} from '../../../__generated__';
import {faCheck, faSpinner} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {DONE_STATUS, WIP_STATUS} from '../threadConstants';

export interface IStatusOption {
    value: string;
    label: string;
    icon: ReactNode;
}

const icons = {
    [WIP_STATUS]: <FontAwesomeIcon icon={faSpinner} />,
    [DONE_STATUS]: <FontAwesomeIcon icon={faCheck} />,
};

export const useThreadStatusOptions = (): IStatusOption[] => {
    const {data} = useGetThreadStatusOptionsQuery();

    return useMemo(
        () =>
            data?.treeNodeChildren.list.map(node => {
                const label = node.record.label[0]?.payload as keyof typeof icons;
                return {
                    value: node.id,
                    label,
                    icon: icons[label],
                };
            }) ?? [],
        [data?.treeNodeChildren.list],
    );
};
