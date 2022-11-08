// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {getValueVersionLabel} from 'utils';
import {IValueVersion} from '_types/types';

const Wrapper = styled.span`
    font-style: italic;
    font-size: 0.9em;

    ::before {
        content: ' - ';
    }
`;

interface IInheritedFieldLabelProps {
    version: IValueVersion;
}

function InheritedFieldLabel({version}: IInheritedFieldLabelProps): JSX.Element {
    const {t} = useTranslation();
    const versionLabel = getValueVersionLabel(version);

    return (
        <Wrapper>
            {t('values_version.inherited_from')}: {versionLabel}
        </Wrapper>
    );
}

export default InheritedFieldLabel;
