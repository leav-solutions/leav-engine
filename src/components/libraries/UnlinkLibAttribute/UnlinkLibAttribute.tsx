import React from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import {Button} from 'semantic-ui-react';
import {AttributeDetails} from '../../../_gqlTypes/AttributeDetails';
import {GET_LIBRARIES_libraries} from '../../../_gqlTypes/GET_LIBRARIES';
import ConfirmedButton from '../../shared/ConfirmedButton';

interface IUnlinkLibAttributeProps extends WithNamespaces {
    attribute?: AttributeDetails;
    library: GET_LIBRARIES_libraries | null;
    onUnlink: (attributesList: string[]) => void;
}

class UnlinkLibAttribute extends React.Component<IUnlinkLibAttributeProps> {
    constructor(props: IUnlinkLibAttributeProps) {
        super(props);
    }

    public render() {
        const {attribute, library, t, onUnlink} = this.props;

        if (!attribute || !library) {
            return '';
        }

        const label = library.label !== null ? library.label.fr || library.label.en || library.id : library.id;

        const action = () => {
            const attributesToSave = !library.attributes
                ? []
                : library.attributes.filter(a => a.id !== attribute.id).map(a => a.id);

            return onUnlink(attributesToSave);
        };

        return (
            <ConfirmedButton action={action} confirmMessage={t('libraries.confirm_unlink_attr', {libLabel: label})}>
                <Button className="unlink" circular icon="cancel" disabled={attribute.system} />
            </ConfirmedButton>
        );
    }
}

export default withNamespaces()(UnlinkLibAttribute);
