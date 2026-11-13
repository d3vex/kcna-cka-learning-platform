# The cluster as a control loop

Kubernetes is not a list of servers you command one by one. It is a **reconciliation system**. You declare a desired state, store it in the API, and controllers work continuously to make reality match it.

That single idea explains most Kubernetes behavior. A Deployment does not "run" a container. It declares that a certain number of Pods should exist. A controller notices the difference and creates them. If a node dies, the same loop creates replacements elsewhere.

## The control plane

The control plane is the decision-making layer:

- **kube-apiserver** is the front door. Every read and write goes through it. It validates requests, applies admission policies and persists objects.
- **etcd** is the consistent key-value store holding cluster state. Losing etcd means losing the source of truth; protect and back it up.
- **kube-scheduler** chooses a node for a Pod that has not been assigned one. It filters nodes that cannot fit, then scores the remaining candidates.
- **kube-controller-manager** runs built-in controllers: ReplicaSet, Deployment, Node, Job and others. Each controller watches for a gap between desired and observed state.

## The worker node

Each worker runs the components that make containers real:

- **kubelet** is the node agent. It watches for Pods assigned to its node and asks the container runtime to run them.
- **containerd** (or another CRI-compatible runtime) pulls images and manages container lifecycles.
- **kube-proxy** programs Service routing rules, usually with iptables or IPVS. A CNI plugin provides the Pod network itself.

## Objects are records, not commands

A Kubernetes object has `apiVersion`, `kind`, `metadata` and usually `spec` and `status`.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: nginx
          image: nginx:1.27
```

You write `spec`. The system writes `status`. A controller compares them. `kubectl apply` sends your intended record; it does not execute a remote procedure.

> **Exam lens.** If a question asks why a Pod exists, always identify the owning controller and the desired-state loop. If it asks why a Pod is not running, move to scheduling, image pull, runtime or readiness evidence.

## Desired state is not instant

Reconciliation is asynchronous. A successful `kubectl apply` means the API accepted the object, not that the workload is healthy. Production workflows wait for rollout status, readiness and health checks. This distinction is the root of many "it said created but the app is down" incidents.

## Namespaces and scope

Namespaces partition names for namespaced objects such as Pods, Services and ConfigMaps. Nodes, PersistentVolumes and StorageClasses are cluster-scoped. Namespaces are not a complete security boundary by themselves; RBAC, network policy and resource quotas add the controls.

## Check your model

When you see a new object, ask:

1. What is the desired state?
2. Which controller owns reconciliation?
3. What evidence tells me the observed state is healthy?

If you can answer those three questions, the rest of Kubernetes becomes much less mysterious.
