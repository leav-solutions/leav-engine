import {RightOutlined} from '@ant-design/icons';
import React from 'react';
import styled from 'styled-components';
import {useStateNavigation} from '../../Context/StateNavigationContext';
import {IRecordAndChildren} from '../../queries/trees/getTreeContentQuery';
import {setPath} from '../../Reducer/NavigationReducer';

const Cell = styled.div`
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 1rem;

    &:hover {
        background: #ccc;
    }
`;

interface ICellNavigationProps {
    treeElement: IRecordAndChildren;
    depth: number;
}

function CellNavigation({treeElement, depth}: ICellNavigationProps): JSX.Element {
    const {stateNavigation, dispatchNavigation} = useStateNavigation();

    const addPath = () => {
        const newPathElement = {
            id: treeElement.record.whoAmI.id,
            library: treeElement.record.whoAmI.library.id
        };

        let newPath = [...stateNavigation.path.splice(0, depth - 1), newPathElement];

        dispatchNavigation(setPath(newPath));
    };

    return (
        <Cell onClick={addPath}>
            <div>{treeElement.record.whoAmI.id}</div>
            <div>{treeElement.children?.length}</div>
            <div>
                <RightOutlined />
            </div>
        </Cell>
    );
}

export default CellNavigation;
