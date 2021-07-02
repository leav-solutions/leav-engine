// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {RightOutlined} from '@ant-design/icons';
import {Badge, Tooltip} from 'antd';
import React from 'react';
import {resetNavigationRecordDetail, setNavigationPath, setNavigationRecordDetail} from 'redux/navigation';
import {useAppDispatch, useAppSelector} from 'redux/store';
import styled, {CSSObject} from 'styled-components';
import {IRecordAndChildren} from '../../graphQL/queries/trees/getTreeContentQuery';
import themingVar from '../../themingVar';
import {INavigationPath, IRecordIdentityWhoAmI, PreviewSize} from '../../_types/types';
import RecordCard from '../shared/RecordCard';

interface ICellProps {
    style?: CSSObject;
    isInPath: boolean;
}

const Cell = styled.div<ICellProps>`
    display: grid;

    place-items: flex-start;
    align-items: center;

    grid-template-columns: auto auto 1rem;
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

    .counter {
        justify-self: flex-end;
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

function CellNavigation({treeElement, depth}: ICellNavigationProps): JSX.Element {
    const {navigation} = useAppSelector(state => ({navigation: state.navigation}));
    const dispatch = useAppDispatch();
    const recordLabel = treeElement.record.whoAmI.label;

    const addPath = () => {
        const newPathElement: INavigationPath = {
            id: treeElement.record.whoAmI.id,
            library: treeElement.record.whoAmI.library.id,
            label: recordLabel
        };

        const newPath = [...navigation.path.slice(0, depth), newPathElement];

        dispatch(setNavigationPath(newPath));

        if (treeElement.children?.length) {
            dispatch(resetNavigationRecordDetail());
        } else {
            dispatch(setNavigationRecordDetail(treeElement.record));
        }
    };

    const record: IRecordIdentityWhoAmI = {
        ...treeElement.record.whoAmI,
        label: recordLabel ?? ''
    };

    const isInPath = navigation.path.some(
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

            {!!treeElement.children?.length && (
                <>
                    <div className="counter">
                        <Badge count={treeElement.children?.length} />
                    </div>
                    <div>
                        <RightOutlined />
                    </div>
                </>
            )}
        </Cell>
    );
}

export default CellNavigation;
