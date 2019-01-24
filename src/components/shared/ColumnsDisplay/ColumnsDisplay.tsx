import * as React from 'react';

interface IColumnsDisplayProps {
    columnsNumber: number;
    columnsContent: JSX.Element[];
}

function ColumnsDisplay({columnsNumber, columnsContent}: IColumnsDisplayProps): JSX.Element {
    const wrapperStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        height: '100%'
    };

    const childStyle: React.CSSProperties = {
        position: 'relative',
        paddingLeft: '1em',
        width: 100 / columnsNumber + '%',
        flexDirection: 'column',
        display: 'flex',
        textAlign: 'center'
    };

    const withBorder: React.CSSProperties = {
        borderRight: '1px solid #999999'
    };

    return (
        <div style={wrapperStyle}>
            {columnsContent.map((c, i) => (
                <div key={i} style={{...childStyle, ...withBorder}}>
                    {c}
                </div>
            ))}
        </div>
    );
}

export default ColumnsDisplay;
