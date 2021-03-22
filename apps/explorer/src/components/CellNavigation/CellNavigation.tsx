// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {RightOutlined} from '@ant-design/icons';
import {Badge, Tooltip} from 'antd';
import React from 'react';
import styled, {CSSObject} from 'styled-components';
import {useStateNavigation} from '../../Context/StateNavigationContext';
import {IRecordAndChildren} from '../../graphQL/queries/trees/getTreeContentQuery';
import {resetRecordDetail, setPath, setRecordDetail} from '../../Reducer/NavigationReducerActions';
import themingVar from '../../themingVar';
import {INavigationPath, IRecordIdentityWhoAmI, PreviewSize} from '../../_types/types';
import RecordCard from '../shared/RecordCard';

interface ICellProps {
    style?: CSSObject;
    isInPath: boolean;
}

const Cell = styled.div<ICellProps>`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: ${props => {
        if (props.isInPath) {
            return themingVar['@item-active-bg'];
        }
        return 'none';
    }};

    &:hover {
        background: ${themingVar['@item-hover-bg']};

        .checkbox-wrapper {
            opacity: 1;
        }
    }
`;

const RecordCardWrapper = styled.div`
    & > * > * {
        justify-content: space-around;
    }
`;

interface ICellNavigationProps {
    treeElement: IRecordAndChildren;
    depth: number;
}

const labelLimit = 13;

function CellNavigation({treeElement, depth}: ICellNavigationProps): JSX.Element {
    const {stateNavigation, dispatchNavigation} = useStateNavigation();

    const recordLabel =
        treeElement.record.whoAmI.label && treeElement.record.whoAmI.label.length > labelLimit
            ? treeElement.record.whoAmI.label.substr(0, labelLimit) + '...'
            : treeElement.record.whoAmI.label;

    const addPath = () => {
        const newPathElement: INavigationPath = {
            id: treeElement.record.whoAmI.id,
            library: treeElement.record.whoAmI.library.id,
            label: recordLabel
        };

        const newPath = [...stateNavigation.path.splice(0, depth), newPathElement];

        dispatchNavigation(setPath(newPath));

        if (treeElement.children?.length) {
            dispatchNavigation(resetRecordDetail());
        } else {
            dispatchNavigation(setRecordDetail(treeElement.record));
        }
    };

    const record: IRecordIdentityWhoAmI = {
        ...treeElement.record.whoAmI,
        label: recordLabel ?? ''
    };

    const isInPath = stateNavigation.path.some(
        pathPart =>
            pathPart.id === treeElement.record.whoAmI.id && pathPart.library === treeElement.record.whoAmI.library.id
    );

    return (
        <Cell onClick={addPath} isInPath={isInPath}>
            <Tooltip title={treeElement.record.whoAmI.label}>
                <RecordCardWrapper>
                    <RecordCard record={record} size={PreviewSize.small} />
                </RecordCardWrapper>
            </Tooltip>

            {treeElement.children?.length ? (
                <>
                    <div>
                        <Badge count={treeElement.children?.length} />
                    </div>
                    <div>
                        <RightOutlined />
                    </div>
                </>
            ) : (
                <>
                    <div />
                    <div />
                </>
            )}
        </Cell>
    );
}

export default CellNavigation;
