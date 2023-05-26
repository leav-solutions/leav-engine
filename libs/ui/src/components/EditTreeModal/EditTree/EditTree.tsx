// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Tabs, TabsProps} from 'antd';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {TreeDetailsFragment, useGetTreeByIdQuery} from '../../../_gqlTypes';
import {ErrorDisplay} from '../../ErrorDisplay';
import {Loading} from '../../Loading';
import {EditTreeInfo} from './EditTreeInfo';

interface IEditTreeProps {
    treeId?: string;
    onSetSubmitFunction?: (submitFunction: () => Promise<TreeDetailsFragment>) => void;
    readOnly?: boolean;
}

const TabContentWrapper = styled.div`
    height: calc(95vh - 15rem);
`;

function EditTree({treeId, onSetSubmitFunction, readOnly: isReadOnly}: IEditTreeProps): JSX.Element {
    const {t} = useTranslation('shared');
    const isEditing = !!treeId;

    const {loading, error, data} = useGetTreeByIdQuery({
        fetchPolicy: 'cache-and-network',
        variables: {
            id: [treeId]
        },
        skip: !treeId
    });

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <ErrorDisplay message={error?.message} />;
    }

    const treeData = data?.trees?.list[0] ?? null;

    const treeInfoComp = (
        <EditTreeInfo tree={treeData} onSetSubmitFunction={onSetSubmitFunction} readOnly={isReadOnly} />
    );

    // If creating new library, return the form directly
    if (!isEditing) {
        return treeInfoComp;
    }

    if (!treeData) {
        return <ErrorDisplay message={t('trees.unknown_tree')} />;
    }

    const tabs: TabsProps['items'] = [
        {
            key: 'info',
            label: t('global.info'),
            children: <TabContentWrapper>{treeInfoComp}</TabContentWrapper>
        }
    ];

    return <Tabs items={tabs} />;
}

export default EditTree;
