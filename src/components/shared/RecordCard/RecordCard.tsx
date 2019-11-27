import React from 'react';
import styled, {CSSObject} from 'styled-components';
import useLang from '../../../hooks/useLang';
import {localizedLabel} from '../../../utils/utils';
import {RecordIdentity_whoAmI} from '../../../_gqlTypes/RecordIdentity';
import RecordPreview from '../RecordPreview';

interface IRecordCardProps {
    record: RecordIdentity_whoAmI;
    style?: CSSObject;
}

interface IWrapperProps {
    recordColor: string | null;
    style?: CSSObject;
}

/* tslint:disable:variable-name */
const Wrapper = styled.div<IWrapperProps>`
    border-left: 5px solid ${props => props.recordColor || 'transparent'};
    display: flex;
    flex-direction: row;
    ${props => props.style}
`;
Wrapper.displayName = 'Wrapper';

const CardPart = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
`;

const PreviewWrapper = styled(CardPart)`
    margin: 0 0.8em;
`;

const RecordLabel = styled.div`
    font-weight: bold;
`;

const LibLabel = styled.div`
    font-weight: normal;
    color: rgba(0, 0, 0, 0.4);
    fontsize: 0.9em;
`;
/* tslint:enable:variable-name */

/* tslint:disable-next-line:variable-name */
const RecordCard = ({record, style}: IRecordCardProps): JSX.Element => {
    const availableLanguages = useLang().lang;
    return (
        <Wrapper recordColor={record.color} style={style} className="ui fluid">
            <PreviewWrapper className="ui">
                <RecordPreview label={record.label || record.id} color={record.color} image={record.preview} />
            </PreviewWrapper>
            <CardPart className="ui">
                <RecordLabel>{record.label || record.id}</RecordLabel>
                <LibLabel>{localizedLabel(record.library.label, availableLanguages) || record.library.id}</LibLabel>
            </CardPart>
        </Wrapper>
    );
};

export default RecordCard;
