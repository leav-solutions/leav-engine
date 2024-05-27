// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import ErrorBoundaryContent from './ErrorBoundaryContent';

interface IErrorBoundaryProps {
    recoveryButtons?: React.ReactNode[];
    children?: React.ReactNode;
}

interface IErrorBoundaryState {
    error: Error;
    errorInfo: React.ErrorInfo;
}

export class ErrorBoundary extends React.Component<IErrorBoundaryProps, IErrorBoundaryState> {
    private constructor(props) {
        super(props);
        this.state = {error: null, errorInfo: null};
    }

    public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Catch errors in any components below and re-render with error message
        this.setState({
            error,
            errorInfo
        });
    }

    public render(): React.ReactNode {
        if (this.state.errorInfo) {
            // Display error
            return (
                <ErrorBoundaryContent
                    error={this.state.error}
                    errorInfo={this.state.errorInfo}
                    recoveryButtons={this.props.recoveryButtons}
                />
            );
        }

        // No error, just render children
        return this.props.children;
    }
}
