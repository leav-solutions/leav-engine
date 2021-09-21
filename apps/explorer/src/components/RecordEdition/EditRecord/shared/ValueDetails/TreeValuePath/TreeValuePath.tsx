// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Tree} from 'antd';
import {DataNode} from 'antd/lib/tree';
import {IRecordPropertyTree, ITreeValueRecord} from 'graphQL/queries/records/getRecordPropertiesQuery';
import {useLang} from 'hooks/LangHook/LangHook';
import React from 'react';
import styled from 'styled-components';
import {localizedTranslation} from 'utils';
import {GET_FORM_forms_list_elements_elements_attribute_TreeAttribute} from '_gqlTypes/GET_FORM';

interface ITreeValuePathProps {
    attribute: GET_FORM_forms_list_elements_elements_attribute_TreeAttribute;
    value: IRecordPropertyTree;
}

const MyTree = styled(Tree)`
    && {
        background: none;
    }
`;

function TreeValuePath({value, attribute}: ITreeValuePathProps): JSX.Element {
    const [{lang}] = useLang();
    const ancestorsPath = value.treeValue.ancestors[0] ?? [];

    const nodesProps: Partial<DataNode> = {
        checkable: false,
        selectable: false
    };

    const pathToValue = [...ancestorsPath]
        .reverse()
        .reduce((children: DataNode[], node: {record: ITreeValueRecord}): DataNode[] => {
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
