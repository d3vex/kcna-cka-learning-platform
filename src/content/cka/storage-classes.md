# StorageClasses and dynamic provisioning

A StorageClass turns a PVC into infrastructure. It names a provisioner, passes parameters and defines binding and reclaim behavior.

## The object

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast
provisioner: ebs.csi.aws.com
parameters:
  type: gp3
  encrypted: "true"
reclaimPolicy: Delete
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true
```

The provisioner is a CSI driver or an in-tree/out-of-tree implementation. The parameters are specific to it.

## Default class

One StorageClass can be annotated as the default:

```bash
kubectl get storageclass
kubectl patch storageclass standard \
  -p '{"metadata":{"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
```

A PVC without `storageClassName` uses the default. Set `storageClassName: ""` to opt out and force static binding.

## Binding modes

### Immediate

The volume is provisioned as soon as the PVC is created. This can create a volume in the wrong zone before the Pod is scheduled.

### WaitForFirstConsumer

Provisioning waits until a Pod consumes the claim. The scheduler's topology decision informs the volume's location. This is the safer default for zonal storage.

```bash
kubectl get pvc data -o jsonpath='{.spec.volumeBindingMode}'
kubectl get pvc data
```

A Pending PVC under `WaitForFirstConsumer` is expected until a Pod is scheduled.

## Reclaim policies

- **Delete**: remove the PV and backing volume when the PVC is deleted.
- **Retain**: keep the PV and data. The PV becomes Released and needs manual intervention.
- **Recycle**: deprecated.

Check the policy on the class and the resulting PV:

```bash
kubectl get pv <pv> -o jsonpath='{.spec.persistentVolumeReclaimPolicy}'
```

## Expansion

With `allowVolumeExpansion: true`, increase the PVC request:

```bash
kubectl patch pvc data -p '{"spec":{"resources":{"requests":{"storage":"10Gi"}}}}'
```

The CSI driver must support expansion. Some volume types require a Pod restart or filesystem resize. Shrinking is not supported.

## Topology and scheduling

A PV may be bound to a zone or node. If a Pod schedules into a different zone, attach fails. Use `WaitForFirstConsumer` and node affinity in the StorageClass when the backend is zonal.

```yaml
allowedTopologies:
  - matchLabelExpressions:
      - key: topology.kubernetes.io/zone
        values: [zone-a, zone-b]
```

## Troubleshooting provisioning

```bash
kubectl describe pvc <pvc>
kubectl get events --field-selector involvedObject.name=<pvc>
kubectl get pods -n kube-system | grep -E 'csi|provisioner'
kubectl get csidrivers
```

Look for missing drivers, failed provisioning events and topology conflicts. A `ProvisioningFailed` event usually names the reason.

> **Exam lens.** Be able to create a StorageClass, explain `WaitForFirstConsumer`, and predict what happens to data under `Delete` versus `Retain`.

## Choose the policy before the data exists

Retention, encryption and backup are not things to add after an incident. Encode them in the StorageClass and the operational runbook, then test a restore.
