import {type FunctionComponent} from 'react';
import PropertiesList from '../PropertiesList';
import {type RecordFormAttributeFragment} from '_ui/_gqlTypes';
import {useAttributeInformations} from './useAttributeInformations';

interface IAttributeSummaryProps {
    attribute: RecordFormAttributeFragment;
}

export const AttributeSummary: FunctionComponent<IAttributeSummaryProps> = ({attribute}) => {
    const attributeInformations = useAttributeInformations(attribute);

    return <PropertiesList items={attributeInformations} />;
};

export default AttributeSummary;
