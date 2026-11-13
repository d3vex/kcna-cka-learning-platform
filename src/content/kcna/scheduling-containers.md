# Containers, Pods and placement

A container is a process with isolation boundaries, not a small virtual machine. It shares the host kernel and uses namespaces, cgroups and capabilities to control what it can see and consume.

## Images are layered artifacts

An image contains a filesystem and metadata such as the entrypoint. Layers are content-addressed and cached. A tag is a mutable pointer; a digest identifies exact content.

```bash
docker build -t registry.example.com/team/app:1.4.2 .
docker push registry.example.com/team/app:1.4.2
docker inspect registry.example.com/team/app:1.4.2 --format '{{.RepoDigests}}'
```

Kubernetes pulls images through the container runtime interface (CRI), usually containerd. The kubelet asks the runtime to ensure the image is present and the container is running.

## Why Pods, not containers?

A Pod is the smallest schedulable unit. It gives one or more containers a shared network namespace, shared volumes and a common lifecycle. Containers in a Pod can reach each other over `localhost`.

Common patterns:

- **Sidecar**: augments the main container, such as a log shipper or proxy.
- **Init container**: runs to completion before app containers start.
- **Ambassador/adapter**: presents a simplified interface to the outside world.

A Pod is usually ephemeral. Do not treat its filesystem as durable storage.

## Lifecycle signals

A Pod moves through phases such as Pending, Running, Succeeded and Failed. Container states add detail: Waiting, Running and Terminated. Restart policy controls whether the kubelet restarts containers.

```bash
kubectl get pod web-abc -o wide
kubectl describe pod web-abc
kubectl get pod web-abc -o jsonpath='{.status.containerStatuses[*].state}'
```

Pending means the Pod has not been scheduled or cannot start. Running does not guarantee readiness. A readiness probe decides whether the Pod receives Service traffic.

## Requests, limits and QoS

Requests are the scheduler's capacity claim. Limits cap runtime consumption. The ratio determines the QoS class:

- **Guaranteed**: every container has CPU and memory requests equal to limits.
- **Burstable**: at least one request or limit is set, but not Guaranteed.
- **BestEffort**: no requests or limits.

```yaml
resources:
  requests:
    cpu: 100m
    memory: 64Mi
  limits:
    cpu: 500m
    memory: 128Mi
```

CPU is compressible: throttling slows work. Memory is not: exceeding a memory limit can trigger an OOM kill.

## Placement controls

The scheduler filters and scores nodes. You influence it with:

- **nodeSelector**: simple label match.
- **node affinity**: required or preferred rules with richer operators.
- **taints and tolerations**: nodes repel Pods unless the Pod tolerates the taint.
- **pod affinity/anti-affinity**: co-locate or separate Pods.
- **topology spread constraints**: distribute across zones or nodes.

```yaml
spec:
  nodeSelector:
    disktype: ssd
  tolerations:
    - key: dedicated
      operator: Equal
      value: gpu
      effect: NoSchedule
```

> **Exam lens.** Distinguish scheduling failure from runtime failure. Pending with a scheduler event is placement. Running but not Ready is usually probe, configuration or application behavior.

## The practical rule

Set requests from measured usage, set memory limits with headroom, and use readiness probes to protect traffic. Treat every Pod as replaceable and every local file as temporary unless it is on a persistent volume.
