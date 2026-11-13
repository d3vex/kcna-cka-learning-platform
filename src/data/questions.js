export const kcnaQuestions = [
  {
    id: 'kcna-q001',
    domain: 'fundamentals',
    difficulty: 'easy',
    question: 'Which component watches for the difference between desired and observed state?',
    options: ['The kubelet', 'A controller in the controller manager', 'The CNI plugin', 'The container runtime'],
    answer: 1,
    explanation:
      'Controllers reconcile desired and observed state. The kubelet runs assigned Pods; it does not own the Deployment or ReplicaSet reconciliation loop.',
  },
  {
    id: 'kcna-q002',
    domain: 'fundamentals',
    difficulty: 'easy',
    question: 'What is the primary role of etcd in a Kubernetes cluster?',
    options: ['Serving the dashboard', 'Storing cluster state consistently', 'Routing Service traffic', 'Pulling container images'],
    answer: 1,
    explanation:
      'etcd is the consistent key-value store for cluster state. The API server reads and writes objects there.',
  },
  {
    id: 'kcna-q003',
    domain: 'fundamentals',
    difficulty: 'easy',
    question: 'What does the kube-scheduler do?',
    options: [
      'Starts containers on a node',
      'Chooses a node for a Pod that has not been assigned one',
      'Stores the kubeconfig',
      'Terminates completed Jobs',
    ],
    answer: 1,
    explanation:
      'The scheduler filters and scores nodes, then binds the Pod. The kubelet on the selected node starts the containers.',
  },
  {
    id: 'kcna-q004',
    domain: 'fundamentals',
    difficulty: 'medium',
    question: 'Which component is responsible for mounting volumes and running probes for a Pod?',
    options: ['kube-proxy', 'kubelet', 'kube-scheduler', 'CoreDNS'],
    answer: 1,
    explanation:
      'The kubelet is the node agent. It mounts volumes, starts containers through the runtime, runs probes and reports status.',
  },
  {
    id: 'kcna-q005',
    domain: 'fundamentals',
    difficulty: 'easy',
    question: 'What is the smallest unit Kubernetes schedules?',
    options: ['A container', 'A Pod', 'A Deployment', 'A namespace'],
    answer: 1,
    explanation:
      'A Pod is the smallest schedulable unit. It can contain one or more containers that share network and volume context.',
  },
  {
    id: 'kcna-q006',
    domain: 'fundamentals',
    difficulty: 'medium',
    question: 'A Deployment with three replicas creates which object to manage those replicas?',
    options: ['A DaemonSet', 'A ReplicaSet', 'A StatefulSet', 'A Job'],
    answer: 1,
    explanation:
      'The Deployment creates and manages a ReplicaSet, which in turn ensures the requested number of Pods exist.',
  },
  {
    id: 'kcna-q007',
    domain: 'fundamentals',
    difficulty: 'medium',
    question: 'Which object is cluster-scoped rather than namespaced?',
    options: ['Pod', 'PersistentVolume', 'ConfigMap', 'Service'],
    answer: 1,
    explanation:
      'PersistentVolumes are cluster-scoped. Pods, ConfigMaps and Services are namespaced resources.',
  },
  {
    id: 'kcna-q008',
    domain: 'fundamentals',
    difficulty: 'medium',
    question: 'What is the key difference between kubectl create and kubectl apply?',
    options: [
      'create can only create namespaces',
      'apply records and reconciles desired state from a manifest; create issues a one-time create request',
      'create works without a cluster',
      'apply cannot use YAML',
    ],
    answer: 1,
    explanation:
      'apply is declarative and tracks the applied configuration. create is imperative and fails if the object already exists.',
  },
  {
    id: 'kcna-q009',
    domain: 'fundamentals',
    difficulty: 'hard',
    question: 'What does kubectl apply --dry-run=server validate?',
    options: [
      'Only that the YAML is syntactically valid locally',
      'The request through API validation and admission without persisting the object',
      'Whether the Pod will become Ready',
      'Whether the image exists in the registry',
    ],
    answer: 1,
    explanation:
      'Server-side dry-run exercises API defaulting, validation and admission. It does not prove the workload will run successfully.',
  },
  {
    id: 'kcna-q010',
    domain: 'fundamentals',
    difficulty: 'easy',
    question: 'How does a Service identify the Pods behind it?',
    options: ['By Pod IP address', 'By matching labels through a selector', 'By container name', 'By node name'],
    answer: 1,
    explanation:
      'A Service selector matches Pod labels. Matching ready Pods are recorded in EndpointSlices.',
  },
  {
    id: 'kcna-q011',
    domain: 'fundamentals',
    difficulty: 'medium',
    question: 'What is the difference between a resource request and a limit?',
    options: [
      'Requests cap usage; limits reserve capacity',
      'Requests inform scheduling; limits cap runtime consumption',
      'They are identical in Kubernetes',
      'Limits only apply to memory',
    ],
    answer: 1,
    explanation:
      'The scheduler uses requests to place Pods. The runtime enforces limits, which can cause throttling or OOMKills.',
  },
  {
    id: 'kcna-q012',
    domain: 'fundamentals',
    difficulty: 'hard',
    question: 'A Pod receives the Guaranteed QoS class when which condition holds?',
    options: [
      'It has no resource requests',
      'Every container has CPU and memory requests equal to its limits',
      'It runs on a dedicated node',
      'It has a readiness probe',
    ],
    answer: 1,
    explanation:
      'Guaranteed requires requests equal to limits for CPU and memory on every container. BestEffort has no requests or limits; Burstable is in between.',
  },
  {
    id: 'kcna-q013',
    domain: 'fundamentals',
    difficulty: 'medium',
    question: 'A container is terminated with reason OOMKilled. What is the most likely cause?',
    options: ['It exceeded its memory limit', 'It exceeded its CPU request', 'Its readiness probe failed', 'Its node was cordoned'],
    answer: 0,
    explanation:
      'Exceeding a memory limit can trigger the kernel OOM killer for that container. CPU overuse causes throttling, not an OOMKill.',
  },
  {
    id: 'kcna-q014',
    domain: 'fundamentals',
    difficulty: 'medium',
    question: 'What happens when a readiness probe fails?',
    options: [
      'The container is restarted',
      'The Pod is removed from Service endpoints',
      'The Pod is evicted from the node',
      'The Deployment rolls back',
    ],
    answer: 1,
    explanation:
      'Readiness controls traffic eligibility. A failing readiness probe makes the Pod not Ready and removes it from endpoints, without restarting it.',
  },
  {
    id: 'kcna-q015',
    domain: 'fundamentals',
    difficulty: 'medium',
    question: 'What happens after repeated liveness probe failures?',
    options: ['The Pod is marked NotReady but keeps running', 'The kubelet restarts the container', 'The Service is deleted', 'The image is re-pulled'],
    answer: 1,
    explanation:
      'Liveness failures cause the kubelet to restart the container according to the restart policy.',
  },
  {
    id: 'kcna-q016',
    domain: 'fundamentals',
    difficulty: 'medium',
    question: 'Why is an image digest more reproducible than a tag?',
    options: [
      'Digests compress the image',
      'A digest identifies exact content, while a tag can be moved',
      'Digests bypass the registry',
      'Only digests work with containerd',
    ],
    answer: 1,
    explanation:
      'Tags are mutable pointers. A digest names exact content, which supports reliable rollback and provenance.',
  },
  {
    id: 'kcna-q017',
    domain: 'fundamentals',
    difficulty: 'easy',
    question: 'Which statement best describes a container?',
    options: [
      'A full virtual machine with its own kernel',
      'An isolated process sharing the host kernel, with namespaces and cgroups',
      'A physical server partition',
      'A Kubernetes-only binary format',
    ],
    answer: 1,
    explanation:
      'Containers isolate processes using kernel features and share the host kernel. They are not full virtual machines.',
  },
  {
    id: 'kcna-q018',
    domain: 'fundamentals',
    difficulty: 'medium',
    question: 'What is an init container used for?',
    options: [
      'Serving traffic before the app starts',
      'Running setup work to completion before app containers start',
      'Replacing the kubelet',
      'Storing persistent data',
    ],
    answer: 1,
    explanation:
      'Init containers run sequentially to completion before the main containers start. They are useful for setup and dependency checks.',
  },
  {
    id: 'kcna-q019',
    domain: 'fundamentals',
    difficulty: 'medium',
    question: 'What is a sidecar container?',
    options: [
      'A container that shares a Pod with the main container to add a capability',
      'A container that runs on the control plane only',
      'A replacement for a Service',
      'A container that runs before the Pod is scheduled',
    ],
    answer: 0,
    explanation:
      'A sidecar augments the main container, for example with logging, proxying or synchronization. It shares the Pod network and can share volumes.',
  },
  {
    id: 'kcna-q020',
    domain: 'fundamentals',
    difficulty: 'hard',
    question: 'Where does kubeadm place static Pod manifests on a control-plane node?',
    options: ['/var/lib/kubelet/pods', '/etc/kubernetes/manifests', '/etc/cni/net.d', '/var/log/containers'],
    answer: 1,
    explanation:
      'The kubelet watches /etc/kubernetes/manifests. kubeadm writes control-plane component manifests there.',
  },
  {
    id: 'kcna-q021',
    domain: 'fundamentals',
    difficulty: 'easy',
    question: 'What does a kubeconfig context combine?',
    options: [
      'A cluster, a user identity and a default namespace',
      'A Pod, a Service and an Ingress',
      'A namespace and a PersistentVolume',
      'A container image and a tag',
    ],
    answer: 0,
    explanation:
      'A context references a cluster and user, and may set a default namespace. Switching context changes which API server and identity kubectl uses.',
  },
  {
    id: 'kcna-q022',
    domain: 'fundamentals',
    difficulty: 'easy',
    question: 'What does a nodeSelector do?',
    options: [
      'Selects a Service by label',
      'Restricts scheduling to nodes with matching labels',
      'Selects a container image',
      'Chooses a namespace for a Pod',
    ],
    answer: 1,
    explanation:
      'nodeSelector is a hard constraint that requires a node label match. More expressive rules use node affinity.',
  },
  {
    id: 'kcna-q023',
    domain: 'fundamentals',
    difficulty: 'medium',
    question: 'A node has the taint dedicated=gpu:NoSchedule. What happens to a Pod without a matching toleration?',
    options: [
      'It is scheduled but throttled',
      'It is not scheduled on that node',
      'It is scheduled and later evicted',
      'It runs with a lower QoS class',
    ],
    answer: 1,
    explanation:
      'NoSchedule prevents new Pods without a matching toleration from being placed on the node. NoExecute would also evict existing non-tolerating Pods.',
  },
  {
    id: 'kcna-q024',
    domain: 'fundamentals',
    difficulty: 'hard',
    question: 'A Pod tolerates a node taint. Does that guarantee the Pod runs on that node?',
    options: [
      'Yes, tolerations force placement',
      'No, a toleration permits placement but does not attract the Pod',
      'Yes, unless a NetworkPolicy blocks it',
      'No, only DaemonSets can tolerate taints',
    ],
    answer: 1,
    explanation:
      'Tolerations remove a scheduling restriction. Node affinity or a selector is needed to prefer or require that node.',
  },
  {
    id: 'kcna-q025',
    domain: 'fundamentals',
    difficulty: 'medium',
    question: 'A ConfigMap is consumed only through envFrom. What happens to a running container after the ConfigMap changes?',
    options: [
      'Environment variables update immediately',
      'The container is restarted automatically',
      'The running container keeps its original environment until recreated',
      'The ConfigMap update is rejected',
    ],
    answer: 2,
    explanation:
      'Environment variables are set at container start. Mounted ConfigMap volumes can update eventually, but env-based values require a new container.',
  },
  {
    id: 'kcna-q026',
    domain: 'fundamentals',
    difficulty: 'medium',
    question: 'What does the Pending phase mean for a Pod?',
    options: [
      'The application is running but not ready',
      'The Pod has been accepted but is not yet running, often because it is unscheduled',
      'The Pod has completed successfully',
      'The Pod was evicted',
    ],
    answer: 1,
    explanation:
      'Pending means the Pod has been accepted by the API but not all containers are running yet. Scheduling or image pull are common causes.',
  },
  {
    id: 'kcna-q027',
    domain: 'orchestration',
    difficulty: 'easy',
    question: 'What is the role of a CNI plugin?',
    options: [
      'Providing Pod IP addresses and network connectivity',
      'Storing cluster state',
      'Scheduling Pods',
      'Managing container images',
    ],
    answer: 0,
    explanation:
      'The Container Network Interface plugin configures Pod networking, including address assignment and routes or overlays.',
  },
  {
    id: 'kcna-q028',
    domain: 'orchestration',
    difficulty: 'easy',
    question: 'Which Service type provides a stable internal virtual IP?',
    options: ['NodePort', 'ClusterIP', 'LoadBalancer', 'ExternalName'],
    answer: 1,
    explanation:
      'ClusterIP is the default internal Service type. It provides a stable virtual address to selected Pods.',
  },
  {
    id: 'kcna-q029',
    domain: 'orchestration',
    difficulty: 'medium',
    question: 'What does a NodePort Service do?',
    options: [
      'Creates a DNS CNAME',
      'Opens a port on every node and forwards it to the Service',
      'Provisions a cloud load balancer',
      'Creates a PersistentVolume',
    ],
    answer: 1,
    explanation:
      'NodePort allocates a port on each node. Traffic to that port is forwarded to the Service, assuming the external path and firewall allow it.',
  },
  {
    id: 'kcna-q030',
    domain: 'orchestration',
    difficulty: 'medium',
    question: 'What does a LoadBalancer Service request?',
    options: [
      'A cluster-internal IP only',
      'An external load balancer from the infrastructure provider or implementation',
      'A headless DNS record',
      'A NodePort with no backend',
    ],
    answer: 1,
    explanation:
      'LoadBalancer builds on NodePort/ClusterIP and asks the provider or implementation for an external load balancer address.',
  },
  {
    id: 'kcna-q031',
    domain: 'orchestration',
    difficulty: 'hard',
    question: 'What is a headless Service?',
    options: [
      'A Service with no selector',
      'A Service with clusterIP: None that returns Pod addresses through DNS',
      'A Service that only works outside the cluster',
      'A Service without ports',
    ],
    answer: 1,
    explanation:
      'A headless Service does not allocate a virtual IP. DNS returns the addresses of the selected Pods, which is useful for StatefulSets and custom discovery.',
  },
  {
    id: 'kcna-q032',
    domain: 'orchestration',
    difficulty: 'medium',
    question: 'A Service exists but its EndpointSlice is empty. What is the most likely cause?',
    options: [
      'The Service selector does not match any ready Pods',
      'The node has no kube-proxy',
      'The image tag is too long',
      'The Pod has a readiness probe',
    ],
    answer: 0,
    explanation:
      'Endpoints come from ready Pods matching the selector. Check labels, namespace and readiness before changing the Service type.',
  },
  {
    id: 'kcna-q033',
    domain: 'orchestration',
    difficulty: 'medium',
    question: 'Which DNS name reaches a Service named api in namespace team from another namespace?',
    options: ['api', 'api.team', 'api.svc.cluster.local', 'team.api'],
    answer: 1,
    explanation:
      'The short form api.team resolves across namespaces. The fully qualified form is api.team.svc.cluster.local.',
  },
  {
    id: 'kcna-q034',
    domain: 'orchestration',
    difficulty: 'easy',
    question: 'What is required for an Ingress resource to route traffic?',
    options: [
      'A PersistentVolume',
      'An Ingress controller',
      'A NodePort Service only',
      'A NetworkPolicy',
    ],
    answer: 1,
    explanation:
      'An Ingress is a routing declaration. An Ingress controller watches it and configures a proxy or load balancer.',
  },
  {
    id: 'kcna-q035',
    domain: 'orchestration',
    difficulty: 'medium',
    question: 'What is the default network policy behavior in Kubernetes?',
    options: [
      'All ingress is denied by default',
      'Traffic is allowed unless a NetworkPolicy selects the Pod and restricts it',
      'Only DNS is allowed by default',
      'All traffic is denied until a policy is created',
    ],
    answer: 1,
    explanation:
      'Without a selecting policy, traffic is allowed. Once a policy selects a Pod for a direction, only explicitly allowed traffic in that direction passes.',
  },
  {
    id: 'kcna-q036',
    domain: 'orchestration',
    difficulty: 'hard',
    question: 'A NetworkPolicy selects a Pod with policyTypes: [Ingress] and has no ingress rules. What is the result?',
    options: [
      'All ingress to the Pod is allowed',
      'All ingress to the Pod is denied',
      'Only egress is denied',
      'The policy is ignored',
    ],
    answer: 1,
    explanation:
      'Selecting a Pod for ingress isolation with no allow rules denies all ingress to that Pod. Add only the required flows.',
  },
  {
    id: 'kcna-q037',
    domain: 'orchestration',
    difficulty: 'medium',
    question: 'What is the scope of a Role?',
    options: ['Cluster-wide', 'A single namespace', 'A single node', 'A single container'],
    answer: 1,
    explanation:
      'A Role defines permissions within a namespace. A ClusterRole is cluster-scoped and can also be bound into a namespace.',
  },
  {
    id: 'kcna-q038',
    domain: 'orchestration',
    difficulty: 'hard',
    question: 'A ClusterRoleBinding grants a ClusterRole. What is the scope of the resulting permission?',
    options: [
      'Only the namespace of the subject',
      'The entire cluster for the resources allowed by the role',
      'Only kube-system',
      'Only the default namespace',
    ],
    answer: 1,
    explanation:
      'ClusterRoleBinding is cluster-wide. Use a RoleBinding when the same ClusterRole should only apply in one namespace.',
  },
  {
    id: 'kcna-q039',
    domain: 'orchestration',
    difficulty: 'medium',
    question: 'How does a Pod normally obtain an API identity?',
    options: [
      'From a mounted kubeconfig',
      'Through a ServiceAccount token projected into the Pod',
      'By using the node’s SSH key',
      'Through a ConfigMap',
    ],
    answer: 1,
    explanation:
      'Pods use a projected ServiceAccount token. The token represents the ServiceAccount identity and is subject to RBAC.',
  },
  {
    id: 'kcna-q040',
    domain: 'orchestration',
    difficulty: 'medium',
    question: 'Are Kubernetes Secrets encrypted at rest by default?',
    options: [
      'Yes, always with a cluster key',
      'No, they are base64-encoded in the API and require encryption at rest to be configured',
      'Yes, but only in kube-system',
      'No, they are stored as plain environment variables only',
    ],
    answer: 1,
    explanation:
      'Base64 is encoding, not encryption. Enable encryption at rest and restrict RBAC access to protect Secret data.',
  },
  {
    id: 'kcna-q041',
    domain: 'orchestration',
    difficulty: 'medium',
    question: 'Which object is cluster-scoped: PersistentVolume or PersistentVolumeClaim?',
    options: ['PersistentVolume', 'PersistentVolumeClaim', 'Both are namespaced', 'Neither is namespaced'],
    answer: 0,
    explanation:
      'PersistentVolumes are cluster-scoped. PersistentVolumeClaims are namespaced requests that bind to them.',
  },
  {
    id: 'kcna-q042',
    domain: 'orchestration',
    difficulty: 'hard',
    question: 'Which access mode allows a volume to be mounted read-write by multiple nodes?',
    options: ['ReadWriteOnce', 'ReadOnlyMany', 'ReadWriteMany', 'ReadWriteOncePod'],
    answer: 2,
    explanation:
      'ReadWriteMany supports read-write mounts from multiple nodes, if the storage backend implements it. RWO is single-node.',
  },
  {
    id: 'kcna-q043',
    domain: 'orchestration',
    difficulty: 'medium',
    question: 'What enables dynamic provisioning of a PersistentVolume?',
    options: ['A StorageClass and its provisioner', 'A NetworkPolicy', 'A ServiceAccount', 'A PodDisruptionBudget'],
    answer: 0,
    explanation:
      'A PVC that references a StorageClass can trigger its provisioner to create a matching PV automatically.',
  },
  {
    id: 'kcna-q044',
    domain: 'orchestration',
    difficulty: 'medium',
    question: 'A container restarted repeatedly. Which command shows logs from the previous container instance?',
    options: ['kubectl logs <pod> --previous', 'kubectl describe pod <pod>', 'kubectl exec <pod> -- logs', 'kubectl top pod <pod>'],
    answer: 0,
    explanation:
      '--previous retrieves logs from the terminated container instance, which is often the only evidence for a crash loop.',
  },
  {
    id: 'kcna-q045',
    domain: 'orchestration',
    difficulty: 'easy',
    question: 'Which command is most useful for seeing recent scheduling and pull errors for a Pod?',
    options: ['kubectl describe pod <pod>', 'kubectl get nodes', 'kubectl rollout history', 'kubectl top nodes'],
    answer: 0,
    explanation:
      'describe aggregates status, container states, volumes and recent events, making it a strong first diagnostic command.',
  },
  {
    id: 'kcna-q046',
    domain: 'delivery',
    difficulty: 'medium',
    question: 'Why should a delivery pipeline publish an immutable artifact reference?',
    options: [
      'To make the image smaller',
      'To make deployments reproducible and auditable',
      'To avoid using a registry',
      'To eliminate the need for tests',
    ],
    answer: 1,
    explanation:
      'An immutable digest or unique tag ties a deployment to exact content, which enables reliable rollback, auditing and provenance.',
  },
  {
    id: 'kcna-q047',
    domain: 'delivery',
    difficulty: 'medium',
    question: 'What does Helm primarily add on top of Kubernetes manifests?',
    options: [
      'A container runtime',
      'Chart templating, values and release management',
      'A CNI plugin',
      'A cluster autoscaler',
    ],
    answer: 1,
    explanation:
      'Helm packages templates and values into charts and tracks installed releases with revision history.',
  },
  {
    id: 'kcna-q048',
    domain: 'delivery',
    difficulty: 'medium',
    question: 'What is Kustomize designed to do?',
    options: [
      'Build container images',
      'Overlay and patch Kubernetes manifests without templates',
      'Store etcd backups',
      'Replace CoreDNS',
    ],
    answer: 1,
    explanation:
      'Kustomize composes a base with overlays and patches, and is integrated into kubectl with -k.',
  },
  {
    id: 'kcna-q049',
    domain: 'delivery',
    difficulty: 'medium',
    question: 'What defines a GitOps workflow?',
    options: [
      'Developers SSH into nodes to deploy',
      'Git holds the desired state and an agent reconciles the cluster to it',
      'Images are built on every node',
      'All manifests are applied manually',
    ],
    answer: 1,
    explanation:
      'GitOps uses Git as the reviewed source of desired state, with an agent continuously reconciling drift.',
  },
  {
    id: 'kcna-q050',
    domain: 'delivery',
    difficulty: 'medium',
    question: 'What is a canary release?',
    options: [
      'Replacing every instance at once',
      'Sending a small portion of traffic to a new version before broader rollout',
      'Deleting the previous version immediately',
      'Running only in a development namespace',
    ],
    answer: 1,
    explanation:
      'A canary limits exposure by sending a small traffic share to the new version and observing signals before increasing it.',
  },
  {
    id: 'kcna-q051',
    domain: 'delivery',
    difficulty: 'medium',
    question: 'How does a blue-green deployment reduce release risk?',
    options: [
      'It runs two environments and switches traffic after validation',
      'It removes readiness probes',
      'It uses only one Pod',
      'It skips testing',
    ],
    answer: 0,
    explanation:
      'Blue-green keeps the previous environment available while the new one is validated, then switches traffic. Rollback is a traffic switch.',
  },
  {
    id: 'kcna-q052',
    domain: 'delivery',
    difficulty: 'easy',
    question: 'Which command rolls a Deployment back to its previous revision?',
    options: ['kubectl rollout undo deployment/<name>', 'kubectl delete deployment/<name>', 'kubectl scale deployment/<name> --replicas=0', 'kubectl rollout pause deployment/<name>'],
    answer: 0,
    explanation:
      'rollout undo restores the previous Pod template as a new revision. rollout history shows available revisions.',
  },
  {
    id: 'kcna-q053',
    domain: 'delivery',
    difficulty: 'hard',
    question: 'A Deployment reports a successful rollout, but users still receive errors. What is the best explanation?',
    options: [
      'A successful rollout proves application correctness',
      'The controller reached its desired replica count, but the application may still be unhealthy or misrouted',
      'The Deployment has no ReplicaSet',
      'Kubernetes automatically rolls back unhealthy applications',
    ],
    answer: 1,
    explanation:
      'Rollout success is controller state, not a full user-journey test. Check readiness, endpoints, logs and a real request.',
  },
  {
    id: 'kcna-q054',
    domain: 'delivery',
    difficulty: 'medium',
    question: 'Why scan container images in a delivery pipeline?',
    options: [
      'To reduce the number of nodes',
      'To find known vulnerabilities and policy violations before deployment',
      'To replace runtime security',
      'To make the image immutable',
    ],
    answer: 1,
    explanation:
      'Scanning catches known issues earlier and supports policy enforcement. It complements, not replaces, runtime controls.',
  },
  {
    id: 'kcna-q055',
    domain: 'delivery',
    difficulty: 'hard',
    question: 'A rolling update is stuck with the new ReplicaSet unavailable while old Pods remain healthy. What is the most useful next step?',
    options: [
      'Delete the entire Deployment',
      'Inspect the new Pods’ events, logs, readiness and image pull status',
      'Restart etcd',
      'Remove all readiness probes',
    ],
    answer: 1,
    explanation:
      'The old ReplicaSet staying healthy is expected under RollingUpdate. Diagnose the new revision rather than disrupting the healthy capacity.',
  },
  {
    id: 'kcna-q056',
    domain: 'architecture',
    difficulty: 'easy',
    question: 'What are metrics best suited for?',
    options: [
      'Exact per-request event details',
      'Aggregated trends, thresholds and alerts over time',
      'Storing application source code',
      'Routing Service traffic',
    ],
    answer: 1,
    explanation:
      'Metrics are numeric time series. They are efficient for trends, capacity and alerting, but not for exact event detail.',
  },
  {
    id: 'kcna-q057',
    domain: 'architecture',
    difficulty: 'medium',
    question: 'Which signal best explains why one specific request was slow across multiple services?',
    options: ['A node CPU graph', 'A distributed trace', 'A PersistentVolume', 'A Deployment revision'],
    answer: 1,
    explanation:
      'A trace follows a request through spans across services, showing where time was spent. Metrics show aggregates, not the individual path.',
  },
  {
    id: 'kcna-q058',
    domain: 'architecture',
    difficulty: 'medium',
    question: 'What does Prometheus primarily do?',
    options: [
      'Store and query time-series metrics',
      'Route HTTP traffic',
      'Provision persistent volumes',
      'Manage container images',
    ],
    answer: 0,
    explanation:
      'Prometheus scrapes and stores time-series metrics and offers a query language for alerting and dashboards.',
  },
  {
    id: 'kcna-q059',
    domain: 'architecture',
    difficulty: 'medium',
    question: 'What is OpenTelemetry?',
    options: [
      'A vendor-neutral instrumentation and collection standard for telemetry',
      'A Kubernetes distribution',
      'A CNI plugin',
      'A storage class',
    ],
    answer: 0,
    explanation:
      'OpenTelemetry provides APIs, SDKs and a collector for traces, metrics and logs, reducing vendor lock-in.',
  },
  {
    id: 'kcna-q060',
    domain: 'architecture',
    difficulty: 'hard',
    question: 'What is an SLO?',
    options: [
      'A target for a measured service-level indicator over a period',
      'A command-line tool for Kubernetes',
      'A type of Service',
      'A storage reclaim policy',
    ],
    answer: 0,
    explanation:
      'An SLO sets a target for an SLI, such as 99.9% successful requests over 30 days. The error budget is the allowed failure within that target.',
  },
]
