export const cheatGroups = [
  {
    id: 'context',
    title: 'Context and discovery',
    domain: 'fundamentals',
    commands: [
      { cmd: 'kubectl config get-contexts', note: 'List clusters, users and contexts' },
      { cmd: 'kubectl config use-context <name>', note: 'Switch the active context' },
      { cmd: 'kubectl config set-context --current --namespace=<ns>', note: 'Set the default namespace' },
      { cmd: 'kubectl api-resources', note: 'List API resources and short names' },
      { cmd: 'kubectl explain <kind> --recursive', note: 'Read the API schema' },
      { cmd: 'kubectl get all -n <ns>', note: 'Show common namespaced objects' },
    ],
  },
  {
    id: 'objects',
    title: 'Objects and manifests',
    domain: 'fundamentals',
    commands: [
      { cmd: 'kubectl create deployment web --image=nginx:1.27 --replicas=3 --dry-run=client -o yaml > web.yaml', note: 'Generate YAML from an imperative command' },
      { cmd: 'kubectl apply -f web.yaml', note: 'Apply desired state' },
      { cmd: 'kubectl apply -f web.yaml --dry-run=server', note: 'Validate through API admission' },
      { cmd: 'kubectl diff -f web.yaml', note: 'Preview the change' },
      { cmd: 'kubectl get pod <pod> -o yaml', note: 'Read the full object' },
      { cmd: 'kubectl get pod <pod> -o jsonpath=\'{.status.phase}{"\\n"}\'', note: 'Extract one field' },
      { cmd: 'kubectl label deployment web tier=frontend', note: 'Add or update a label' },
      { cmd: 'kubectl delete -f web.yaml', note: 'Delete the manifest objects' },
    ],
  },
  {
    id: 'workloads',
    title: 'Workloads and rollout',
    domain: 'workloads',
    commands: [
      { cmd: 'kubectl set image deployment/web nginx=nginx:1.28', note: 'Update a container image' },
      { cmd: 'kubectl annotate deployment/web kubernetes.io/change-cause="upgrade nginx"', note: 'Record change intent' },
      { cmd: 'kubectl rollout status deployment/web', note: 'Wait for a rollout' },
      { cmd: 'kubectl rollout history deployment/web', note: 'Show revisions' },
      { cmd: 'kubectl rollout undo deployment/web', note: 'Roll back one revision' },
      { cmd: 'kubectl scale deployment/web --replicas=5', note: 'Change replica count' },
      { cmd: 'kubectl autoscale deployment/web --cpu-percent=60 --min=2 --max=8', note: 'Create an HPA' },
      { cmd: 'kubectl create job backup --image=busybox:1.36 -- sh -c "echo done"', note: 'Run a one-off Job' },
    ],
  },
  {
    id: 'config',
    title: 'Configuration and secrets',
    domain: 'workloads',
    commands: [
      { cmd: 'kubectl create configmap app-config --from-literal=mode=prod', note: 'Create a ConfigMap' },
      { cmd: 'kubectl create configmap app-config --from-file=app.properties', note: 'Create from a file' },
      { cmd: 'kubectl create secret generic db-creds --from-literal=password=secret', note: 'Create a Secret' },
      { cmd: 'kubectl get secret db-creds -o jsonpath=\'{.data.password}\' | base64 -d', note: 'Decode a Secret value' },
      { cmd: 'kubectl rollout restart deployment/web', note: 'Restart Pods to pick up env changes' },
      { cmd: 'kubectl exec <pod> -- env | sort', note: 'Inspect the container environment' },
    ],
  },
  {
    id: 'networking',
    title: 'Services and networking',
    domain: 'networking',
    commands: [
      { cmd: 'kubectl expose deployment web --port=80 --target-port=8080', note: 'Create a ClusterIP Service' },
      { cmd: 'kubectl expose deployment web --type=NodePort --port=80', note: 'Expose through a node port' },
      { cmd: 'kubectl get svc,endpointslice', note: 'Inspect Service wiring' },
      { cmd: 'kubectl get endpointslice -l kubernetes.io/service-name=web', note: 'Find a Service’s endpoints' },
      { cmd: 'kubectl run nettest --image=busybox:1.36 --rm -it --restart=Never -- sh', note: 'Start a temporary network client' },
      { cmd: 'kubectl port-forward svc/web 8080:80', note: 'Test the Service from your machine' },
      { cmd: 'kubectl create ingress study --rule="study.example.com/app*=web:80"', note: 'Create a simple Ingress' },
      { cmd: 'kubectl get networkpolicy -A', note: 'List network policies' },
    ],
  },
  {
    id: 'storage',
    title: 'Storage',
    domain: 'storage',
    commands: [
      { cmd: 'kubectl get storageclass', note: 'List StorageClasses and defaults' },
      { cmd: 'kubectl get pv,pvc -A', note: 'Inspect volumes and claims' },
      { cmd: 'kubectl describe pvc <pvc>', note: 'Read binding events' },
      { cmd: 'kubectl get pv <pv> -o yaml', note: 'Inspect capacity, policy and claimRef' },
      { cmd: 'kubectl patch pvc data -p \'{"spec":{"resources":{"requests":{"storage":"10Gi"}}}}\'', note: 'Request volume expansion' },
      { cmd: 'kubectl get volumeattachment', note: 'Inspect attach/detach state' },
    ],
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    domain: 'troubleshooting',
    commands: [
      { cmd: 'kubectl get pods -A -o wide', note: 'See phase, restarts and node' },
      { cmd: 'kubectl describe pod <pod>', note: 'State, conditions, volumes and events' },
      { cmd: 'kubectl logs <pod> --previous', note: 'Logs from the terminated instance' },
      { cmd: 'kubectl get events -A --sort-by=.lastTimestamp', note: 'Recent cluster events' },
      { cmd: 'kubectl describe node <node> | sed -n \'/Allocated resources/,/Events/p\'', note: 'Node capacity and pressure' },
      { cmd: 'kubectl top nodes && kubectl top pods -A', note: 'Resource usage if metrics-server exists' },
      { cmd: 'kubectl get --raw=\'/readyz?verbose\'', note: 'API server readiness checks' },
      { cmd: 'kubectl auth can-i get pods --as=system:serviceaccount:<ns>:<sa>', note: 'Test authorization' },
    ],
  },
  {
    id: 'cluster',
    title: 'Cluster and RBAC',
    domain: 'cluster',
    commands: [
      { cmd: 'kubectl get nodes -o wide', note: 'Node health and versions' },
      { cmd: 'kubectl describe node <node>', note: 'Conditions, taints, allocations' },
      { cmd: 'kubectl drain <node> --ignore-daemonsets --delete-emptydir-data', note: 'Evict workloads safely' },
      { cmd: 'kubectl uncordon <node>', note: 'Return a node to scheduling' },
      { cmd: 'kubectl create role pod-reader --verb=get,list --resource=pods -n qa', note: 'Create a namespaced Role' },
      { cmd: 'kubectl create rolebinding read-pods --role=pod-reader --serviceaccount=qa:reader -n qa', note: 'Bind a Role' },
      { cmd: 'kubectl create clusterrolebinding view-all --clusterrole=view --serviceaccount=qa:reader', note: 'Bind cluster-wide' },
      { cmd: 'kubectl auth can-i --list -n qa', note: 'List effective permissions' },
      { cmd: 'sudo kubeadm certs check-expiration', note: 'Check control-plane certificates' },
    ],
  },
]

export const glossary = [
  {
    term: 'Admission controller',
    domain: 'fundamentals',
    definition:
      'Code that can mutate or reject an API request after authentication and authorization. Examples include Pod Security admission and policy engines.',
  },
  {
    term: 'Affinity',
    domain: 'workloads',
    definition:
      'Rules that attract Pods to nodes or other Pods. Required rules are hard constraints; preferred rules influence scheduling scores.',
  },
  {
    term: 'API server',
    domain: 'cluster',
    definition:
      'The Kubernetes front door. It authenticates, authorizes, validates and persists API requests, and serves watches to controllers.',
  },
  {
    term: 'CNI',
    domain: 'networking',
    definition:
      'Container Network Interface. A plugin contract for assigning Pod IP addresses and programming network connectivity.',
  },
  {
    term: 'ConfigMap',
    domain: 'workloads',
    definition:
      'A namespaced object holding non-sensitive configuration as key-value data or files, consumable through environment variables, arguments or volumes.',
  },
  {
    term: 'Container',
    domain: 'fundamentals',
    definition:
      'An isolated process using Linux namespaces, cgroups and capabilities. It shares the host kernel rather than running a full guest OS.',
  },
  {
    term: 'Controller',
    domain: 'fundamentals',
    definition:
      'A reconciliation loop that watches object state and makes changes to bring observed state toward desired state.',
  },
  {
    term: 'CoreDNS',
    domain: 'networking',
    definition:
      'The default cluster DNS server. It creates records for Services and endpoints and supports custom DNS configuration.',
  },
  {
    term: 'CRD',
    domain: 'cluster',
    definition:
      'CustomResourceDefinition. It registers a new API kind and schema. A controller or operator implements the behavior.',
  },
  {
    term: 'CSI',
    domain: 'storage',
    definition:
      'Container Storage Interface. A plugin contract for provisioning, attaching, mounting and expanding storage.',
  },
  {
    term: 'DaemonSet',
    domain: 'workloads',
    definition:
      'A workload that runs one Pod per eligible node, commonly used for node agents, log collectors and CNI components.',
  },
  {
    term: 'Deployment',
    domain: 'workloads',
    definition:
      'A controller that manages ReplicaSets and declarative Pod template updates, including rolling updates and rollbacks.',
  },
  {
    term: 'etcd',
    domain: 'cluster',
    definition:
      'The consistent key-value store holding Kubernetes cluster state. It uses Raft and requires a quorum for writes.',
  },
  {
    term: 'EndpointSlice',
    domain: 'networking',
    definition:
      'A scalable representation of the network endpoints behind a Service. It is populated from ready Pods matching the selector.',
  },
  {
    term: 'Finalizer',
    domain: 'fundamentals',
    definition:
      'A key on an object that blocks deletion until a controller completes cleanup and removes the finalizer.',
  },
  {
    term: 'Gateway API',
    domain: 'networking',
    definition:
      'A role-oriented set of resources (GatewayClass, Gateway, HTTPRoute) for exposing and routing traffic, implemented by controllers.',
  },
  {
    term: 'GitOps',
    domain: 'delivery',
    definition:
      'An operating model where Git holds desired state and an agent continuously reconciles the cluster to it.',
  },
  {
    term: 'Helm',
    domain: 'delivery',
    definition:
      'A package manager for Kubernetes that renders charts from values and tracks installed releases and revisions.',
  },
  {
    term: 'HPA',
    domain: 'workloads',
    definition:
      'HorizontalPodAutoscaler. It adjusts replica count from observed metrics, commonly CPU or memory, within configured bounds.',
  },
  {
    term: 'Ingress',
    domain: 'networking',
    definition:
      'An HTTP routing declaration for host and path rules. It requires an Ingress controller to implement the routing.',
  },
  {
    term: 'Init container',
    domain: 'fundamentals',
    definition:
      'A container that runs to completion before app containers start. Init containers run sequentially and can prepare shared volumes.',
  },
  {
    term: 'kubeadm',
    domain: 'cluster',
    definition:
      'A tool that bootstraps conformant Kubernetes clusters, joins nodes, manages certificates and coordinates upgrades.',
  },
  {
    term: 'kubelet',
    domain: 'fundamentals',
    definition:
      'The node agent that registers the node, watches assigned Pods, mounts volumes, runs probes and reports status to the API server.',
  },
  {
    term: 'kube-proxy',
    domain: 'networking',
    definition:
      'A node component that programs Service traffic rules, typically using iptables or IPVS. Some CNI implementations replace parts of its role.',
  },
  {
    term: 'Limit',
    domain: 'workloads',
    definition:
      'The maximum resource amount a container may consume. CPU limits cause throttling; memory limits can cause OOMKills.',
  },
  {
    term: 'Namespace',
    domain: 'fundamentals',
    definition:
      'A scope for names of namespaced resources. It is not a complete security or network boundary by itself.',
  },
  {
    term: 'NetworkPolicy',
    domain: 'networking',
    definition:
      'A namespaced policy selecting Pods and defining allowed ingress or egress. Enforcement depends on the CNI plugin.',
  },
  {
    term: 'Node',
    domain: 'fundamentals',
    definition:
      'A machine that runs the kubelet and container runtime. Workers host workloads; control-plane nodes host cluster management components.',
  },
  {
    term: 'Operator',
    domain: 'cluster',
    definition:
      'A controller that manages a custom resource and the Kubernetes objects needed to operate an application or infrastructure service.',
  },
  {
    term: 'PDB',
    domain: 'workloads',
    definition:
      'PodDisruptionBudget. It limits voluntary disruptions such as drains by requiring a minimum available or maximum unavailable count.',
  },
  {
    term: 'PersistentVolume',
    domain: 'storage',
    definition:
      'A cluster-scoped storage resource. It binds to a namespaced PersistentVolumeClaim that requests compatible capacity and access modes.',
  },
  {
    term: 'Pod',
    domain: 'fundamentals',
    definition:
      'The smallest schedulable Kubernetes unit: one or more containers sharing a network namespace, volumes and lifecycle.',
  },
  {
    term: 'Probe',
    domain: 'workloads',
    definition:
      'A health check. Startup probes protect slow starts, readiness probes control traffic, and liveness probes trigger restarts.',
  },
  {
    term: 'RBAC',
    domain: 'cluster',
    definition:
      'Role-Based Access Control. Roles and ClusterRoles define permissions; bindings grant them to users, groups or ServiceAccounts.',
  },
  {
    term: 'ReplicaSet',
    domain: 'workloads',
    definition:
      'A controller that ensures a specified number of matching Pods exist. Deployments manage ReplicaSets across revisions.',
  },
  {
    term: 'Request',
    domain: 'workloads',
    definition:
      'The resource amount the scheduler reserves for a container. Requests determine placement; they are not a runtime cap.',
  },
  {
    term: 'Secret',
    domain: 'workloads',
    definition:
      'A namespaced object for sensitive data. It is base64-encoded by default, not encrypted; enable encryption at rest and restrict RBAC.',
  },
  {
    term: 'Service',
    domain: 'networking',
    definition:
      'A stable virtual address and DNS name for a set of selected Pods, with ClusterIP, NodePort, LoadBalancer or ExternalName behavior.',
  },
  {
    term: 'ServiceAccount',
    domain: 'cluster',
    definition:
      'An identity for processes running in Pods. Projected tokens authenticate the workload to the API server.',
  },
  {
    term: 'StatefulSet',
    domain: 'workloads',
    definition:
      'A workload for stateful applications that need stable identity, ordered rollout and persistent storage per replica.',
  },
  {
    term: 'StorageClass',
    domain: 'storage',
    definition:
      'A template for dynamic provisioning: provisioner, parameters, binding mode and reclaim policy.',
  },
  {
    term: 'Taint',
    domain: 'workloads',
    definition:
      'A node property that repels Pods without a matching toleration. Effects include NoSchedule, PreferNoSchedule and NoExecute.',
  },
  {
    term: 'Toleration',
    domain: 'workloads',
    definition:
      'A Pod property that permits scheduling onto a tainted node. It does not attract the Pod to that node by itself.',
  },
  {
    term: 'Topology spread',
    domain: 'workloads',
    definition:
      'A scheduling constraint that distributes Pods across failure domains such as zones or nodes according to a skew limit.',
  },
  {
    term: 'Volume',
    domain: 'storage',
    definition:
      'A directory made available to containers in a Pod, backed by ephemeral, node-local, configuration or persistent storage.',
  },
]

export const officialResources = [
  {
    title: 'KCNA certification page',
    publisher: 'Linux Foundation Education',
    description:
      'Official exam format, objectives, pricing and scheduling information for the Kubernetes and Cloud Native Associate.',
    url: 'https://training.linuxfoundation.org/certification/kubernetes-cloud-native-associate/',
    type: 'Exam',
  },
  {
    title: 'KCNA curriculum',
    publisher: 'CNCF',
    description: 'The official domain and competency outline for KCNA. Always check this before studying.',
    url: 'https://github.com/cncf/curriculum/blob/main/KCNA_Curriculum.pdf',
    type: 'Curriculum',
  },
  {
    title: 'CKA certification page',
    publisher: 'Linux Foundation Education',
    description:
      'Official performance-based exam details, current Kubernetes version and domain weights for CKA.',
    url: 'https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/',
    type: 'Exam',
  },
  {
    title: 'CKA curriculum v1.37',
    publisher: 'CNCF',
    description: 'The official CKA competency outline aligned with Kubernetes v1.37.',
    url: 'https://github.com/cncf/curriculum/blob/main/CKA_Curriculum_v1.37.pdf',
    type: 'Curriculum',
  },
  {
    title: 'Kubernetes documentation',
    publisher: 'Kubernetes project',
    description:
      'Concepts, tasks, API reference and tutorials. This is the documentation available during the CKA exam.',
    url: 'https://kubernetes.io/docs/',
    type: 'Documentation',
  },
  {
    title: 'kubectl quick reference',
    publisher: 'Kubernetes project',
    description: 'A dense command reference for everyday cluster work and exam practice.',
    url: 'https://kubernetes.io/docs/reference/kubectl/quick-reference/',
    type: 'Reference',
  },
  {
    title: 'Kubernetes API reference',
    publisher: 'Kubernetes project',
    description: 'Authoritative API fields for every built-in resource.',
    url: 'https://kubernetes.io/docs/reference/kubernetes-api/',
    type: 'Reference',
  },
  {
    title: 'kubeadm documentation',
    publisher: 'Kubernetes project',
    description: 'Cluster bootstrap, upgrade, certificate and troubleshooting guidance.',
    url: 'https://kubernetes.io/docs/reference/setup-tools/kubeadm/',
    type: 'Documentation',
  },
  {
    title: 'Network Policy recipes',
    publisher: 'Kubernetes project',
    description: 'Practical NetworkPolicy examples, including default deny and namespace isolation.',
    url: 'https://github.com/ahmetb/kubernetes-network-policy-recipes',
    type: 'Practice',
  },
  {
    title: 'Killercoda Kubernetes playgrounds',
    publisher: 'Killercoda',
    description:
      'Free browser-based Kubernetes environments for practising commands. Third-party, not an official exam simulator.',
    url: 'https://killercoda.com/kubernetes',
    type: 'Practice',
  },
]
