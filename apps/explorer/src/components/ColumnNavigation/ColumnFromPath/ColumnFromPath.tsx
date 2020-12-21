// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Spin} from 'antd';
import React, {createRef, useEffect} from 'react';
import styled from 'styled-components';
import {useStateNavigation} from '../../../Context/StateNavigationContext';
import {IRecordAndChildren} from '../../../queries/trees/getTreeContentQuery';
import themingVar from '../../../themingVar';
import {INavigationPath} from '../../../_types/types';
import CellNavigation from '../../CellNavigation';
import HeaderCellNavigation from '../../HeaderCellNavigation';

const Column = styled.div`
    border-right: 1px solid ${themingVar['@divider-color']};
    min-width: 20rem;
    height: 100%;
    display: flex;
    flex-flow: column nowrap;

    background: ${themingVar['@default-bg']};
`;

const ColumnContent = styled.div`
    overflow-y: scroll;
    height: 100%;
`;

const SpinWrapper = styled.div`
    width: 100%;
    height: 5rem;
    display: grid;
    place-items: center;
`;

interface IColumnFromPathProps {
    treeElements: IRecordAndChildren[];
    pathPart: INavigationPath;
    depth: number;
    showLoading: boolean;
}

const ColumnFromPath = ({pathPart, treeElements, depth, showLoading}: IColumnFromPathProps) => {
    const parent = findPathInTree(pathPart, treeElements);

    const ref = createRef<HTMLDivElement>();
    const {stateNavigation} = useStateNavigation();

    useEffect(() => {
        if (ref.current && ref.current.scrollIntoView) {
            ref.current?.scrollIntoView({
                behavior: 'smooth'
            });
        }
    }, [ref, stateNavigation.recordDetail]);

    if (showLoading) {
        return (
            <Column>
                <HeaderCellNavigation depth={depth} />
                <SpinWrapper>
                    <Spin />
                </SpinWrapper>
            </Column>
        );
    }

    if (parent) {
        if (!parent.children?.length) {
            return <></>;
        }

        return (
            <Column>
                <HeaderCellNavigation depth={depth} />
                <ColumnContent ref={ref}>
                    {parent.children.map((treeElement, index) => (
                        <CellNavigation key={treeElement.record.whoAmI.id} treeElement={treeElement} depth={depth} />
                    ))}
                </ColumnContent>
            </Column>
        );
    }

    return <></>;
};

const findPathInTree = (
    pathPart: INavigationPath,
    treeElements: IRecordAndChildren[]
): IRecordAndChildren | undefined => {
    const parent = treeElements.find(treeElement => {
        return treeElement.record.whoAmI.id.toString() === pathPart.id.toString();
    });

    if (parent) {
        return parent;
    }

    const children = treeElements.reduce((acc, treeElement) => {
        if (treeElement.children && treeElement.children.length) {
            return [...acc, treeElement.children];
        }

        return acc;
    }, [] as IRecordAndChildren[][]);

    if (children.length) {
        for (let child of children) {
            const parent = findPathInTree(pathPart, child);
            if (parent) {
                return parent;
            }
        }
    }

    return;
};

export default ColumnFromPath;
