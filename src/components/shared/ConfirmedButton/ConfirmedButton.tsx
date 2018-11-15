import {TranslationFunction} from 'i18next';
import * as React from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import {Confirm} from 'semantic-ui-react';

interface IConfirmedButtonProps extends WithNamespaces {
    actionButton?: React.ReactElement<any>;
    action: () => void;
    confirmMessage: string;
    t: TranslationFunction;
    children: JSX.Element;
}

interface IConfirmedButtonState {
    showConfirm: boolean;
}

class ConfirmedButton extends React.Component<IConfirmedButtonProps, IConfirmedButtonState> {
    constructor(props: IConfirmedButtonProps) {
        super(props);

        this.state = {
            showConfirm: false
        };
    }

    public render() {
        const {t, confirmMessage, children} = this.props;
        const {showConfirm} = this.state;

        const clickableButton = React.cloneElement(children, {onClick: this._openConfirm});

        return (
            <div onClick={this._disableClick}>
                {clickableButton}
                <Confirm
                    open={showConfirm}
                    content={confirmMessage}
                    onCancel={this._closeConfirm}
                    onConfirm={this._runAction}
                    cancelButton={t('admin.cancel')}
                    closeOnDocumentClick={false}
                    closeOnDimmerClick={false}
                />
            </div>
        );
    }

    private _disableClick = (e: React.SyntheticEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }

    private _openConfirm = (e: React.SyntheticEvent) => {
        e.preventDefault();
        e.stopPropagation();
        this.setState({showConfirm: true});
    }

    private _closeConfirm = (e: React.SyntheticEvent) => {
        e.preventDefault();
        e.stopPropagation();
        this.setState({showConfirm: false});
    }

    private _runAction = (e: React.SyntheticEvent) => {
        this._closeConfirm(e);
        this.props.action();
    }
}

export default withNamespaces()(ConfirmedButton);
