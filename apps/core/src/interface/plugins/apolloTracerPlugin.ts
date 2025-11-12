// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {performance} from 'perf_hooks';
import {type ApolloServerPlugin, type GraphQLRequestListener} from '@apollo/server';

/**
 * Interface for tracking operation span boundaries.
 */
interface IOperationSpan {
    firstStart: number;
    lastEnd: number;
    totalRuns: number;
    totalDuration: number;
    errorCount: number;
}

/**
 * Interface for tracking resolver executions.
 */
interface IResolverSpan {
    firstStart: number;
    lastEnd: number;
    totalRuns: number;
    totalDuration: number;
    intervals: Array<{start: number; end: number}>; // Track all execution intervals
}

/**
 * Interface for resolver metrics summary.
 */
interface IResolverMetricSummary {
    Executions: number;
    'Total Time (ms)': string;
    'Avg Time (ms)': string;
    'Span Time (ms)': string;
}

// Global store for GraphQL operation metrics
const operationMetrics = new Map<string, IOperationSpan>();

// Global store for resolver metrics
const resolverMetrics = new Map<string, IResolverSpan>();

/**
 * Merges overlapping time intervals and calculates total non-overlapping duration.
 * @param intervals Array of time intervals with start and end times
 * @returns Total duration covered by merged intervals
 */
function calculateMergedSpanDuration(intervals: Array<{start: number; end: number}>): number {
    if (intervals.length === 0) {
        return 0;
    }

    // Sort intervals by start time
    const sorted = [...intervals].sort((a, b) => a.start - b.start);

    let totalDuration = 0;
    let currentStart = sorted[0].start;
    let currentEnd = sorted[0].end;

    for (let i = 1; i < sorted.length; i++) {
        const interval = sorted[i];

        if (interval.start <= currentEnd) {
            // Overlapping or adjacent - extend the current span
            currentEnd = Math.max(currentEnd, interval.end);
        } else {
            // Gap found - add current span and start new one
            totalDuration += currentEnd - currentStart;
            currentStart = interval.start;
            currentEnd = interval.end;
        }
    }

    // Add the last span
    totalDuration += currentEnd - currentStart;

    return totalDuration;
}

/**
 * Records a GraphQL operation execution.
 */
function recordOperation(
    operationName: string,
    startTime: number,
    endTime: number,
    durationMs: number,
    hasError: boolean,
): void {
    const existing = operationMetrics.get(operationName);

    if (!existing) {
        operationMetrics.set(operationName, {
            firstStart: startTime,
            lastEnd: endTime,
            totalRuns: 1,
            totalDuration: durationMs,
            errorCount: hasError ? 1 : 0,
        });
    } else {
        existing.firstStart = Math.min(existing.firstStart, startTime);
        existing.lastEnd = Math.max(existing.lastEnd, endTime);
        existing.totalRuns++;
        existing.totalDuration += durationMs;
        if (hasError) {
            existing.errorCount++;
        }
    }
}

/**
 * Records a resolver execution.
 */
function recordResolver(resolverName: string, startTime: number, endTime: number, durationMs: number): void {
    const existing = resolverMetrics.get(resolverName);

    if (!existing) {
        resolverMetrics.set(resolverName, {
            firstStart: startTime,
            lastEnd: endTime,
            totalRuns: 1,
            totalDuration: durationMs,
            intervals: [{start: startTime, end: endTime}],
        });
    } else {
        existing.firstStart = Math.min(existing.firstStart, startTime);
        existing.lastEnd = Math.max(existing.lastEnd, endTime);
        existing.totalRuns++;
        existing.totalDuration += durationMs;
        existing.intervals.push({start: startTime, end: endTime});
    }
}

/**
 * Apollo Server plugin for measuring GraphQL operation and resolver performance.
 */
export const apolloTracerPlugin: ApolloServerPlugin = {
    async requestDidStart() {
        const requestStart = performance.now();
        let operationName = 'anonymous';
        let hasError = false;

        // Track resolvers per request for the table
        const requestResolvers = new Map<string, IResolverSpan>();

        return {
            async didResolveOperation(requestContext) {
                // Capture the operation name
                const operationType = requestContext.operation?.operation || 'unknown';
                operationName = `${operationType}:${requestContext.operationName || 'anonymous'}`;
            },

            async executionDidStart() {
                return {
                    willResolveField({info}) {
                        const start = performance.now();
                        const resolverName = `${info.parentType.name}.${info.fieldName}`;

                        return () => {
                            const end = performance.now();
                            const duration = end - start;

                            // Record in global resolver metrics
                            recordResolver(resolverName, start, end, duration);

                            // Record in request-specific metrics
                            const existing = requestResolvers.get(resolverName);
                            if (!existing) {
                                requestResolvers.set(resolverName, {
                                    firstStart: start,
                                    lastEnd: end,
                                    totalRuns: 1,
                                    totalDuration: duration,
                                    intervals: [{start, end}],
                                });
                            } else {
                                existing.firstStart = Math.min(existing.firstStart, start);
                                existing.lastEnd = Math.max(existing.lastEnd, end);
                                existing.totalRuns++;
                                existing.totalDuration += duration;
                                existing.intervals.push({start, end});
                            }
                        };
                    },
                };
            },

            async didEncounterErrors() {
                hasError = true;
            },

            async willSendResponse() {
                const requestEnd = performance.now();
                const durationMs = requestEnd - requestStart;

                // Record the operation
                recordOperation(operationName, requestStart, requestEnd, durationMs, hasError);

                // Log operation completion
                const status = hasError ? 'ERROR' : 'SUCCESS';
                console.log(`\n[GraphQL ${status}] ${operationName} completed in ${durationMs.toFixed(3)} ms`);

                // Display resolver breakdown table for this request
                if (requestResolvers.size > 0) {
                    const tableData: Record<string, IResolverMetricSummary> = {};

                    // Sort by total time (descending)
                    const sortedResolvers = Array.from(requestResolvers.entries()).sort(
                        ([ignoreAIndex, valueA], [ignoreBIndex, valueB]) => valueB.totalDuration - valueA.totalDuration,
                    );

                    for (const [resolverName, span] of sortedResolvers) {
                        const averageTimeMs = span.totalDuration / span.totalRuns;
                        const spanTimeMs = calculateMergedSpanDuration(span.intervals);

                        tableData[resolverName] = {
                            Executions: span.totalRuns,
                            'Total Time (ms)': span.totalDuration.toFixed(3),
                            'Avg Time (ms)': averageTimeMs.toFixed(3),
                            'Span Time (ms)': spanTimeMs.toFixed(3),
                        };
                    }
                    console.log('  Resolver Breakdown:');
                    console.table(tableData);
                }
            },
        };
    },
};
