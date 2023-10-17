// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useLang} from '@leav/ui';
import {localizedTranslation} from '@leav/utils';
import styled, {CSSObject} from 'styled-components';
import {RecordIdentity_whoAmI} from '_gqlTypes/RecordIdentity';
import {ORIGIN_URL} from '../../../constants';
import RecordPreview from './RecordPreview';

interface IRecordCardProps {
    record: RecordIdentity_whoAmI;
    withLibrary?: boolean;
    withPreview?: boolean;
}

interface IWrapperProps {
    recordColor: string | null;
    style?: CSSObject;
}

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

const PreviewWrapper = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
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

function RecordCard({record, withLibrary = true, withPreview = true}: IRecordCardProps): JSX.Element {
    if (!record) {
        return null;
    }

    const {lang} = useLang();
    const libLabel = record.library.label ? localizedTranslation(record.library.label, lang) : record.library.id;
    return (
        <Wrapper recordColor={record.color} className="ui fluid">
            <PreviewWrapper className="ui">
                {withPreview && (
                    <RecordPreview
                        label={record.label || record.id}
                        color={record.color}
                        image={record.preview?.small ? ORIGIN_URL + record.preview.small : ''}
                    />
                )}
            </PreviewWrapper>
            <CardPart className="ui">
                <RecordLabel>{record.label || record.id}</RecordLabel>
                {withLibrary && <LibLabel>{libLabel}</LibLabel>}
            </CardPart>
        </Wrapper>
    );
}

export default RecordCard;
