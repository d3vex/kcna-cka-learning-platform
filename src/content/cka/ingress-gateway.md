# Ingress, Gateway API and traffic flow

Ingress and the Gateway API expose HTTP services beyond the cluster. Neither is a Service type, and neither works without a controller or implementation.

## Ingress in one minute

An Ingress declares host and path routing. An Ingress controller watches Ingress resources and configures a proxy such as nginx, Envoy or HAProxy.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: study
spec:
  ingressClassName: nginx
  rules:
    - host: study.example.com
      http:
        paths:
          - path: /app
            pathType: Prefix
            backend:
              service:
                name: app
                port:
                  number: 80
```

```bash
kubectl get ingress
kubectl describe ingress study
kubectl get pods -n ingress-nginx
kubectl get svc -n ingress-nginx
```

If the Ingress has no address, the controller is missing, not ready or has no external IP.

## TLS

Ingress TLS references a Secret containing `tls.crt` and `tls.key` in the same namespace.

```yaml
tls:
  - hosts: [study.example.com]
    secretName: study-tls
```

cert-manager can issue and renew certificates. The Secret must exist and be valid; an expired certificate produces browser or client errors, not Kubernetes events.

## Path types

- `Exact`: exact path match
- `Prefix`: path element prefix match
- `ImplementationSpecific`: controller-defined

Use `Prefix` deliberately. `/app` does not automatically mean `/apple` under all controllers; behavior is defined by path semantics.

## Gateway API

The Gateway API splits responsibilities:

- **GatewayClass**: infrastructure implementation
- **Gateway**: listener, address and TLS configuration
- **HTTPRoute**: host/path routing to Services
- **ReferenceGrant**: allows cross-namespace references

This separation lets infrastructure teams own the Gateway and application teams own routes. Implementations include Envoy Gateway, Cilium, NGINX Gateway Fabric and cloud controllers.

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: study
spec:
  parentRefs:
    - name: public
  rules:
    - matches:
        - path:
            type: PathPrefix
            value: /app
      backendRefs:
        - name: app
          port: 80
```

## Diagnosing HTTP routing

Work outside-in:

1. Does the hostname resolve to the controller's address?
2. Is the controller pod ready?
3. Does the Ingress/Gateway show an address and accepted status?
4. Does the backend Service have endpoints?
5. Does the backend respond directly via port-forward?
6. Are TLS, host and path rules correct?
7. Is a NetworkPolicy blocking controller-to-Pod traffic?

```bash
curl -v -H 'Host: study.example.com' http://<address>/app
kubectl port-forward svc/app 8080:80
curl -v http://localhost:8080/
```

## Controller-specific behavior

Annotations, rewrite rules and timeouts often depend on the controller. Read the controller's documentation instead of assuming ingress-nginx annotations work in another implementation.

> **Exam lens.** Be able to create an Ingress for two hosts or paths, explain the controller dependency, and check Service endpoints before blaming the Ingress.

## Choose the stable layer

For simple HTTP routing, Ingress is widely supported. For role separation and richer routing, Gateway API is the direction. Do not deploy both for the same hostname without a clear traffic ownership model.
