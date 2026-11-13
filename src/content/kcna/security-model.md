# The cloud native security model

Security is not a single product you install. It is a set of boundaries around identity, code, runtime and infrastructure. The four Cs give you a useful map.

## The four Cs

- **Cloud**: the provider's physical and virtual infrastructure, IAM and network controls.
- **Cluster**: API access, RBAC, admission, secrets, node hardening and audit.
- **Container**: image provenance, least privilege, read-only filesystems and vulnerability scanning.
- **Code**: application authentication, input validation, dependencies and secure defaults.

A weakness at any layer can undermine the others. A signed image does not help if the cluster lets anonymous users create privileged Pods.

## Authentication, authorization, admission

Every API request follows a sequence:

1. **Authentication** asks who you are. Kubernetes supports client certificates, bearer tokens, service account tokens and external identity integrations.
2. **Authorization** asks whether this identity may perform the verb on the resource. RBAC is the standard mechanism.
3. **Admission** can mutate or reject the request after authorization. Examples include Pod Security admission, resource quotas and policy engines.

```bash
kubectl auth can-i get pods
kubectl auth can-i delete secrets --as=system:serviceaccount:secure:reader -n secure
```

## RBAC in four objects

- **Role**: permissions inside a namespace.
- **ClusterRole**: cluster-scoped permissions or reusable permission sets.
- **RoleBinding**: grants a Role or ClusterRole inside a namespace.
- **ClusterRoleBinding**: grants a ClusterRole across the cluster.

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-reader
  namespace: secure
rules:
  - apiGroups: [""]
    resources: ["pods"]
    verbs: ["get", "list"]
```

Avoid wildcards for verbs and resources. Prefer a dedicated ServiceAccount per workload instead of sharing the default one.

## Workload identity and secrets

A ServiceAccount gives a Pod an identity. Modern clusters can project short-lived tokens with an audience and expiry rather than long-lived Secret tokens.

A Secret is base64-encoded data, not encrypted by default. Anyone who can read the Secret can decode it. Use encryption at rest, restrictive RBAC and an external secret manager for sensitive production material.

## Network and runtime isolation

By default, Pods can often reach each other freely. A NetworkPolicy can select Pods and define allowed ingress and egress. The policy is only effective if the CNI plugin enforces it.

At runtime, reduce blast radius:

- Run as non-root and drop unnecessary capabilities.
- Use a read-only root filesystem where possible.
- Set resource limits.
- Use Pod Security Standards: privileged, baseline or restricted.
- Keep images minimal and patched.

> **Exam lens.** If a request is denied, separate identity from permission. First confirm who the request is authenticated as, then check the Role and binding scope.

## A practical checklist

1. Who can reach the API?
2. What can each identity do?
3. What can each workload reach over the network?
4. What code is actually running, and where did it come from?
5. What would an attacker gain from one compromised container?

Security is the practice of shrinking those answers until the blast radius is acceptable.
