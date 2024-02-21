// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses:lgpl-3.0.txt
import styled from 'styled-components';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {IValueVersion} from '_ui/types/values';
import {getValueVersionLabel} from '../../../../../_utils';

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
    const {t} = useSharedTranslation();
    const versionLabel = getValueVersionLabel(version);

    return (
        <Wrapper>
            {t('values_version.inherited_from')}: {versionLabel}
        </Wrapper>
    );
}

export default InheritedFieldLabel;
