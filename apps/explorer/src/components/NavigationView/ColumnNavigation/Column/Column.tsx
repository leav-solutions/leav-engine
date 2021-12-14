// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Spin} from 'antd';
import Cell from 'components/NavigationView/ColumnNavigation/Column/Cell';
import React, {createRef, useEffect, useState} from 'react';
import styled from 'styled-components';
import {RecordIdentity_whoAmI} from '_gqlTypes/RecordIdentity';
import {IRecordAndChildren} from '../../../../graphQL/queries/trees/getTreeContentQuery';
import themingVar from '../../../../themingVar';
import HeaderColumnNavigation from '../HeaderColumnNavigation';

const ColumnWrapper = styled.div`
    border-right: 1px solid ${themingVar['@divider-color']};
    min-width: 20rem;
    height: 100%;
    display: flex;
    flex-flow: column nowrap;

    background: ${themingVar['@default-bg']};
`;

const ColumnContent = styled.div`
    overflow-y: auto;
    height: 100%;
`;

const SpinWrapper = styled.div`
    width: 100%;
    height: 5rem;
    display: grid;
    place-items: center;
`;

interface IColumnProps {
    treeElements: IRecordAndChildren[];
    pathPart: RecordIdentity_whoAmI | null;
    depth: number;
    showLoading: boolean;
    columnActive: boolean;
}

const Column = ({pathPart, treeElements, depth, showLoading, columnActive}: IColumnProps) => {
    const parent = findPathInTree(pathPart, treeElements);

    const [items, setItems] = useState(parent?.children ?? []);

    const ref = createRef<HTMLDivElement>();

    useEffect(() => {
        setItems(parent?.children);
    }, [treeElements, parent, setItems]);

    useEffect(() => {
        if (ref?.current?.scrollIntoView && columnActive) {
            ref.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'end'
            });
        }
    }, [ref, columnActive]);

    if (showLoading) {
        return (
            <ColumnWrapper>
                <HeaderColumnNavigation depth={depth} treeElement={parent} />
                <SpinWrapper>
                    <Spin />
                </SpinWrapper>
            </ColumnWrapper>
        );
    }

    if (parent) {
        if (!parent.children?.length) {
            return <></>;
        }

        return (
            <ColumnWrapper data-testid="navigation-column">
                <HeaderColumnNavigation depth={depth} isActive={columnActive} treeElement={parent} />
                <ColumnContent ref={ref}>
                    {items.map(treeElement => (
                        <Cell
                            key={treeElement.record.whoAmI.id}
                            treeElement={treeElement}
                            depth={depth}
                            isActive={columnActive}
                        />
                    ))}
                </ColumnContent>
            </ColumnWrapper>
        );
    }

    return <></>;
};

const findPathInTree = (
    pathPart: RecordIdentity_whoAmI | null,
    treeElements: IRecordAndChildren[]
): IRecordAndChildren | undefined => {
    if (!pathPart) {
        return {record: null, children: treeElements};
    }

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

export default Column;
