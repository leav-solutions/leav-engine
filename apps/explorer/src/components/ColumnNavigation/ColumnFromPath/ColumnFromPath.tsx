// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Spin} from 'antd';
import ActiveCellNavigation from 'components/ActiveCellNavigation';
import React, {createRef, useEffect, useState} from 'react';
import {useAppSelector} from 'redux/store';
import styled from 'styled-components';
import {IRecordAndChildren} from '../../../graphQL/queries/trees/getTreeContentQuery';
import themingVar from '../../../themingVar';
import {INavigationPath} from '../../../_types/types';
import CellNavigation from '../../CellNavigation';
import HeaderColumnNavigation from '../../HeaderColumnNavigation';

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
    columnActive: boolean;
}

const ColumnFromPath = ({pathPart, treeElements, depth, showLoading, columnActive}: IColumnFromPathProps) => {
    const navigation = useAppSelector(state => state.navigation);

    const parent = findPathInTree(pathPart, treeElements);

    const [items, setItems] = useState(parent?.children ?? []);

    const ref = createRef<HTMLDivElement>();

    useEffect(() => {
        setItems(parent?.children);
    }, [treeElements, parent, setItems]);

    useEffect(() => {
        if (ref.current && ref.current.scrollIntoView) {
            ref.current?.scrollIntoView({
                behavior: 'smooth'
            });
        }
    }, [ref, navigation.recordDetail]);

    if (showLoading) {
        return (
            <Column>
                <HeaderColumnNavigation depth={depth} />
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
                <HeaderColumnNavigation depth={depth} setItems={setItems} isActive={columnActive} />
                <ColumnContent ref={ref}>
                    {items.map(treeElement =>
                        columnActive ? (
                            <ActiveCellNavigation
                                key={treeElement.record.whoAmI.id}
                                treeElement={treeElement}
                                depth={depth}
                            />
                        ) : (
                            <CellNavigation
                                key={treeElement.record.whoAmI.id}
                                treeElement={treeElement}
                                depth={depth}
                            />
                        )
                    )}
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
        for (const child of children) {
            const childParent = findPathInTree(pathPart, child);
            if (childParent) {
                return childParent;
            }
        }
    }

    return;
};

export default ColumnFromPath;
