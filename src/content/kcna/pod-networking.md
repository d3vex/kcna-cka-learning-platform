# Pod networking and Services

Kubernetes networking starts with a simple contract: every Pod gets an IP address, and every Pod can reach every other Pod without NAT. A CNI plugin implements that contract.

## The flat network

The CNI plugin assigns addresses and programs routes or overlays. Pod-to-Pod traffic is direct from the cluster's perspective, even when the physical network requires encapsulation.

Pods are ephemeral. Their IPs change when they are recreated. Applications should not depend on Pod IPs directly.

## Services provide stable virtual addresses

A Service selects Pods by label and gives clients a stable ClusterIP and DNS name. Endpoints (or EndpointSlices) track the ready Pods behind it.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web
spec:
  selector:
    app: web
  ports:
    - port: 80
      targetPort: 8080
```

Traffic to `web:80` is translated to a ready Pod on port 8080.

### Service types

- **ClusterIP**: reachable inside the cluster. The default and the right choice for most internal services.
- **NodePort**: opens a port on every node. Useful for simple external access and labs.
- **LoadBalancer**: asks the cloud provider or an implementation such as MetalLB for an external load balancer.
- **ExternalName**: returns a DNS CNAME; no proxy or endpoints.

```bash
kubectl expose deployment web --port=80 --target-port=8080
kubectl get svc,endpointslice
```

If a Service has no endpoints, check the selector, Pod readiness and port names before changing the Service type.

## DNS

CoreDNS watches Services and creates DNS records. A Service named `web` in namespace `study` is reachable as:

- `web` from the same namespace
- `web.study` from other namespaces
- `web.study.svc.cluster.local` as the fully qualified name

Pods use the cluster DNS configuration in `/etc/resolv.conf`. ndots and search domains explain why short names work.

```bash
kubectl run dns --image=busybox:1.36 --rm -it --restart=Never -- nslookup web.study
```

## Ingress is not a Service type

An Ingress is an HTTP routing resource. It needs an Ingress controller and usually a Service behind it. It can route by host and path, terminate TLS and apply annotations for controller-specific behavior.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web
spec:
  rules:
    - host: study.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: web
                port:
                  number: 80
```

The Gateway API is the newer, role-oriented family of resources for similar traffic management. Know the concept even if you are not asked to write a full Gateway manifest.

## Trace the path

When traffic fails, follow the path in order:

1. Is the Pod Ready?
2. Does the Service selector match the Pod labels?
3. Does the Service port map to the correct `targetPort`?
4. Are EndpointSlices populated?
5. Does DNS resolve?
6. Does a NetworkPolicy or ingress layer block the traffic?

> **Exam lens.** Empty endpoints and selector mismatches are far more common than broken CNI plugins. Check the simple wiring first.
