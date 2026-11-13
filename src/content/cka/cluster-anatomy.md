# Cluster anatomy and the control plane

A CKA works on a distributed system with several independent processes. The fastest way to understand a failure is to know which process owns which decision.

## The API server is the only front door

`kube-apiserver` validates and serves the Kubernetes API. It is stateless with respect to cluster data; etcd holds the state. Requests pass through authentication, authorization and admission before they are persisted.

The API server exposes health and readiness endpoints:

```bash
kubectl get --raw='/healthz'
kubectl get --raw='/readyz?verbose'
```

The `--secure-port` is normally 6443. Client certificates, service account tokens and kubeconfigs all authenticate here.

## etcd is the source of truth

etcd is a distributed key-value store using the Raft consensus protocol. A control plane needs a quorum to make progress. For three members, one failure is tolerated; for five, two. Losing quorum makes the API read-only at best and unavailable in practice.

Important operational facts:

- Back up etcd regularly with `etcdctl snapshot save`.
- Protect etcd peer and client traffic with TLS.
- Watch disk latency and free space; etcd is sensitive to both.
- Never treat an etcd restore as a casual operation; it rolls back cluster state.

```bash
sudo ETCDCTL_API=3 etcdctl \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key \
  snapshot save /var/backups/etcd.db
```

## Scheduler and controllers

`kube-scheduler` watches for Pods without a `nodeName`, filters nodes by feasibility, scores the remaining nodes and writes a binding. It does not start containers.

`kube-controller-manager` hosts controllers that reconcile object state: Node lifecycles, ReplicaSets, Deployments, Jobs, endpoints, service accounts and more. A controller failure does not stop running containers immediately, but desired-state changes stall.

## Node components

- **kubelet** registers the node, watches assigned Pods, mounts volumes, runs probes and reports status.
- **container runtime** (containerd or CRI-O) pulls images and manages containers through CRI.
- **kube-proxy** programs Service traffic rules. Some CNI implementations replace parts of this path.
- **CNI plugin** assigns Pod IPs and programs connectivity.

## Static Pods and kubeadm

On a kubeadm control-plane node, the API server, scheduler, controller manager and etcd are static Pods. The kubelet watches `/etc/kubernetes/manifests` and restarts those containers if they exit. Editing a static Pod manifest is a direct control-plane change; a malformed file can take the API server down.

Other important host paths:

- `/var/lib/kubelet`: kubelet state, Pod volumes and static Pod mirror data
- `/etc/kubernetes`: kubeconfigs, PKI, manifests and kubeadm config
- `/var/lib/etcd`: etcd data when using a stacked control plane

> **Exam lens.** If the API is unreachable, the question is not "which Deployment is broken?" It is "is the API server process running, can it reach etcd, and are its certificates valid?"

## Build the dependency map

When debugging, ask in order:

1. Is the node healthy?
2. Is kubelet running and registered?
3. Is the container runtime healthy?
4. Is the control-plane static Pod running?
5. Can the component reach its dependencies?
6. Is the object's controller functioning?

That order prevents you from restarting workloads when the actual failure is below them.
