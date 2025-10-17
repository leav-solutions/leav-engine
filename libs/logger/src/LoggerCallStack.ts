// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
interface ICallerInfo {
    path: string;
    line: string;
    col: string;
}

const winstonCallRegExp = new RegExp('node_modules/winston/lib/winston(?:.js|/create-logger.js)');

// Matches lines like: at Object.<anonymous> (path:line:col) or at path:line:col
const stackTraceLineRegExp = new RegExp('.* \\(?(?<path>.*):(?<line>[0-9]+):(?<col>[0-9]+)');

const initialStackTraceLimit = Error.stackTraceLimit;
const maxCallStackTraceLimit = 50; // to avoid infinite loops

export class LoggerCallStack {
    private callerLineIndexInStack = 0;

    public getCallStackTrace(): string | null {
        let stackLines = this.getStackLines();
        if (stackLines == null) {
            return null;
        }

        let previousStackLinesLength = 0;
        while (
            !this.callStackTraceLongEnough(stackLines) &&
            // stack trace not long enough yet, can still grow
            stackLines.length > previousStackLinesLength &&
            // avoid infinite loop
            Error.stackTraceLimit < maxCallStackTraceLimit
        ) {
            this.detectCallLineIndexInStack(stackLines);

            if (!this.callStackTraceLongEnough(stackLines)) {
                Error.stackTraceLimit++;

                previousStackLinesLength = stackLines.length;
                stackLines = this.getStackLines();
            }
        }

        return stackLines.slice(this.callerLineIndexInStack).join('\n');
    }

    public getLocationInfo(): ICallerInfo | null {
        let stackLines = this.getStackLines();
        if (stackLines == null) {
            return null;
        }

        // First try with the last known index
        if (this.callerLineIndexInStack > 0 && stackLines.length > this.callerLineIndexInStack) {
            const theLine = stackLines[this.callerLineIndexInStack];
            const matchLine = theLine.match(stackTraceLineRegExp);
            if (matchLine?.groups) {
                return matchLine.groups as unknown as ICallerInfo;
            }
        }

        let callerInfo: ICallerInfo;

        do {
            callerInfo = this.detectCallLineIndexInStack(stackLines);

            if (!callerInfo) {
                Error.stackTraceLimit++;

                stackLines = this.getStackLines();
            }
        } while (
            !callerInfo &&
            // avoid infinite loop
            Error.stackTraceLimit < maxCallStackTraceLimit
        );
        return callerInfo;
    }

    private getStackLines(): string[] | null {
        const stack = new Error().stack;
        if (!stack) {
            return null;
        }
        return stack.split('\n');
    }

    private detectCallLineIndexInStack(stackLines: string[]): ICallerInfo | null {
        const reverseStackLines = [...stackLines].reverse();

        // Search the first winston call in the stack
        // Start at index 1 because first line may the effective caller
        for (let i = 1; i < reverseStackLines.length; i++) {
            const matchWinstonCall = reverseStackLines[i].match(winstonCallRegExp);
            if (matchWinstonCall) {
                // The previous line is the caller
                const matchLine = reverseStackLines[i - 1].match(stackTraceLineRegExp);
                if (matchLine?.groups) {
                    this.callerLineIndexInStack = reverseStackLines.length - i;
                    return matchLine.groups as unknown as ICallerInfo;
                }
            }
        }

        return null;
    }

    private callStackTraceLongEnough(stackLines: string[]): boolean {
        return (
            this.callerLineIndexInStack > 0 && stackLines.length - this.callerLineIndexInStack >= initialStackTraceLimit
        );
    }
}
