import {RightOutlined} from '@ant-design/icons';
import {useQuery} from '@apollo/client';
import {Badge} from 'antd';
import React from 'react';
import styled from 'styled-components';
import {useStateNavigation} from '../../Context/StateNavigationContext';
import {getLang} from '../../queries/cache/lang/getLangQuery';
import {IRecordAndChildren} from '../../queries/trees/getTreeContentQuery';
import {setPath, setRecordDetail} from '../../Reducer/NavigationReducer';
import {localizedLabel} from '../../utils';
import {INavigationPath, PreviewSize, RecordIdentity_whoAmI} from '../../_types/types';
import RecordCard from '../shared/RecordCard';

const Cell = styled.div`
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 1rem;

    &:hover {
        background: #ccc;
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

    const addPath = () => {
        if (treeElement.children?.length) {
            const newPathElement: INavigationPath = {
                id: treeElement.record.whoAmI.id,
                library: treeElement.record.whoAmI.library.id
            };

            let newPath = [...stateNavigation.path.splice(0, depth - 1), newPathElement];

            dispatchNavigation(setPath(newPath));
        } else {
            dispatchNavigation(setRecordDetail(treeElement.record));
        }
    };

    const {data: dataLang} = useQuery(getLang);
    // handle case dataLang is null
    const {lang} = dataLang ?? {lang: []};

    const record: RecordIdentity_whoAmI = {
        ...treeElement.record.whoAmI,
        label: localizedLabel(treeElement.record.whoAmI.label, lang)
    };

    return (
        <Cell onClick={addPath}>
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
