// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent} from 'react';
import PropertiesList from '../PropertiesList';
import {RecordFormAttributeFragment} from '_ui/_gqlTypes';
import {useAttributeInformations} from './useAttributeInformations';

interface IAttributeSummaryProps {
    attribute: RecordFormAttributeFragment;
}

export const AttributeSummary: FunctionComponent<IAttributeSummaryProps> = ({attribute}) => {
    const attributeInformations = useAttributeInformations(attribute);

    return <PropertiesList items={attributeInformations} />;
};

export default AttributeSummary;
