# RBAC: identity, roles and bindings

Role-Based Access Control answers one question: may this identity perform this verb on this resource in this scope? Everything else is plumbing.

## The four objects

| Object | Scope | Purpose |
| --- | --- | --- |
| Role | Namespace | A set of permissions |
| ClusterRole | Cluster | Cluster-wide or reusable permissions |
| RoleBinding | Namespace | Grants a Role or ClusterRole in one namespace |
| ClusterRoleBinding | Cluster | Grants a ClusterRole across the cluster |

A RoleBinding can reference a ClusterRole. This is how you reuse a standard permission set while limiting it to a namespace.

## A minimal Role

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: team-a
  name: deployment-reader
rules:
  - apiGroups: ["apps"]
    resources: ["deployments"]
    verbs: ["get", "list", "watch"]
```

Rules are additive. There are no deny rules in RBAC. If a permission is granted by any binding, the request is allowed.

## Binding to a workload identity

```bash
kubectl -n team-a create rolebinding deployer-binding \
  --role=deployer \
  --serviceaccount=team-a:deployer
```

The ServiceAccount's username is `system:serviceaccount:team-a:deployer`. Pods receive a projected token for that identity when `automountServiceAccountToken` is enabled.

## Test with impersonation

```bash
kubectl auth can-i get pods -n team-a --as=system:serviceaccount:team-a:deployer
kubectl auth can-i --list -n team-a --as=system:serviceaccount:team-a:deployer
kubectl auth whoami
```

`can-i` is a fast, safe authorization test. It does not prove that the workload's token is mounted or that the API path is reachable.

## Common mistakes

- Binding a ClusterRole with a ClusterRoleBinding when namespace scope was intended.
- Granting `*` verbs because the exact list was inconvenient.
- Using the `default` ServiceAccount for everything.
- Forgetting that custom resources need both the API group and resource name.
- Assuming a user in a kubeconfig is the same identity as a Pod's ServiceAccount.

## Aggregated ClusterRoles

Controllers can aggregate rules from other ClusterRoles using labels. This is common for built-in roles such as `admin`, `edit` and `view`. When debugging an unexpected permission, inspect the aggregate:

```bash
kubectl describe clusterrole admin
kubectl get clusterrole admin -o yaml
```

## Principle of least privilege

Start with no permissions and add the smallest set that satisfies the task. Separate human identities from workload identities. Use groups for teams, and audit bindings regularly.

> **Exam lens.** Be able to write a Role and RoleBinding from memory, test it with `--as`, and explain why a namespaced RoleBinding to a ClusterRole is not cluster-wide.
