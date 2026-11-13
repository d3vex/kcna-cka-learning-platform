# Volumes, PVs and PVCs

Persistence in Kubernetes has three layers: the Pod's volume mount, the claim, and the backing storage. Each layer can fail independently.

## Ephemeral volumes

```yaml
volumes:
  - name: cache
    emptyDir: {}
```

`emptyDir` lives for the Pod's lifetime on a node. It is suitable for scratch space and shared files between containers. It is not durable storage. An `emptyDir.medium: Memory` uses tmpfs and counts against memory.

## Projected configuration

ConfigMaps and Secrets can be mounted as volumes. Updates are eventually reflected in the mounted files, except with `subPath`. The application must re-read them.

```yaml
volumes:
  - name: config
    configMap:
      name: app-config
      items:
        - key: app.properties
          path: application.properties
```

## PersistentVolume and PersistentVolumeClaim

A PV is a piece of storage. A PVC is a namespaced request. Binding matches capacity, access modes, storage class, volume mode and selectors.

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: data
spec:
  storageClassName: standard
  accessModes: [ReadWriteOnce]
  resources:
    requests:
      storage: 5Gi
```

```yaml
volumes:
  - name: data
    persistentVolumeClaim:
      claimName: data
```

## Access modes are not a locking mechanism

- RWO: single node read-write
- ROX: many nodes read-only
- RWX: many nodes read-write, backend dependent
- RWOP: single Pod read-write

RWO does not mean one Pod; multiple Pods on the same node can mount it. The storage driver determines the actual semantics.

## Why a PVC stays Pending

1. No PV matches capacity or access mode.
2. The StorageClass does not exist or has no provisioner.
3. The provisioner is unhealthy.
4. `WaitForFirstConsumer` is waiting for a Pod.
5. A selector is too restrictive.
6. Topology constraints prevent provisioning in the Pod's zone.

```bash
kubectl describe pvc data
kubectl get storageclass
kubectl get pods -n <provisioner-namespace>
kubectl get events --sort-by=.lastTimestamp
```

## Mount and permission failures

A Pod can be Running but unable to write because of filesystem permissions, SELinux, or a read-only mount. Check the container's user, the volume's `fsGroup`, and the mount options.

```bash
kubectl exec <pod> -- id
kubectl exec <pod> -- mount | grep data
kubectl describe pod <pod> | sed -n '/Volumes/,/Events/p'
```

## Multi-attach errors

An RWO volume attached to one node cannot generally be attached to another simultaneously. A rescheduled Pod may fail with a multi-attach error while the old attachment is releasing. Check the volume attachment objects and the storage provider's behavior.

```bash
kubectl get volumeattachment
kubectl describe pv <pv>
```

> **Exam lens.** Know the object scopes, the binding criteria and the difference between a Pod scheduling failure and a volume binding or attach failure.

## Data lifecycle

Decide before creating the claim: who owns the data, what happens on Pod deletion, what happens on claim deletion, and how it is backed up. Kubernetes will faithfully implement the policy you chose, including the destructive one.
