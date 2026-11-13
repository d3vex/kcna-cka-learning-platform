# NetworkPolicy: default deny to precise allow

Kubernetes networking is allow-by-default unless a NetworkPolicy selects a Pod. The safe pattern is default deny, then explicit allow for required flows.

## The selection rule

A NetworkPolicy selects Pods in its namespace with `podSelector`. If no policy selects a Pod, all traffic is allowed. Once a policy selects a Pod for a direction, only allowed traffic in that direction passes.

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-ingress
spec:
  podSelector: {}
  policyTypes: [Ingress]
```

`podSelector: {}` selects every Pod in the namespace. With no ingress rules, all ingress is denied.

## Allow frontend to backend

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: frontend-to-backend
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes: [Ingress]
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: frontend
      ports:
        - protocol: TCP
          port: 80
```

The `from` selector is evaluated in the same namespace unless `namespaceSelector` is also present. This trips up many manifests.

## Namespace and combined selectors

```yaml
from:
  - namespaceSelector:
      matchLabels:
        team: payments
    podSelector:
      matchLabels:
        app: api
```

Within one `from` element, the selectors are ANDed. Separate list elements are ORed.

## Egress

Egress policy is separate. DNS is a common accidental casualty.

```yaml
policyTypes: [Egress]
egress:
  - to:
      - namespaceSelector:
          matchLabels:
            kubernetes.io/metadata.name: kube-system
    ports:
      - protocol: UDP
        port: 53
      - protocol: TCP
        port: 53
```

If you deny all egress, allow DNS to kube-system and the specific destinations the app needs. Otherwise resolution fails before the HTTP request is attempted.

## Enforcement depends on the CNI

NetworkPolicy is an API contract. The CNI plugin must enforce it. A cluster can accept the object and still allow all traffic if the plugin does not implement policy. Verify with real connectivity tests.

```bash
kubectl get networkpolicy -A
kubectl describe networkpolicy default-deny-ingress
kubectl run client --image=busybox:1.36 --rm -it --restart=Never -- wget -qO- --timeout=2 http://backend
```

## Testing matrix

For each policy change, test:

- allowed source to allowed destination
- allowed source to a different port
- unrelated Pod to protected destination
- DNS from a protected Pod
- ingress controller to backend, if applicable

## Policy design principles

- Start with default deny in both directions in a dedicated namespace.
- Allow DNS explicitly.
- Name policies by intent, not by implementation detail.
- Keep selectors aligned with workload labels.
- Document the intended flow next to the policy.

> **Exam lens.** Be able to write a default-deny policy and a specific allow rule, and explain that a policy with no rules denies all selected traffic for that direction.

## Avoid policy theater

A policy that selects nothing, uses the wrong namespace or is not enforced provides false confidence. Verify with traffic, not with `kubectl apply` output.
