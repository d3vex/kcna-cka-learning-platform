# Storage from emptyDir to PVC

Containers are ephemeral. Their writable layer disappears when the container is replaced. Kubernetes volumes decouple data lifetime from container lifetime, but not every volume is persistent.

## Volume types by purpose

- **emptyDir**: created when a Pod is assigned to a node, deleted when the Pod is removed. Useful for scratch space and sharing files between containers.
- **hostPath**: mounts a path from the node. Ties data to one node and is risky in multi-tenant clusters.
- **configMap / secret**: projects configuration into files. Read-only from the Pod's perspective.
- **persistentVolumeClaim**: requests durable storage from a provisioner.
- **CSI volumes**: provider-specific storage through the Container Storage Interface.

```yaml
volumes:
  - name: cache
    emptyDir: {}
  - name: config
    configMap:
      name: app-config
```

## The PV and PVC relationship

A PersistentVolume (PV) is cluster-scoped storage. A PersistentVolumeClaim (PVC) is a namespaced request for storage with a size and access mode. A claim binds to a volume that satisfies it.

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: data
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
```

A Pod references the claim, not the volume:

```yaml
volumes:
  - name: data
    persistentVolumeClaim:
      claimName: data
```

## Access modes

- **ReadWriteOnce (RWO)**: mounted read-write by a single node. Multiple Pods on that node may share it depending on the driver.
- **ReadOnlyMany (ROX)**: mounted read-only by many nodes.
- **ReadWriteMany (RWX)**: mounted read-write by many nodes. Requires a filesystem that supports it.
- **ReadWriteOncePod (RWOP)**: mounted read-write by a single Pod.

Access mode is a capability, not a guarantee that every storage backend implements it.

## StorageClasses and dynamic provisioning

A StorageClass names a provisioner and parameters. When a PVC requests that class, the provisioner creates a matching PV automatically.

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast
provisioner: ebs.csi.aws.com
parameters:
  type: gp3
reclaimPolicy: Delete
volumeBindingMode: WaitForFirstConsumer
```

`WaitForFirstConsumer` delays binding until a Pod is scheduled, so the volume can be created in the right zone. `Immediate` binds as soon as the claim is created.

## Reclaim policy

- **Delete**: the PV and its backing storage are removed when the claim is deleted.
- **Retain**: the PV remains and must be cleaned up manually.
- **Recycle**: deprecated; do not depend on it.

For production data, choose the policy deliberately. A default `Delete` class makes experimentation convenient and accidental data loss easy.

> **Exam lens.** Know which object is namespaced versus cluster-scoped, and be able to explain why a PVC can remain Pending because no PV matches its size, class or access mode.

## The practical rule

Use `emptyDir` for caches and scratch data, ConfigMaps/Secrets for configuration, and PVCs for anything that must outlive a Pod. Check the StorageClass, access mode and reclaim policy before you trust it with data.
