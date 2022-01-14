// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React, {useEffect, useState} from 'react';
import {useAppSelector} from 'redux/store';
import {ITreeContentRecordAndChildren} from '../../../graphQL/queries/trees/getTreeContentQuery';
import Column from './Column';

interface IColumnNavigationProps {
    treeElements: ITreeContentRecordAndChildren;
}

function ColumnNavigation({treeElements}: IColumnNavigationProps): JSX.Element {
    const navigation = useAppSelector(state => state.navigation);

    const [items, setItems] = useState<ITreeContentRecordAndChildren[]>(treeElements.children);

    useEffect(() => {
        setItems(treeElements.children);
    }, [setItems, treeElements]);

    const currentColumnActive = !navigation.recordDetail && navigation.path.length === 0;

    return (
        <>
            <Column
                pathPart={null}
                treeElements={items}
                depth={0}
                showLoading={false}
                columnActive={currentColumnActive}
            />
            {navigation.path.map(
                (pathPart, index) =>
                    treeElements.children.length && (
                        <Column
                            key={pathPart.record.id}
                            pathPart={pathPart}
                            treeElements={treeElements.children}
                            depth={index + 1}
                            showLoading={navigation.isLoading && index === navigation.path.length - 1}
                            columnActive={!navigation.recordDetail && index === navigation.path.length - 1}
                        />
                    )
            )}
        </>
    );
}

export default ColumnNavigation;
