// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {localizedTranslation} from '@leav/utils';
import {Tree} from 'antd';
import {DataNode} from 'antd/lib/tree';
import styled from 'styled-components';
import {themeVars} from '../../../../../antdTheme';
import useLang from '../../../../../hooks/useLang';
import {RecordFormAttributeTreeAttributeFragment} from '../../../../../_gqlTypes';
import {IRecordPropertyTree} from '../../../../../_queries/records/getRecordPropertiesQuery';

interface ITreeValuePathProps {
    attribute: RecordFormAttributeTreeAttributeFragment;
    value: IRecordPropertyTree;
}

const MyTree = styled(Tree)`
    && {
        border: 1px solid ${themeVars.borderColor};
    }
`;

function TreeValuePath({value, attribute}: ITreeValuePathProps): JSX.Element {
    const {lang} = useLang();
    const ancestorsPath = value.treeValue.ancestors ?? [];

    const nodesProps: Partial<DataNode> = {
        checkable: false,
        selectable: false
    };

    const pathToValue = [...ancestorsPath].reverse().reduce((children: DataNode[], node): DataNode[] => {
        return [
            {
                ...nodesProps,
                title: node.record.whoAmI.label,
                key: node.record.id,
                children: children ?? []
            }
        ];
    }, []);

    const treeData = [
        {
            ...nodesProps,
            title: localizedTranslation(attribute.linked_tree.label, lang),
            key: attribute.linked_tree.id,
            children: pathToValue
        }
    ];

    return <MyTree key={value.id_value} showIcon={false} treeData={treeData} defaultExpandAll />;
}

export default TreeValuePath;
