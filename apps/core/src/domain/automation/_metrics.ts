import opentelemetry, {type Counter, type Histogram} from '@opentelemetry/api';

const meter = opentelemetry.metrics.getMeter('automation', '0.1.0');

export const triggerCounter: Counter = meter.createCounter('leav.automation.trigger.total', {
    description:
        'Number of domain events evaluated for automation rules. `outcome` reports whether any active rule matched the event.',
});

export const triggerRulesMatched: Histogram = meter.createHistogram('leav.automation.trigger.rules_matched', {
    description: 'Distribution of the number of automation rules matched per incoming event.',
});

export const triggerDuration: Histogram = meter.createHistogram('leav.automation.trigger.duration', {
    description:
        'End-to-end duration of `triggerRules`, from cache lookup to all matched pipelines having completed. This is the latency automation adds to the originating operation (synchronous path) or to the worker (async path).',
    unit: 'ms',
    advice: {explicitBucketBoundaries: [1, 5, 25, 100, 500, 1000, 2000, 5000]},
});

export const triggerRulesFetchDuration: Histogram = meter.createHistogram(
    'leav.automation.trigger.rules_fetch.duration',
    {
        description:
            'Duration of an automation rules fetch operation performed in the `triggerRules` method, from cache lookup to fully loading all matched rules. This is a subset of the total `triggerRules` duration and isolates the performance of the cache and database layer.',
        unit: 'ms',
        advice: {explicitBucketBoundaries: [1, 2, 5, 10, 25, 100, 500, 1000]},
    },
);
