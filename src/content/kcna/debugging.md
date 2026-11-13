# Debugging a broken deployment

A Deployment failure is rarely a single mystery. It is a stage in a sequence: scheduling, image pull, container start, readiness, service routing. Identify the stage before you change anything.

## Read the rollout

```bash
kubectl rollout status deployment/web
kubectl rollout history deployment/web
kubectl get deployment web -o wide
kubectl get replicasets -l app=web
```

A Deployment creates a new ReplicaSet for each revision. The old ReplicaSet remains at its previous scale while the new one progresses. This is why a failed rollout often leaves healthy old Pods in place.

## Failure taxonomy

### 1. The Pod is Pending

The scheduler could not place it. Check requests, node selectors, affinity, taints and capacity.

```bash
kubectl describe pod <pod> | sed -n '/Events/,$p'
```

### 2. The image cannot be pulled

The Pod may show `ErrImagePull` or `ImagePullBackOff`. Check the exact image reference, registry authentication and network access.

```bash
kubectl get pod <pod> -o jsonpath='{.spec.containers[*].image}'
kubectl get events --field-selector involvedObject.name=<pod>
```

### 3. The container starts and exits

`CrashLoopBackOff` usually means the process fails, the command is wrong, configuration is missing or a dependency is unavailable.

```bash
kubectl logs <pod> --previous
kubectl describe pod <pod>
kubectl get pod <pod> -o jsonpath='{.status.containerStatuses[*].lastState}'
```

### 4. The container runs but never becomes Ready

The readiness probe is failing, or the application is not serving yet. Compare probe path, port, timing and application logs.

```bash
kubectl get pod <pod> -o jsonpath='{.status.containerStatuses[*].ready}'
kubectl describe pod <pod> | sed -n '/Readiness/,/Events/p'
```

### 5. The Pod is Ready but users see errors

Move outward: Service selector, endpoints, targetPort, NetworkPolicy, Ingress and the application's own dependencies.

```bash
kubectl get endpointslice -l kubernetes.io/service-name=web
kubectl get svc web -o yaml
```

## Change control during an incident

- Prefer rollback over speculative edits when the previous revision was healthy.
- Make one change at a time.
- Watch new events, not just the old error.
- Check whether the fix introduces a second failure.

```bash
kubectl rollout undo deployment/web
kubectl rollout status deployment/web
kubectl get pods -l app=web -o wide
```

> **Exam lens.** A rollout can be "waiting" for reasons that have nothing to do with the image. Read events and container states before assuming the build is bad.

## Write it down

A useful incident record has: symptom, impact, timeline, evidence, root cause, fix, and the test that proves recovery. This habit is what turns troubleshooting from intuition into a repeatable skill.
