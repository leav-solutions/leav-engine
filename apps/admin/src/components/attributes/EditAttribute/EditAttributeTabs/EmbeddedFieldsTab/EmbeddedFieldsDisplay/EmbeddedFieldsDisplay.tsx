import {Container, Header} from 'semantic-ui-react';
import {type IEmbeddedFields} from '../../../../../../_types/embeddedFields';
import {localizedLabel} from '../../../../../../utils';
import useLang from '../../../../../../hooks/useLang';

interface IEmbeddedFieldsDisplayProps {
    attribute: IEmbeddedFields;
}

function EmbeddedFieldsDisplay({attribute}: IEmbeddedFieldsDisplayProps) {
    const availableLanguages = useLang().lang;

    return (
        <Container
            fluid
            textAlign="center"
            style={{
                padding: '1rem',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Header as="h5">{localizedLabel(attribute.label, availableLanguages) || attribute.id}</Header>
        </Container>
    );
}

export default EmbeddedFieldsDisplay;
