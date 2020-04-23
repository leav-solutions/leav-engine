import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Confirm} from 'semantic-ui-react';

interface IConfirmedButtonProps {
    actionButton?: React.ReactElement<any>;
    action: (param?: any) => void;
    confirmMessage: string;
    children: JSX.Element;
}

const ConfirmedButton = (props: IConfirmedButtonProps): JSX.Element => {
    const {confirmMessage, children} = props;
    const {t} = useTranslation();
    const [showConfirm, setShowConfirm] = useState<boolean>(false);

    const _disableClick = (e: React.SyntheticEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const _openConfirm = (e: React.SyntheticEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowConfirm(true);
    };

    const _closeConfirm = (e: React.SyntheticEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowConfirm(false);
    };

    const _runAction = (e: React.SyntheticEvent) => {
        _closeConfirm(e);
        props.action();
    };

    const clickableButton = React.cloneElement(children, {onClick: _openConfirm});

    return (
        <div onClick={_disableClick}>
            {clickableButton}
            <Confirm
                open={showConfirm}
                content={confirmMessage}
                onCancel={_closeConfirm}
                onConfirm={_runAction}
                cancelButton={t('admin.cancel')}
                closeOnDocumentClick={false}
                closeOnDimmerClick={false}
            />
        </div>
    );
};

export default ConfirmedButton;
