# Diagnosing workloads, services and DNS

Most CKA troubleshooting starts with a workload that is not behaving and ends with a Service that cannot reach it. Use a layered path and let evidence choose the next command.

## Triage by status

```bash
kubectl get pods -A -o wide
kubectl get deployments -A
kubectl get events -A --sort-by=.lastTimestamp | tail -40
```

### Pending

Scheduling failure. Check:

```bash
kubectl describe pod <pod> | sed -n '/Events/,$p'
kubectl describe node <node> | sed -n '/Allocated resources/,/Events/p'
```

Requests, node selectors, affinity, taints, PVC binding and quota can all block scheduling.

### ImagePullBackOff / ErrImagePull

```bash
kubectl describe pod <pod> | sed -n '/Events/,$p'
kubectl get pod <pod> -o jsonpath='{.spec.containers[*].image}'
kubectl get secret <pull-secret> -o yaml
```

Check the exact registry path, tag, credentials and network access.

### CrashLoopBackOff

```bash
kubectl logs <pod> --previous
kubectl describe pod <pod>
kubectl get pod <pod> -o jsonpath='{.status.containerStatuses[*].lastState}'
```

Look at the exit code, command, missing config and dependency errors. A container that never starts may have logs only from the previous instance, or none at all.

### Running but not Ready

```bash
kubectl describe pod <pod> | sed -n '/Readiness/,/Events/p'
kubectl exec <pod> -- sh
```

Probe path, port, timing and application dependencies are the usual suspects. A readiness failure removes the Pod from Service endpoints without restarting it.

## Service and endpoint path

```bash
kubectl get svc <svc> -o yaml
kubectl get endpointslice -l kubernetes.io/service-name=<svc> -o yaml
kubectl get pods -l <selector> --show-labels
```

If endpoints are empty:

1. selector mismatch
2. no ready Pods
3. wrong namespace
4. named port mismatch

If endpoints exist but traffic fails, test from inside the cluster:

```bash
kubectl run client --image=busybox:1.36 --rm -it --restart=Never -- sh
# nslookup <svc>
# wget -qO- --timeout=2 http://<svc>
```

A NetworkPolicy can allow DNS but block the application port. Test both separately.

## DNS

```bash
kubectl get pods -n kube-system -l k8s-app=kube-dns
kubectl get svc -n kube-system kube-dns
kubectl run dns --image=busybox:1.36 --rm -it --restart=Never -- nslookup kubernetes.default
```

If cluster-wide DNS fails, inspect CoreDNS logs and its ConfigMap. If only one namespace fails, inspect NetworkPolicy egress to kube-system on port 53.

## Resource pressure

```bash
kubectl top nodes
kubectl top pods -A --sort-by=memory
kubectl describe node <node> | sed -n '/Allocated resources/,/Events/p'
```

OOMKilled, evictions and CPU throttling produce different symptoms. Check requests, limits and actual usage together. A Pod can be Running and still be starved.

## Logs and previous containers

```bash
kubectl logs <pod> -c <container> --tail=100
kubectl logs <pod> --previous
kubectl logs -l app=web --since=10m
```

Logs are per container. Multi-container Pods require `-c`. A sidecar may be healthy while the application container is failing.

## Ingress and external access

If in-cluster traffic works but external traffic fails, check the Ingress/Gateway status, controller logs, TLS Secret, host/path rules and external address.

```bash
kubectl describe ingress <name>
kubectl logs -n ingress-nginx deploy/ingress-nginx-controller
```

## A compact diagnostic tree

```text
Pod not Running?
  Pending -> scheduling, quota, PVC
  ImagePull -> image, auth, network
  CrashLoop -> command, config, dependency
  Running not Ready -> probe, app, dependency

Pod Running and Ready?
  Service endpoints empty -> selector, readiness, port
  Endpoints present but no traffic -> policy, DNS, targetPort
  In-cluster works, external fails -> ingress/gateway, TLS, LB
```

> **Exam lens.** The fastest path is to name the layer before running a command. Each layer has a small set of high-signal commands.

## Verify recovery from the user's perspective

After a fix, confirm the Pod is Ready, endpoints are populated, DNS resolves and a real request succeeds. Do not stop at a green `kubectl get pods`.
