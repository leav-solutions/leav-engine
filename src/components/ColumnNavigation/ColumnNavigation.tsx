import {Spin} from 'antd';
import React, {createRef, useEffect} from 'react';
import styled from 'styled-components';
import {useStateNavigation} from '../../Context/StateNavigationContext';
import {IRecordAndChildren} from '../../queries/trees/getTreeContentQuery';
import themingVar from '../../themingVar';
import {INavigationPath} from '../../_types/types';
import CellNavigation from '../CellNavigation';
import HeaderCellNavigation from '../HeaderCellNavigation';

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

interface IColumnNavigationProps {
    treeElements: IRecordAndChildren[];
}

function ColumnNavigation({treeElements}: IColumnNavigationProps): JSX.Element {
    const {stateNavigation} = useStateNavigation();

    return (
        <>
            <Column>
                <HeaderCellNavigation depth={1} />
                <ColumnContent>
                    {treeElements.map(treeElement => (
                        <CellNavigation key={treeElement.record.whoAmI.id} treeElement={treeElement} depth={1} />
                    ))}
                </ColumnContent>
            </Column>

            {stateNavigation.path.map(
                (pathPart, index) =>
                    treeElements.length && (
                        <ColumnFromPath
                            key={pathPart.id}
                            pathPart={pathPart}
                            treeElements={treeElements}
                            depth={index + 2}
                            showLoading={stateNavigation.isLoading && index === stateNavigation.path.length - 1}
                        />
                    )
            )}
        </>
    );
}

interface IColumnFromPathProps {
    treeElements: IRecordAndChildren[];
    pathPart: {
        id: string;
        library: string;
    };
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

    if (parent) {
        if (!parent.children?.length) {
            return <></>;
        }

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

export default ColumnNavigation;
