# Deployments, rollouts and rollbacks

A Deployment manages ReplicaSets and gives you declarative updates. The important skills are controlling the pace of change and proving the result.

## The object graph

```text
Deployment -> ReplicaSet -> Pods
```

When you change the Pod template, the Deployment creates a new ReplicaSet. It scales the new one up and the old one down according to the rollout strategy.

```bash
kubectl get deployment,replicaset,pod -l app=web
kubectl rollout history deployment/web
kubectl rollout status deployment/web --timeout=120s
```

## A production-shaped manifest

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 3
  revisionHistoryLimit: 5
  minReadySeconds: 5
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: nginx
          image: nginx:1.27
          ports:
            - containerPort: 80
          readinessProbe:
            httpGet:
              path: /
              port: 80
            periodSeconds: 5
```

`maxUnavailable: 0` with `maxSurge: 1` preserves full capacity during a rollout. It requires room for one extra Pod.

## Update and record intent

```bash
kubectl set image deployment/web nginx=nginx:1.28
kubectl annotate deployment/web kubernetes.io/change-cause="upgrade to nginx 1.28"
kubectl rollout status deployment/web
```

Set the change cause before or immediately after the change. Revision history without intent is just a list of hashes.

## When a rollout stalls

```bash
kubectl rollout status deployment/web
kubectl describe deployment web
kubectl get rs -l app=web
kubectl describe pod <new-pod>
kubectl logs <new-pod>
```

Common causes: image pull failure, readiness probe failure, insufficient capacity, invalid config, or a crash loop. The old ReplicaSet often remains healthy, so users may not notice while the new revision is stuck.

## Rollback

```bash
kubectl rollout undo deployment/web
kubectl rollout undo deployment/web --to-revision=2
```

Rollback creates a new revision from the older template. It is not a time machine: external side effects, database migrations and configuration changes may not reverse.

## Pause and resume

```bash
kubectl rollout pause deployment/web
# make several template changes
kubectl rollout resume deployment/web
```

Pausing prevents intermediate revisions from rolling out while you assemble a larger change. Do not forget to resume; a paused Deployment will not progress.

## Jobs and CronJobs

Not every workload is long-running. A Job runs to completion; a CronJob schedules Jobs. Set `backoffLimit`, `activeDeadlineSeconds` and concurrency policy deliberately.

```bash
kubectl create job backup --image=busybox:1.36 -- sh -c 'echo backup complete'
kubectl get jobs
```

> **Exam lens.** Be able to set an image, check rollout status, inspect ReplicaSets, roll back, and explain why old Pods remain during a failed rolling update.

## Verify the user-visible outcome

A Deployment reporting complete is necessary, not sufficient. Check readiness, Service endpoints, logs and a real request. That is the difference between "the controller is happy" and "the application works."
