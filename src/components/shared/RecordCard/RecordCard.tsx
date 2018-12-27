import * as React from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import {localizedLabel} from 'src/utils/utils';
import {RecordIdentity_whoAmI} from 'src/_gqlTypes/RecordIdentity';
import RecordPreview from '../RecordPreview';

interface IRecordCardProps extends WithNamespaces {
    record: RecordIdentity_whoAmI;
    style?: React.CSSProperties;
}

function RecordCard({record, style, i18n}: IRecordCardProps): JSX.Element {
    const vertAlign: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
    };

    const border: React.CSSProperties = {
        borderLeft: `5px solid ${record.color || 'transparent'}`
    };

    return (
        <div className="ui fluid" style={{...border, display: 'flex', flexDirection: 'row', ...style}}>
            <div className="ui" style={{...vertAlign, margin: '0 0.8em'}}>
                <RecordPreview label={record.label || record.id} color={record.color} image={record.preview} />
            </div>
            <div className="ui" style={vertAlign}>
                <div style={{fontWeight: 'bold'}}>{record.label || record.id}</div>
                <div style={{fontWeight: 'normal', color: 'rgba(0,0,0,0.4)', fontSize: '0.9em'}}>
                    {localizedLabel(record.library.label, i18n) || record.library.id}
                </div>
            </div>
        </div>
    );
}

export default withNamespaces()(RecordCard);
