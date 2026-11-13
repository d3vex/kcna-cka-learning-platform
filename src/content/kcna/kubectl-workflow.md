# kubectl, manifests and namespaces

`kubectl` is a client for the Kubernetes API. It reads a kubeconfig, selects a cluster and identity, serializes your request and prints the response. Everything else is API behavior.

## Contexts are a safety feature

A kubeconfig can contain many clusters, users and contexts. The current context decides which cluster receives your command.

```bash
kubectl config get-contexts
kubectl config current-context
kubectl config use-context kind-study
```

Production mistakes often start with an unexamined context. Make it a habit to confirm the context and namespace before destructive work.

```bash
kubectl config set-context --current --namespace=study
kubectl get pods
```

## Imperative versus declarative

Imperative commands are useful for discovery and quick experiments:

```bash
kubectl create deployment web --image=nginx:1.27 --replicas=2
kubectl expose deployment web --port=80
kubectl scale deployment web --replicas=3
```

Declarative manifests are the durable form. They can be reviewed, versioned, diffed and applied repeatedly.

```bash
kubectl create deployment web --image=nginx:1.27 --replicas=2 \
  --dry-run=client -o yaml > web.yaml
kubectl apply -f web.yaml
kubectl diff -f web.yaml
```

`--dry-run=client` generates YAML without contacting the server. `--dry-run=server` sends the request through API validation and admission but does not persist it. The server variant catches more problems, including policy rejection and defaulting.

## Read the object, not just the table

Default output is a summary. When troubleshooting, ask for the full object or a precise field.

```bash
kubectl get deployment web -o yaml
kubectl get pod web-abc -o jsonpath='{.status.phase}{"\n"}'
kubectl describe pod web-abc
kubectl get events --sort-by=.lastTimestamp
```

`describe` aggregates related information and events. It is excellent for a first pass. JSON and JSONPath are better when you need an exact value or want to script a check.

## Labels and selectors

Labels are arbitrary key-value metadata. Selectors turn labels into queries. Services, Deployments, NetworkPolicies and many other objects rely on them.

```bash
kubectl label deployment web tier=frontend
kubectl get pods -l app=web,tier=frontend
kubectl get all -n study
```

A selector mismatch is a classic cause of an empty Service endpoint list. The object exists, but it is not selecting what you think it is.

## Namespaces

Namespaces organize namespaced resources. They are not automatically isolated networks or security domains.

```bash
kubectl create namespace study
kubectl get pods -n study
kubectl get pods -A
kubectl api-resources --namespaced=true
```

Use `-n` explicitly in scripts. Relying on the current namespace is convenient interactively and dangerous in automation.

> **Exam lens.** Know the difference between `create` and `apply`, client and server dry-run, and how to produce a manifest from an imperative command. These small details appear constantly in Kubernetes work.

## A clean loop

1. Confirm context and namespace.
2. Generate or edit a manifest.
3. Validate with server-side dry-run.
4. Apply and wait for rollout.
5. Inspect status, events and logs.
6. Record the change in version control.

That loop is more valuable than memorizing every flag. The flags change; the loop does not.
