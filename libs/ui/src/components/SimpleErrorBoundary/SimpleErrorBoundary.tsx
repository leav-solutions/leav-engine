// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import SimpleErrorBoundaryContent from './SimpleErrorBoundaryContent';

interface ISimpleErrorBoundaryProps {
    children?: React.ReactNode;
}

interface ISimpleErrorBoundaryState {
    error: Error;
    errorInfo: React.ErrorInfo;
}

export class SimpleErrorBoundary extends React.Component<ISimpleErrorBoundaryProps, ISimpleErrorBoundaryState> {
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
            return <SimpleErrorBoundaryContent error={this.state.error} errorInfo={this.state.errorInfo} />;
        }

        // No error, just render children
        return this.props.children;
    }
}
