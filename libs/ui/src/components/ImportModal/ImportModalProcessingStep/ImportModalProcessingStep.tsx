// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import styled from 'styled-components';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';

const CenteredWrapper = styled.div`
    text-align: center;
`;

function ImportModalProcessingStep(): JSX.Element {
    const {t} = useSharedTranslation();

    return <CenteredWrapper data-test-id="processing">{t('global.processing') + '...'}</CenteredWrapper>;
}

export default ImportModalProcessingStep;
