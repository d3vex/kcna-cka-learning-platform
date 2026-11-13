# Configuration with ConfigMaps and Secrets

Configuration should be data, not a rebuilt image. Kubernetes provides ConfigMaps for non-sensitive data and Secrets for sensitive data, with several injection paths.

## ConfigMap creation

```bash
kubectl create configmap app-config \
  --from-literal=mode=production \
  --from-literal=log.level=info

kubectl create configmap app-files \
  --from-file=app.properties \
  --from-file=config/
```

A ConfigMap holds UTF-8 data. `binaryData` handles other content. Size limits apply; do not use a ConfigMap as a database.

## Injection patterns

### Environment variables

```yaml
env:
  - name: APP_MODE
    valueFrom:
      configMapKeyRef:
        name: app-config
        key: mode
envFrom:
  - configMapRef:
      name: app-config
```

Invalid keys can prevent a container from starting. Prefer explicit keys when the application expects a specific environment.

### Volume mounts

```yaml
volumes:
  - name: config
    configMap:
      name: app-files
containers:
  - name: app
    volumeMounts:
      - name: config
        mountPath: /etc/app
        readOnly: true
```

A projected volume updates eventually after the ConfigMap changes. The kubelet sync period and cache TTL affect timing. Applications must watch or re-read the file; many read configuration only at startup.

### Command arguments

```yaml
args:
  - --config=/etc/app/app.properties
```

This is often cleaner than mapping many environment variables.

## Secrets

```bash
kubectl create secret generic db-creds \
  --from-literal=username=app \
  --from-literal=password='change-me'
```

Secrets are base64-encoded in the API representation, not encrypted by default. Encryption at rest and restrictive RBAC are separate controls. Avoid committing Secret manifests to Git; use a secret manager or sealed-secret workflow.

Mounting a Secret creates files with the configured mode. Environment variables are convenient but leak more easily into logs, crash dumps and process environments.

## Immutable configuration

Set `immutable: true` when the data should never change. This prevents accidental updates and reduces API server watch load. To change it, create a new object with a new name and roll the workload.

## Update behavior

- **env / envFrom**: container must be recreated.
- **mounted volume**: file content changes eventually; application behavior depends on re-reading.
- **subPath mount**: does not receive updates.

```bash
kubectl rollout restart deployment/web
kubectl rollout status deployment/web
```

A checksum annotation on the Pod template is a common way to force a rollout when configuration changes.

## Debugging configuration

```bash
kubectl get configmap app-config -o yaml
kubectl get secret db-creds -o jsonpath='{.data.password}' | base64 -d
kubectl exec <pod> -- env | sort
kubectl exec <pod> -- cat /etc/app/app.properties
```

> **Exam lens.** Know the difference between volume projection and environment injection, why a Secret is not automatically encrypted, and how to force a restart after config changes.

## Keep the boundary clean

Configuration belongs outside the image. Secrets belong outside Git. The application should fail clearly when required configuration is missing, not silently start with a dangerous default.
