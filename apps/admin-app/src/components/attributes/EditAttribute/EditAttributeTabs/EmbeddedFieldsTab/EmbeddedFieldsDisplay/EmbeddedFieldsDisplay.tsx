// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {Container, Header} from 'semantic-ui-react';
import {IEmbeddedFields} from '../../../../../../_types/embeddedFields';

interface IEmbeddedFieldsDisplayProps {
    attribute: IEmbeddedFields;
}

function EmbeddedFieldsDisplay({attribute}: IEmbeddedFieldsDisplayProps) {
    return (
        <Container
            fluid
            textAlign="center"
            style={{
                padding: '1rem',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            <Header as="h5">{attribute.id}</Header>
        </Container>
    );
}

export default EmbeddedFieldsDisplay;
