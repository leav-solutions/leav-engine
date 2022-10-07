// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Tree} from 'antd';
import {DataNode} from 'antd/lib/tree';
import {IRecordPropertyTree} from 'graphQL/queries/records/getRecordPropertiesQuery';
import {useLang} from 'hooks/LangHook/LangHook';
import styled from 'styled-components';
import themingVar from 'themingVar';
import {localizedTranslation} from 'utils';
import {RECORD_FORM_recordForm_elements_attribute_TreeAttribute} from '_gqlTypes/RECORD_FORM';

interface ITreeValuePathProps {
    attribute: RECORD_FORM_recordForm_elements_attribute_TreeAttribute;
    value: IRecordPropertyTree;
}

const MyTree = styled(Tree)`
    && {
        border: 1px solid ${themingVar['@border-color-base']};
    }
`;

function TreeValuePath({value, attribute}: ITreeValuePathProps): JSX.Element {
    const [{lang}] = useLang();
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
