# LEAV Engine - Log Collector

Listen core db events, save them in elasticsearch with [data-streams](https://www.elastic.co/docs/manage-data/data-store/data-streams)

## Init discover view in kibana

Dans kibana => Discover => Create a data view
- Name: leav-logs-* (dont care, for you)
- Index pattern: leav-logs-*
- Timestamp field: @timestamp
