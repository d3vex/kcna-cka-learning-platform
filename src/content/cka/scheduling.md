# Scheduling, affinity and disruption budgets

The scheduler places Pods, but you define the constraints. Good scheduling balances utilization, fault tolerance and predictable performance.

## The scheduling cycle

For each unscheduled Pod, the scheduler:

1. Filters nodes that cannot satisfy hard constraints.
2. Scores the remaining nodes.
3. Selects a node and writes a binding.

The kubelet on that node then starts the containers. A Pod can remain Pending if no node passes the filters.

## Requests are the currency

The scheduler uses requests, not live usage. A node may look idle and still be unschedulable because existing Pods have reserved its allocatable capacity.

```bash
kubectl describe node <node> | sed -n '/Allocated resources/,/Events/p'
kubectl get pods -A -o custom-columns='NS:.metadata.namespace,NAME:.metadata.name,CPU:.spec.containers[*].resources.requests.cpu,MEM:.spec.containers[*].resources.requests.memory'
```

## Node selection

Simple:

```yaml
nodeSelector:
  disktype: ssd
```

Expressive:

```yaml
affinity:
  nodeAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
      nodeSelectorTerms:
        - matchExpressions:
            - key: topology.kubernetes.io/zone
              operator: In
              values: [zone-a, zone-b]
    preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 80
        preference:
          matchExpressions:
            - key: node-type
              operator: In
              values: [compute]
```

Required rules are hard filters. Preferred rules influence scoring. `IgnoredDuringExecution` means existing Pods are not evicted if labels change later.

## Taints and tolerations

Taints repel Pods from a node. Tolerations let specific Pods ignore a taint.

```bash
kubectl taint node node-1 dedicated=gpu:NoSchedule
```

```yaml
tolerations:
  - key: dedicated
    operator: Equal
    value: gpu
    effect: NoSchedule
```

Effects:

- `NoSchedule`: no new Pods without a toleration
- `PreferNoSchedule`: soft avoidance
- `NoExecute`: evict existing Pods that do not tolerate it

A toleration does not attract a Pod to a node. Combine it with affinity or a selector when placement must be specific.

## Pod affinity and anti-affinity

Use pod anti-affinity to spread replicas across nodes, or affinity to co-locate a cache with an application. Topology spread constraints are often a better fit for even distribution.

```yaml
topologySpreadConstraints:
  - maxSkew: 1
    topologyKey: topology.kubernetes.io/zone
    whenUnsatisfiable: ScheduleAnyway
    labelSelector:
      matchLabels:
        app: web
```

## PodDisruptionBudgets

A PDB limits voluntary disruptions such as drains and evictions.

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: web-pdb
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: web
```

With three replicas and `minAvailable: 2`, a drain can evict one Pod at a time. A PDB does not protect against node failure or involuntary termination.

## DaemonSets

A DaemonSet runs one Pod per eligible node. It is common for log shippers, node exporters and CNI agents. Tolerations and node selectors determine which nodes are eligible.

> **Exam lens.** Be able to explain why a Pod is Pending using scheduler events, and distinguish a taint from a selector. Know that a PDB affects voluntary disruption, not scheduling.

## Design for failure

Spread replicas across failure domains, set realistic requests, and test drains. A scheduling policy that works only when every node is healthy is not a policy; it is a coincidence.
