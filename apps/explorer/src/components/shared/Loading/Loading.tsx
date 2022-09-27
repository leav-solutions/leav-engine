// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Spin} from 'antd';
import styled from 'styled-components';

const LoadingElem = styled(Spin)`
    && {
        display: block;
        margin: 3em;
    }
`;

function Loading(): JSX.Element {
    return <LoadingElem data-testid="loading" />;
}

export default Loading;
