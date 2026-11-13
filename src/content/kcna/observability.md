# Observability that answers questions

Observability is the ability to ask new questions of a system without shipping new code. It is not a dashboard count. It is evidence, organized so you can move from symptom to cause.

## Three signals, three jobs

- **Metrics** are cheap, aggregated numbers over time. They answer "how many, how often, how fast?" Use them for trends, alerts and capacity.
- **Logs** are discrete events with context. They answer "what exactly happened in this instance?" Use them for diagnosis and audit.
- **Traces** follow one request across services. They answer "where did the time go?" Use them for distributed latency and dependency analysis.

A system with only CPU graphs cannot explain a failing checkout. A system with only logs is expensive and slow to query at scale. The signals complement each other.

## The Kubernetes signals

Kubernetes exposes object state and events. These are not a replacement for application observability, but they are the first place to look.

```bash
kubectl get nodes
kubectl top nodes
kubectl top pods -A
kubectl get events -A --sort-by=.lastTimestamp
kubectl get pods -A --field-selector=status.phase!=Running
```

Container restart count, readiness, OOMKilled termination reasons and node conditions are high-value indicators.

## The common stack

- **Prometheus** scrapes and stores time-series metrics. It excels at Kubernetes service discovery and label-based queries.
- **Grafana** visualizes metrics and can query multiple data sources.
- **Alertmanager** routes alerts and handles grouping, inhibition and silence.
- **OpenTelemetry** provides vendor-neutral APIs, SDKs and a collector for traces, metrics and logs.
- **Loki, Elasticsearch or a managed service** store and query logs.

The names matter less than the pipeline: instrument, collect, store, query, alert, and connect the signals to an owner.

## SLIs, SLOs and alerts

An **SLI** is a measured indicator, such as the proportion of requests served under 300 ms. An **SLO** is a target for that indicator, such as 99.9% over 30 days. An error budget is the allowed failure implied by the SLO.

Good alerts are:

- tied to user impact, not raw resource levels alone
- actionable, with a clear owner and runbook
- resistant to noise, with sensible thresholds and durations
- reviewed after incidents

"CPU is at 80%" is not automatically an incident. "Checkout success rate is below 99% for five minutes" is.

## Instrumentation checklist

1. What user journey matters?
2. What is the SLI for that journey?
3. Which metric, log or span proves it?
4. What threshold indicates real impact?
5. Who receives the alert, and what do they do next?

> **Exam lens.** Be able to match a question to the right signal: aggregate rate and trend to metrics, exact event detail to logs, cross-service latency to traces.

## Start small

Instrument the request path and the failure path. Add dashboards only for questions you actually ask. A small number of trustworthy signals beats a wall of graphs nobody reads.
