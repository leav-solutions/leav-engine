import {type CSSProperties} from 'react';
import styled from 'styled-components';
import useLang from '../../../hooks/useLang';
import {localizedLabel} from '../../../utils/utils';
import {type RecordIdentity_whoAmI} from '../../../_gqlTypes/RecordIdentity';
import RecordPreview from '../RecordPreview';

interface IRecordCardProps {
    record: RecordIdentity_whoAmI;
    style?: CSSProperties;
    withLibrary?: boolean;
    withPreview?: boolean;
}

interface IWrapperProps {
    $recordColor: string | null;
}

const Wrapper = styled.div<IWrapperProps>`
    border-left: 5px solid ${props => props.$recordColor || 'transparent'};
    display: flex;
    flex-direction: row;
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

const RecordCard = ({record, style, withLibrary = true, withPreview = true}: IRecordCardProps): JSX.Element => {
    const availableLanguages = useLang().lang;
    return (
        <Wrapper $recordColor={record.color} style={style} className="ui fluid">
            {withPreview && (
                <PreviewWrapper className="ui">
                    <RecordPreview
                        label={record.label || record.id}
                        color={record.color}
                        image={record.preview?.small ? (record.preview.small as string) : ''}
                    />
                </PreviewWrapper>
            )}
            <CardPart className="ui">
                <RecordLabel>{record.label || record.id}</RecordLabel>
                {withLibrary && (
                    <LibLabel>{localizedLabel(record.library.label, availableLanguages) || record.library.id}</LibLabel>
                )}
            </CardPart>
        </Wrapper>
    );
};

export default RecordCard;
