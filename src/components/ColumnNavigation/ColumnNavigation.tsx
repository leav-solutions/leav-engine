import {Spin} from 'antd';
import React, {createRef, useEffect} from 'react';
import styled from 'styled-components';
import {useStateNavigation} from '../../Context/StateNavigationContext';
import {IRecordAndChildren} from '../../queries/trees/getTreeContentQuery';
import themingVar from '../../themingVar';
import CellNavigation from '../CellNavigation';
import HeaderCellNavigation from '../HeaderCellNavigation';

const Column = styled.div`
    border-right: 1px solid ${themingVar['@divider-color']};
    min-width: 15rem;
    display: flex;
    flex-flow: column nowrap;

    background: ${themingVar['@default-bg']};
`;

const SpinWrapper = styled.div`
    width: 100%;
    height: 5rem;
    display: grid;
    place-items: center;
`;

const sortChildren = (a, b) => {
    const fa = a.children ? a.children.length : 0;
    const fb = b.children ? b.children.length : 0;

    if (fa < fb) {
        return 1;
    }
    if (fa > fb) {
        return -1;
    }
    return 0;
};

interface IColumnNavigationProps {
    treeElements: IRecordAndChildren[];
}

function ColumnNavigation({treeElements}: IColumnNavigationProps): JSX.Element {
    const {stateNavigation} = useStateNavigation();

    const elementsSort = [...treeElements].sort(sortChildren);

    return (
        <>
            <Column>
                <HeaderCellNavigation depth={1} />
                {elementsSort.map(treeElement => (
                    <CellNavigation key={treeElement.record.whoAmI.id} treeElement={treeElement} depth={1} />
                ))}
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
        if (!parent.children.length) {
            return <></>;
        }

        const elementsSort = [...parent.children].sort(sortChildren);

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
                <div ref={ref}>
                    {elementsSort?.map((treeElement, index) => (
                        <CellNavigation key={treeElement.record.whoAmI.id} treeElement={treeElement} depth={depth} />
                    ))}
                </div>
            </Column>
        );
    }

    return <></>;
};

const findPathInTree = (
    pathPart: {
        id: string;
        library: string;
    },
    treeElements: IRecordAndChildren[]
): IRecordAndChildren | any => {
    const parent = treeElements.find(treeElement => {
        return treeElement.record.whoAmI.id === pathPart.id;
    });

    if (parent) {
        return parent;
    }

    const childs = treeElements.reduce((acc, treeElement) => {
        if (treeElement.children && treeElement.children.length) {
            return [...acc, treeElement.children];
        }

        return acc;
    }, [] as IRecordAndChildren[][]);

    for (let child of childs) {
        return findPathInTree(pathPart, child);
    }
};

export default ColumnNavigation;
