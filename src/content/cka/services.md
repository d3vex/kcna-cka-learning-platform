# Services, endpoints and cluster DNS

A Service is a stable virtual address in front of a changing set of Pods. Understanding the path from name to endpoint is the core networking skill for CKA.

## How a ClusterIP Service works

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web
  namespace: study
spec:
  selector:
    app: web
  ports:
    - name: http
      port: 80
      targetPort: 8080
  type: ClusterIP
```

- `port` is the Service port clients use.
- `targetPort` is the container port.
- The selector must match Pod labels.
- Only ready Pods appear in EndpointSlices unless `publishNotReadyAddresses` is set.

```bash
kubectl get svc web -n study
kubectl get endpointslice -n study -l kubernetes.io/service-name=web -o yaml
kubectl get pods -n study -l app=web --show-labels
```

An empty endpoint list usually means a selector mismatch, no ready Pods or the wrong namespace.

## Service types

### NodePort

```yaml
type: NodePort
ports:
  - port: 80
    targetPort: 8080
    nodePort: 30080
```

The port opens on every node. This does not guarantee external reachability; firewalls and routing still matter.

### LoadBalancer

```yaml
type: LoadBalancer
```

In a cloud, the provider provisions a load balancer. In a local cluster, an implementation such as MetalLB may assign an address. Inspect the Service status for the external address.

### ExternalName

Returns a CNAME. It does not create endpoints or proxy traffic. DNS resolution is delegated to the target name.

## DNS behavior

CoreDNS creates records for Services and endpoints. The Pod's `/etc/resolv.conf` contains search domains and `ndots`.

```bash
kubectl run dns --image=busybox:1.36 --rm -it --restart=Never -- nslookup web.study
kubectl run dns --image=busybox:1.36 --rm -it --restart=Never -- nslookup web.study.svc.cluster.local
```

Short names work because of the search path, not because every Service has a globally unique name.

## Headless Services

Set `clusterIP: None` when clients need to discover individual Pods rather than a virtual IP. DNS returns Pod addresses. StatefulSets commonly use a headless Service for stable per-Pod DNS names.

## Network path checklist

1. Pod Ready?
2. Labels match Service selector?
3. EndpointSlice populated?
4. `targetPort` correct?
5. NetworkPolicy allows traffic?
6. DNS resolves?
7. For NodePort/LoadBalancer, is the external path reachable?

## Service debugging commands

```bash
kubectl describe svc web
kubectl get endpointslice -l kubernetes.io/service-name=web
kubectl run client --image=busybox:1.36 --rm -it --restart=Never -- sh
# inside: nslookup web; wget -qO- http://web
kubectl port-forward svc/web 8080:80
```

`kubectl port-forward` proves the Service and Pod path from your machine without depending on external networking.

> **Exam lens.** Know how to create a Service imperatively, inspect endpoints, and explain why a Service exists but does not work. Most failures are wiring, not CNI.

## Design for discovery

Give ports clear names. Keep selectors minimal and consistent with workload labels. Use headless Services only when clients actually need Pod-level discovery.
