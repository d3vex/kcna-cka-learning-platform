# Diagnosing nodes and control-plane components

When the cluster itself is unhealthy, workload-level debugging is wasted effort. Start at the bottom of the dependency stack and move upward.

## Node conditions

```bash
kubectl get nodes
kubectl describe node <node>
```

Read the conditions:

- **Ready**: kubelet is healthy and can reach the API server
- **MemoryPressure**: low memory
- **DiskPressure**: low disk or inode space
- **PIDPressure**: too many processes
- **NetworkUnavailable**: network plugin not configured

Node conditions are symptoms. The kubelet's own logs and OS metrics provide the cause.

## Kubelet

```bash
sudo systemctl status kubelet --no-pager
sudo journalctl -u kubelet -n 200 --no-pager
```

Common causes of NotReady:

- kubelet stopped or crashing
- container runtime unavailable
- invalid kubelet config
- certificate expired or API endpoint unreachable
- disk pressure preventing Pod admission
- CNI not initialized

Check the runtime:

```bash
sudo systemctl status containerd --no-pager
sudo crictl info
sudo crictl ps
```

## Static control-plane Pods

On kubeadm nodes:

```bash
sudo ls -l /etc/kubernetes/manifests
kubectl get pods -n kube-system -o wide
sudo crictl pods | grep -E 'kube-apiserver|etcd|controller|scheduler'
```

If a static Pod is not running, inspect:

```bash
sudo crictl logs <container-id>
sudo journalctl -u kubelet -n 100
```

A malformed static Pod manifest can prevent the API server from starting. Keep a backup before editing.

## API server and etcd

```bash
kubectl get --raw='/healthz'
kubectl get --raw='/readyz?verbose'
kubectl get --raw='/livez?verbose'
```

If the API is down, kubectl cannot help. On the control-plane host, check the static Pod and its logs. For etcd:

```bash
sudo ETCDCTL_API=3 etcdctl \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key \
  endpoint health
```

Check quorum, disk space, latency and certificate validity. Do not run destructive etcd operations without a verified backup.

## Certificates

```bash
sudo kubeadm certs check-expiration
openssl x509 -in /etc/kubernetes/pki/apiserver.crt -noout -dates
```

Expired certificates can break kubelet-to-API communication, apiserver serving, or etcd peering. The error messages may look like generic TLS or connection failures.

## DNS and networking at the node level

```bash
kubectl get pods -n kube-system -l k8s-app=kube-dns
kubectl get svc -n kube-system kube-dns
kubectl run nettest --image=busybox:1.36 --rm -it --restart=Never -- nslookup kubernetes.default
```

If CoreDNS is down, many workloads appear broken even though their containers are running.

## A disciplined sequence

1. Node Ready?
2. Kubelet and runtime healthy?
3. Control-plane static Pods running?
4. API server ready and etcd healthy?
5. Certificates valid?
6. CNI and CoreDNS healthy?
7. Workloads and Services.

> **Exam lens.** Be able to distinguish a node failure from a control-plane failure and a workload failure. The commands and the evidence are different at each layer.

## Protect the evidence

Before restarting a component, capture its status, logs and recent events. Restarting can erase the state that explains the failure. Fix the cause, not just the symptom.
