# From commit to cluster

A cloud native delivery pipeline turns a source change into a running, observable artifact. The exact tools vary; the stages and controls do not.

## The delivery chain

1. **Build**: compile, test and produce an immutable artifact, usually a container image.
2. **Scan**: check dependencies, image layers and configuration for known risks.
3. **Publish**: push the image to a registry and record its digest.
4. **Render**: combine the image reference with environment-specific configuration.
5. **Deploy**: apply the resulting manifests through a controlled mechanism.
6. **Verify**: wait for readiness, run smoke tests and watch error rates.
7. **Observe**: keep metrics, logs and traces attached to the release.

A pipeline that stops at "kubectl apply succeeded" has not verified that the software works.

## Immutable references

Tags are convenient and mutable. Digests are exact.

```text
registry.example.com/team/app:1.4.2
registry.example.com/team/app@sha256:...
```

A deployment should be traceable to a commit and a build. If the tag can change without a new deployment record, rollback and audit become unreliable.

## Rendering configuration

**Helm** packages Kubernetes resources into a chart with templates, values and release history. It is useful when you need parameterized packaging and lifecycle operations.

```bash
helm template web ./chart -f values-prod.yaml
helm upgrade --install web ./chart -f values-prod.yaml
helm history web
helm rollback web 1
```

**Kustomize** overlays patches on a base manifest without templates. It is built into kubectl.

```bash
kubectl kustomize overlays/prod
kubectl apply -k overlays/prod
```

Both approaches produce Kubernetes YAML. Choose based on the team's needs, not novelty. Avoid mixing three rendering systems in one small service.

## GitOps

In a GitOps model, the desired cluster state lives in Git. An agent reconciles the cluster to that state. Changes are reviewed as pull requests, and drift becomes visible.

The important property is not the tool. It is that the deployed state has a reviewable source of truth and a reconciliation loop.

## Progressive delivery

Instead of replacing every instance at once, release gradually:

- canary: send a small slice of traffic to the new version
- blue/green: run two environments and switch traffic
- feature flags: separate deployment from release
- automated rollback: act on error-rate or latency signals

Kubernetes' native rolling update is the simplest form. It preserves availability by starting new Pods before removing old ones.

> **Exam lens.** Know that Helm and Kustomize render manifests, that GitOps is a reconciliation model, and that a rollout can be complete while the application is still unhealthy if readiness is misconfigured.

## A delivery checklist

- Is the artifact immutable and traceable?
- Is configuration external to the image?
- Are secrets injected securely?
- Does the pipeline wait for readiness?
- Can you roll back without rebuilding?
- Do you know which signals would trigger a rollback?
