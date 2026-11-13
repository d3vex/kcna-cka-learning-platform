# Provisioning and upgrading with kubeadm

`kubeadm` automates the bootstrap of a conformant Kubernetes cluster. It does not install a container runtime, a CNI plugin or a cloud load balancer. Those are prerequisites or post-install choices.

## Host preparation

Every node needs:

- a supported Linux distribution and kernel
- unique hostname, MAC address and product UUID
- swap disabled (or kubelet configured for it)
- required kernel modules and sysctl settings
- a container runtime configured for the systemd cgroup driver
- `kubelet`, `kubeadm` and `kubectl` packages at matching versions

```bash
sudo swapoff -a
sudo modprobe overlay
sudo modprobe br_netfilter
cat <<'EOF' | sudo tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF
```

## Initialize the control plane

A minimal `kubeadm init` needs a pod network CIDR that matches your CNI.

```bash
sudo kubeadm init --pod-network-cidr=10.244.0.0/16
mkdir -p $HOME/.kube
sudo cp /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
kubectl apply -f <cni-manifest>
```

For a highly available control plane, use a load-balanced API endpoint and multiple control-plane nodes with `kubeadm join --control-plane`. An external etcd topology places etcd on separate hosts.

## Join workers

`kubeadm init` prints a join command containing a bootstrap token and CA certificate hash. Treat it as a secret. Tokens expire; create a new one when needed.

```bash
sudo kubeadm token create --print-join-command
```

## The upgrade path

Kubernetes supports one minor version at a time. Never skip a minor version.

Control plane first:

```bash
sudo apt-mark unhold kubeadm
sudo apt-get install -y kubeadm=1.37.x-*
sudo kubeadm upgrade plan
sudo kubeadm upgrade apply v1.37.x
sudo apt-mark unhold kubelet kubectl
sudo apt-get install -y kubelet=1.37.x-* kubectl=1.37.x-*
sudo systemctl daemon-reload
sudo systemctl restart kubelet
```

Workers one at a time:

```bash
kubectl drain <node> --ignore-daemonsets --delete-emptydir-data
sudo kubeadm upgrade node
sudo apt-get install -y kubelet=1.37.x-* kubectl=1.37.x-*
sudo systemctl daemon-reload
sudo systemctl restart kubelet
kubectl uncordon <node>
```

Always verify the node and workload health before moving to the next worker.

## Certificates and lifecycle

```bash
sudo kubeadm certs check-expiration
sudo kubeadm certs renew all
```

kubeadm certificates have a one-year lifetime by default. Plan renewal. Control-plane certificate renewal is not the same as kubelet client certificate rotation, which kubelet can handle automatically.

## Reset and rebuild

`kubeadm reset` removes cluster state from a node. It does not automatically clean CNI configuration, iptables rules or persistent volumes.

```bash
sudo kubeadm reset
sudo rm -rf /etc/cni/net.d
```

> **Exam lens.** Know the drain/upgrade/uncordon sequence, one-minor-version rule, the difference between control-plane and worker upgrade steps, and where kubeadm stores configuration.

## Verification is part of the upgrade

After each step:

```bash
kubectl get nodes
kubectl get pods -A
kubectl get --raw='/readyz?verbose'
```

A node that reports the new version but is NotReady is not a successful upgrade.
