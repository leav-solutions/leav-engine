import opentelemetry, {type Counter, type Histogram} from '@opentelemetry/api';

const meter = opentelemetry.metrics.getMeter('cache', '0.1.0');

export const memoizeCounter: Counter = meter.createCounter('leav.cache.memoize.total', {
    description:
        'Number of `cachesService.memoize()` calls, by `outcome`. A `hit` means the value was already ' +
        'available in the per-request DataLoader or in Redis and the compute function was skipped; a `miss` ' +
        'means the compute function had to run. Note: with concurrent calls for the same key, every caller ' +
        'that misses the fast path is counted as a `miss`, even though the underlying compute function only ' +
        'runs once (deduplicated by `memoizeWithLock`).',
});

export const memoizeComputeDuration: Histogram = meter.createHistogram('leav.cache.memoize.compute.duration', {
    description:
        'Duration of the compute function passed to `memoize()`, executed only on a cache miss. This is the ' +
        'cost that caching amortizes on a hit. `outcome=error` means the compute function threw and no value ' +
        'was cached for this key.',
    unit: 'ms',
    advice: {explicitBucketBoundaries: [1, 5, 25, 100, 500, 1000, 2000, 5000]},
});

export const redisOperationDuration: Histogram = meter.createHistogram('leav.cache.redis.operation.duration', {
    description:
        'Duration of a Redis command issued by the RAM cache service (`ramService`), by `operation` ' +
        '(get/set/del/flush) and `outcome`. `db` distinguishes the Redis database this ramService instance ' +
        'operates on (`cache` for `cachesService`, `session` for `sessionRepo`, which reuses the same service).',
    unit: 'ms',
    advice: {explicitBucketBoundaries: [1, 5, 25, 100, 500, 1000, 2000, 5000]},
});

export const redisErrorsCounter: Counter = meter.createCounter('leav.cache.redis.errors.total', {
    description:
        'Number of Redis command failures observed by the RAM cache service, by `operation` and `db` ' +
        '(`cache` or `session`, see `cache.redis.operation.duration`). Includes failures from the ' +
        'fire-and-forget `storeData` calls issued by `cachesService.memoize()`, which are otherwise ' +
        'swallowed silently.',
});

export const cacheKeysCountGauge = meter.createObservableGauge('leav.cache.redis.keys.count', {
    description: 'Current number of keys in a Redis database, as reported by `DBSIZE`, by `db` (`cache` or `session`).',
});
