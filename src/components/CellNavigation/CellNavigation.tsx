import {RightOutlined} from '@ant-design/icons';
import {Badge} from 'antd';
import React from 'react';
import styled, {CSSObject} from 'styled-components';
import {useStateNavigation} from '../../Context/StateNavigationContext';
import {IRecordAndChildren} from '../../queries/trees/getTreeContentQuery';
import {resetRecordDetail, setPath, setRecordDetail} from '../../Reducer/NavigationReducer';
import themingVar from '../../themingVar';
import {INavigationPath, PreviewSize, RecordIdentity_whoAmI} from '../../_types/types';
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
    background: ${props => (props.isInPath ? themingVar['@item-active-bg'] : 'none')};

    &:hover {
        background: ${themingVar['@item-hover-bg']};
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
    const {stateNavigation, dispatchNavigation} = useStateNavigation();

    const recordLabel = treeElement.record.whoAmI.label;

    const addPath = () => {
        const newPathElement: INavigationPath = {
            id: treeElement.record.whoAmI.id,
            library: treeElement.record.whoAmI.library.id,
            label: recordLabel
        };

        let newPath = [...stateNavigation.path.splice(0, depth - 1), newPathElement];

        dispatchNavigation(setPath(newPath));

        if (treeElement.children?.length) {
            dispatchNavigation(resetRecordDetail());
        } else {
            dispatchNavigation(setRecordDetail(treeElement.record));
        }
    };

    const record: RecordIdentity_whoAmI = {
        ...treeElement.record.whoAmI,
        label: recordLabel
    };

    const isInPath = stateNavigation.path.some(
        pathPart =>
            pathPart.id === treeElement.record.whoAmI.id && pathPart.library === treeElement.record.whoAmI.library.id
    );

    return (
        <Cell onClick={addPath} isInPath={isInPath}>
            <RecordCardWrapper>
                <RecordCard record={record} size={PreviewSize.small} />
            </RecordCardWrapper>

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
                    <div></div>
                    <div></div>
                </>
            )}
        </Cell>
    );
}

export default CellNavigation;
