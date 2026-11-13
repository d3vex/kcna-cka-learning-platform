# Probes and workload autoscaling

Health checks and autoscaling are related: both depend on trustworthy signals. A bad probe causes outages; a bad scaling metric causes thrash.

## The three probes

- **Startup probe**: gives a slow-starting container time to initialize. While it runs, liveness and readiness are disabled.
- **Readiness probe**: decides whether the Pod should receive Service traffic.
- **Liveness probe**: decides whether the kubelet should restart the container.

```yaml
startupProbe:
  httpGet:
    path: /healthz
    port: 8080
  failureThreshold: 30
  periodSeconds: 5
readinessProbe:
  httpGet:
    path: /ready
    port: 8080
  periodSeconds: 5
livenessProbe:
  httpGet:
    path: /healthz
    port: 8080
  periodSeconds: 10
  failureThreshold: 3
```

Use an endpoint that proves the dependency the container needs. A liveness probe that checks a downstream database can restart every replica during a database outage, making the incident worse.

## Probe mechanisms

- `httpGet`: success on 200-399
- `tcpSocket`: success if the port accepts a connection
- `exec`: success on exit code 0
- `grpc`: for gRPC health checking

Timeouts, thresholds and initial delays should come from observed startup behavior, not guesswork.

## HorizontalPodAutoscaler

The HPA adjusts replicas based on metrics. It needs:

1. A metrics source, usually metrics-server for resource metrics.
2. A scalable workload with resource requests.
3. Reasonable min/max replicas and behavior.

```bash
kubectl autoscale deployment web --cpu-percent=60 --min=2 --max=10
kubectl get hpa
kubectl describe hpa web
```

```yaml
behavior:
  scaleDown:
    stabilizationWindowSeconds: 300
    policies:
      - type: Percent
        value: 50
        periodSeconds: 60
```

The HPA calculates a ratio of current metric to target. If every Pod is at 100% CPU with a 60% target, it wants more replicas. If metrics are missing, it cannot act.

## Vertical Pod Autoscaler and cluster autoscaler

- **VPA** recommends or applies resource requests. It may restart Pods to change requests, depending on update mode.
- **Cluster autoscaler** adds or removes nodes when Pods cannot schedule or nodes are underused. It works at the infrastructure layer, not inside the cluster.

Do not enable multiple autoscalers blindly. HPA and VPA can conflict if both target the same resource dimension.

## Capacity and disruption

Autoscaling does not create capacity instantly. Set `minReplicas` for baseline availability, use PDBs for voluntary disruption, and ensure the cluster has room to scale.

```bash
kubectl get pods -l app=web -o wide
kubectl top pods -l app=web
kubectl get hpa web -w
```

> **Exam lens.** Know which probe affects traffic versus restarts, and the prerequisites for HPA. A missing metrics-server or missing resource requests are common reasons an HPA shows `<unknown>`.

## Tune from evidence

Load-test a representative workload, watch latency and resource usage, then set requests, probes and scaling thresholds. Copying values from a blog post is not capacity planning.
