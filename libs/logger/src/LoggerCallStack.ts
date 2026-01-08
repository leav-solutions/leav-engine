// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
interface ICallerInfo {
    path: string;
    line: string;
    col: string;
    matchStackIndex: number;
}

const winstonDetectCallOptimiseFromPath = 'node_modules/winston/lib/winston/_stream_writable.js';
const winstonLastCallSearchPath = 'node_modules/winston/lib/winston/create-logger.js';

// Matches lines like: at Object.<anonymous> (path:line:col) or at path:line:col
const stackTraceLineRegExp = new RegExp('.* \\(?(?<path>.*):(?<line>[0-9]+):(?<col>[0-9]+)');

const initialStackTraceLimit = Error.stackTraceLimit;
const maxCallStackTraceLimit = 50; // to avoid infinite loops

export class LoggerCallStack {
    private callerLineSearchFromIndexInStack = 1; // first line of stack is "Error" and message

    public getCallStackTrace(): string | null {
        let stackLines = this.getStackLines();
        if (stackLines == null) {
            return null;
        }

        let previousStackLinesLength = 0;
        let callerInfo: ICallerInfo | null = this.detectCallLineIndexInStack(stackLines);
        while (
            !this.callStackTraceLongEnough(callerInfo, stackLines) &&
            // stack trace not long enough yet, can still grow
            stackLines.length > previousStackLinesLength &&
            // avoid infinite loop
            Error.stackTraceLimit < maxCallStackTraceLimit
        ) {
            callerInfo = this.detectCallLineIndexInStack(stackLines);

            if (!this.callStackTraceLongEnough(callerInfo, stackLines)) {
                Error.stackTraceLimit++;

                previousStackLinesLength = stackLines.length;
                stackLines = this.getStackLines() as string[];
            }
        }

        return stackLines.slice(callerInfo ? callerInfo.matchStackIndex : 0).join('\n');
    }

    public getLocationInfo(): ICallerInfo | null {
        let stackLines = this.getStackLines();

        if (stackLines == null) {
            return null;
        }

        let callerInfo: ICallerInfo | null;

        do {
            callerInfo = this.detectCallLineIndexInStack(stackLines);

            if (!callerInfo) {
                Error.stackTraceLimit++;

                stackLines = this.getStackLines() as string[];
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
        // Search the first winston call in the stack
        for (let i = this.callerLineSearchFromIndexInStack; i < stackLines.length; i++) {
            if (stackLines[i].includes(winstonLastCallSearchPath)) {
                // The next line is the caller
                const matchLine = stackLines[i + 1]?.match(stackTraceLineRegExp);
                if (matchLine?.groups) {
                    return {
                        ...matchLine.groups,
                        matchStackIndex: i + 1,
                    } as unknown as ICallerInfo;
                }
            }
            if (stackLines[i].includes(winstonDetectCallOptimiseFromPath)) {
                // Next call to this.callerLineSearchFromIndexInStack will start from there in stack
                this.callerLineSearchFromIndexInStack++;
            }
        }

        return null;
    }

    private callStackTraceLongEnough(callerInfo: ICallerInfo | null, stackLines: string[]): boolean {
        return (
            !!callerInfo &&
            callerInfo.matchStackIndex > 0 &&
            stackLines.length - callerInfo.matchStackIndex >= initialStackTraceLimit
        );
    }
}
