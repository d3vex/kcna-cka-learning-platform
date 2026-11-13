# Helm, Kustomize and extension points

Administrators rarely install every component by hand. They use packaging and configuration tools, then extend the API when the built-in objects are not enough.

## Helm: package and release management

A Helm chart contains templates, default values, metadata and dependencies. A release is an installed instance with revision history.

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
helm search repo bitnami/nginx
helm show values bitnami/nginx > values.yaml
helm template web bitnami/nginx -f values.yaml > rendered.yaml
helm upgrade --install web bitnami/nginx -n web --create-namespace -f values.yaml
helm list -A
helm history web -n web
helm rollback web 1 -n web
```

Use `helm template` and `helm diff` before applying changes. Helm stores release metadata as Secrets by default. Protect that namespace and its secrets.

## Kustomize: overlay without templates

Kustomize is built into kubectl. A base contains resources; overlays patch them.

```text
base/deployment.yaml
base/kustomization.yaml
overlays/prod/kustomization.yaml
overlays/prod/replicas.yaml
```

```yaml
# overlays/prod/kustomization.yaml
resources:
  - ../../base
patches:
  - path: replicas.yaml
images:
  - name: registry.example.com/app
    newTag: "1.4.2"
```

```bash
kubectl kustomize overlays/prod
kubectl apply -k overlays/prod
```

Kustomize is a good fit when the manifest shape is stable and differences are small. Helm is stronger when packaging and parameterized distributions matter.

## CRDs and operators

A CustomResourceDefinition registers a new kind with the API server. The CRD provides schema, validation, versioning and scope. It does not implement behavior.

An operator is a controller that watches custom resources and reconciles them. For example, a database operator might create StatefulSets, Services, backups and credentials from one custom resource.

```bash
kubectl get crd
kubectl explain <custom-kind>
kubectl get <custom-resource> -A
```

When installing an operator, read its CRDs and RBAC. An operator often needs broad cluster permissions; treat that as a security decision.

## Extension interfaces

- **CNI**: pod network setup and IP management
- **CSI**: storage provisioning and attach/mount operations
- **CRI**: container runtime interface used by kubelet
- **Scheduler extender / scheduler framework**: custom scheduling logic
- **Admission webhooks**: mutate or validate API requests
- **API aggregation**: extend the API with additional servers

## Installing cluster components safely

1. Read the chart or manifest and the RBAC it creates.
2. Render and diff before applying.
3. Pin versions and image digests where possible.
4. Install into a dedicated namespace with resource limits.
5. Verify CRDs, webhooks and pods are healthy.
6. Record how to upgrade and remove it.

> **Exam lens.** Know the difference between a CRD and an operator, how to render Helm/Kustomize output, and where extension interfaces sit in the request or storage path.

## Avoid configuration sprawl

One rendering approach per component is easier to reason about than three. If Helm owns a component, do not also patch it with Kustomize unless the layering is explicit and tested.
