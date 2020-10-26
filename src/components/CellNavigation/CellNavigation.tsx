import {RightOutlined} from '@ant-design/icons';
import {useQuery} from '@apollo/client';
import {Badge} from 'antd';
import React from 'react';
import styled, {CSSObject} from 'styled-components';
import {useStateNavigation} from '../../Context/StateNavigationContext';
import {getLang} from '../../queries/cache/lang/getLangQuery';
import {IRecordAndChildren} from '../../queries/trees/getTreeContentQuery';
import {resetRecordDetail, setPath, setRecordDetail} from '../../Reducer/NavigationReducer';
import themingVar from '../../themingVar';
import {localizedLabel} from '../../utils';
import {INavigationPath, PreviewSize, RecordIdentity_whoAmI} from '../../_types/types';
import RecordCard from '../shared/RecordCard';

interface ICellProps {
    style?: CSSObject;
    isInPath: boolean;
}

const Cell = styled.div<ICellProps>`
    display: flex;
    justify-content: space-around;
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

    const addPath = () => {
        const newPathElement: INavigationPath = {
            id: treeElement.record.whoAmI.id,
            library: treeElement.record.whoAmI.library.id
        };

        let newPath = [...stateNavigation.path.splice(0, depth - 1), newPathElement];

        dispatchNavigation(setPath(newPath));

        if (treeElement.children?.length) {
            dispatchNavigation(resetRecordDetail());
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
