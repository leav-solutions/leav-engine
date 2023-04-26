// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Tabs, TabsProps} from 'antd';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {AttributeDetailsFragment, useGetAttributeByIdQuery} from '../../../_gqlTypes';
import {ErrorDisplay} from '../../ErrorDisplay';
import {Loading} from '../../Loading';
import {EditAttributeInfo} from './EditAttributeInfo';

interface IEditAttributeProps {
    attributeId?: string;
    onSetSubmitFunction?: (submitFunction: () => Promise<AttributeDetailsFragment>) => void;
}

const TabContentWrapper = styled.div`
    height: calc(95vh - 15rem);
`;

function EditAttribute({attributeId, onSetSubmitFunction}: IEditAttributeProps): JSX.Element {
    const {t} = useTranslation('shared');
    const isEditing = !!attributeId;

    const {loading, error, data} = useGetAttributeByIdQuery({
        fetchPolicy: 'cache-and-network',
        variables: {
            id: attributeId
        },
        skip: !attributeId
    });

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <ErrorDisplay message={error.message} />;
    }

    const attributeData = data?.attributes?.list[0] ?? null;

    const attributeInfoComp = <EditAttributeInfo attribute={attributeData} onSetSubmitFunction={onSetSubmitFunction} />;

    // If creating new library, return the form directly
    if (!isEditing) {
        return attributeInfoComp;
    }

    if (!attributeData) {
        return <ErrorDisplay message={t('attributes.unknown_attribute')} />;
    }

    const tabs: TabsProps['items'] = [
        {
            key: 'info',
            label: t('global.info'),
            children: <TabContentWrapper>{attributeInfoComp}</TabContentWrapper>
        }
    ];

    return <Tabs items={tabs} />;
}

export default EditAttribute;
