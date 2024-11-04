// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Component, ErrorInfo, ReactNode} from 'react';
import SimpleErrorBoundaryContent from './SimpleErrorBoundaryContent';

interface ISimpleErrorBoundaryProps {
    children?: ReactNode;
}

interface ISimpleErrorBoundaryState {
    error: Error;
    errorInfo: ErrorInfo;
}

export class SimpleErrorBoundary extends Component<ISimpleErrorBoundaryProps, ISimpleErrorBoundaryState> {
    private constructor(props) {
        super(props);
        this.state = {error: null, errorInfo: null};
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Catch errors in any components below and re-render with error message
        this.setState({
            error,
            errorInfo
        });
    }

    public render() {
        if (this.state.errorInfo) {
            // Display error
            return <SimpleErrorBoundaryContent error={this.state.error} errorInfo={this.state.errorInfo} />;
        }

        // No error, just render children
        return this.props.children;
    }
}
