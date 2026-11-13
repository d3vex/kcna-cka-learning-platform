export const ckaChallenges = [
  {
    id: 'cka-t01',
    domain: 'cluster',
    title: 'Grant namespaced read access',
    brief:
      'A junior operator needs to inspect Pods in the qa namespace. Create a Role named pod-reader that allows get, list and watch on Pods.',
    placeholder: 'kubectl -n qa create role ...',
    checks: [
      { label: 'Targets namespace qa', pattern: '(?:-n|--namespace)(?:=|\\s+)qa\\b' },
      { label: 'Creates Role pod-reader', pattern: 'create\\s+role\\s+pod-reader\\b' },
      { label: 'Allows get and list', pattern: '--verb=[^\\s]*(?:get)[^\\s]*(?:list)|--verb=[^\\s]*(?:list)[^\\s]*(?:get)' },
      { label: 'Targets pods', pattern: '--resource(?:=|\\s+)pods\\b' },
    ],
    hint: 'kubectl create role supports --verb and --resource. Put -n qa before or after the subcommand.',
    solution: 'kubectl -n qa create role pod-reader --verb=get,list,watch --resource=pods',
    explanation:
      'A Role is namespaced. Grant only the verbs and resources required, then bind it with a RoleBinding or ClusterRoleBinding depending on scope.',
    minutes: 5,
  },
  {
    id: 'cka-t02',
    domain: 'cluster',
    title: 'Drain a worker safely',
    brief:
      'You are about to upgrade worker node worker-1. Evict its workloads while keeping DaemonSet Pods and allowing temporary emptyDir data loss.',
    placeholder: 'kubectl drain ...',
    checks: [
      { label: 'Drains worker-1', pattern: 'kubectl\\s+drain\\s+(?:node/)?worker-1\\b' },
      { label: 'Ignores DaemonSets', pattern: '--ignore-daemonsets\\b' },
      { label: 'Allows emptyDir deletion', pattern: '--delete-emptydir-data\\b' },
    ],
    hint: 'Without --ignore-daemonsets, drain refuses to proceed when DaemonSet Pods exist.',
    solution:
      'kubectl drain worker-1 --ignore-daemonsets --delete-emptydir-data',
    explanation:
      'Drain cordons the node and evicts Pods through the eviction API. A PodDisruptionBudget can block eviction, which is intentional. Uncordon after the upgrade and health checks.',
    minutes: 6,
  },
  {
    id: 'cka-t03',
    domain: 'cluster',
    title: 'Bind a ClusterRole to a workload',
    brief:
      'ServiceAccount metrics-reader in namespace observability must read Nodes cluster-wide. Create a ClusterRoleBinding named metrics-reader-binding for it using the built-in view ClusterRole.',
    placeholder: 'kubectl create clusterrolebinding ...',
    checks: [
      { label: 'Creates the binding', pattern: 'create\\s+clusterrolebinding\\s+metrics-reader-binding\\b' },
      { label: 'Uses ClusterRole view', pattern: '--clusterrole(?:=|\\s+)view\\b' },
      { label: 'Targets the right ServiceAccount', pattern: '--serviceaccount(?:=|\\s+)observability:metrics-reader\\b' },
    ],
    hint: 'The --serviceaccount flag uses namespace:name, not system:serviceaccount:namespace:name.',
    solution:
      'kubectl create clusterrolebinding metrics-reader-binding --clusterrole=view --serviceaccount=observability:metrics-reader',
    explanation:
      'ClusterRoleBinding applies cluster-wide. Use it only when the permission genuinely must cross namespaces or cover cluster-scoped resources.',
    minutes: 6,
  },
  {
    id: 'cka-t04',
    domain: 'cluster',
    title: 'Inspect an extension point',
    brief:
      'A CRD has been installed by an operator. List the cluster’s CustomResourceDefinitions and confirm the API group for the certificate kind.',
    placeholder: 'kubectl get crd',
    checks: [
      { label: 'Lists CRDs', pattern: 'kubectl\\s+get\\s+crd(?:s|\\.apiextensions\\.k8s\\.io)?\\b' },
    ],
    hint: 'The short name for CustomResourceDefinition is crd.',
    solution: 'kubectl get crd',
    explanation:
      'A CRD registers a new API type. An operator provides the controller that reconciles instances of that type.',
    minutes: 4,
  },
  {
    id: 'cka-t05',
    domain: 'workloads',
    title: 'Perform a controlled image update',
    brief:
      'Update the nginx container in Deployment web to image nginx:1.28, then wait up to 90 seconds for the rollout to complete.',
    placeholder: 'kubectl set image ...',
    checks: [
      { label: 'Updates Deployment web', pattern: 'kubectl\\s+(?:-n\\s+\\S+\\s+)?set\\s+image\\s+deployment(?:/|\\s+)web\\b' },
      { label: 'Sets nginx:1.28', pattern: 'nginx=nginx:1\\.28\\b' },
      { label: 'Waits for rollout', pattern: 'kubectl\\s+rollout\\s+status\\s+deployment(?:/|\\s+)web\\b' },
    ],
    hint: 'You need two commands. Add --timeout=90s to rollout status.',
    solution:
      'kubectl set image deployment/web nginx=nginx:1.28\nkubectl rollout status deployment/web --timeout=90s',
    explanation:
      'set image creates a new revision. rollout status waits for the Deployment controller to report completion, but still verify readiness and real traffic.',
    minutes: 7,
  },
  {
    id: 'cka-t06',
    domain: 'workloads',
    title: 'Create configuration from a file',
    brief:
      'Create ConfigMap app-config in namespace web from the file ./app.properties.',
    placeholder: 'kubectl create configmap ...',
    checks: [
      { label: 'Creates ConfigMap app-config', pattern: 'create\\s+configmap\\s+app-config\\b' },
      { label: 'Reads app.properties', pattern: '--from-file(?:=|\\s+)(?:\\./)?app\\.properties\\b' },
      { label: 'Targets namespace web', pattern: '(?:-n|--namespace)(?:=|\\s+)web\\b' },
    ],
    hint: 'Use kubectl -n web create configmap app-config --from-file=./app.properties.',
    solution:
      'kubectl -n web create configmap app-config --from-file=./app.properties',
    explanation:
      'A ConfigMap can be consumed as environment variables or projected files. Mounted files update eventually; env values require a new container.',
    minutes: 5,
  },
  {
    id: 'cka-t07',
    domain: 'workloads',
    title: 'Autoscale a deployment',
    brief:
      'Create a HorizontalPodAutoscaler for Deployment web with a 60% CPU target, minimum 2 replicas and maximum 8 replicas.',
    placeholder: 'kubectl autoscale deployment ...',
    checks: [
      { label: 'Targets deployment web', pattern: 'kubectl\\s+autoscale\\s+deployment(?:/|\\s+)web\\b' },
      { label: 'Sets 60 percent CPU', pattern: '--cpu-percent(?:=|\\s+)60\\b' },
      { label: 'Sets min 2 max 8', pattern: '--min(?:=|\\s+)2\\b[\\s\\S]*--max(?:=|\\s+)8\\b' },
    ],
    hint: 'Order the flags as --cpu-percent=60 --min=2 --max=8.',
    solution:
      'kubectl autoscale deployment web --cpu-percent=60 --min=2 --max=8',
    explanation:
      'The HPA needs metrics-server and resource requests to calculate utilization. Check kubectl get hpa and the events if metrics show <unknown>.',
    minutes: 6,
  },
  {
    id: 'cka-t08',
    domain: 'networking',
    title: 'Expose a deployment externally',
    brief:
      'Expose Deployment web as a NodePort Service on port 80 targeting container port 8080.',
    placeholder: 'kubectl expose deployment ...',
    checks: [
      { label: 'Exposes deployment web', pattern: 'kubectl\\s+expose\\s+deployment(?:/|\\s+)web\\b' },
      { label: 'Uses NodePort', pattern: '--type(?:=|\\s+)NodePort\\b' },
      { label: 'Sets ports 80 to 8080', pattern: '--port(?:=|\\s+)80\\b[\\s\\S]*--target-port(?:=|\\s+)8080\\b' },
    ],
    hint: 'kubectl expose deployment web --type=NodePort --port=80 --target-port=8080.',
    solution:
      'kubectl expose deployment web --type=NodePort --port=80 --target-port=8080',
    explanation:
      'NodePort opens a port on every node, but firewalls and routing still determine external reachability. Inspect endpoints and test from the right network.',
    minutes: 6,
  },
  {
    id: 'cka-t09',
    domain: 'networking',
    title: 'Route HTTP by host and path',
    brief:
      'Create an Ingress named study for host study.example.com, routing the path prefix /app to Service web on port 80.',
    placeholder: 'kubectl create ingress ...',
    checks: [
      { label: 'Creates ingress study', pattern: 'create\\s+ingress\\s+study\\b' },
      { label: 'Adds the host/path rule', pattern: 'study\\.example\\.com/app\\*?=web:80|study\\.example\\.com\\/app\\*?=web:80' },
    ],
    hint: 'The imperative form is --rule="study.example.com/app*=web:80". Quote the rule if your shell needs it.',
    solution:
      'kubectl create ingress study --rule="study.example.com/app*=web:80"',
    explanation:
      'The imperative rule is a shortcut, but an Ingress still requires a controller. Check the Ingress address and Service endpoints if traffic fails.',
    minutes: 7,
  },
  {
    id: 'cka-t10',
    domain: 'networking',
    title: 'Test cluster DNS',
    brief:
      'Launch a temporary busybox Pod to resolve kubernetes.default and remove it automatically when the command exits.',
    placeholder: 'kubectl run ...',
    checks: [
      { label: 'Runs busybox', pattern: 'kubectl\\s+run\\s+\\S+\\s+--image=busybox(?::[\\w.-]+)?' },
      { label: 'Removes the Pod after exit', pattern: '--rm\\b' },
      { label: 'Runs nslookup', pattern: 'nslookup\\s+kubernetes\\.default\\b' },
    ],
    hint: 'Use --restart=Never and --rm with an interactive temporary Pod.',
    solution:
      'kubectl run dns-test --image=busybox:1.36 --rm -it --restart=Never -- nslookup kubernetes.default',
    explanation:
      'This tests the Pod DNS path end to end. If it fails cluster-wide, inspect CoreDNS; if only one namespace fails, inspect egress policy to kube-system on port 53.',
    minutes: 5,
  },
  {
    id: 'cka-t11',
    domain: 'storage',
    title: 'Make a StorageClass the default',
    brief:
      'Mark the existing StorageClass standard as the default class for new claims.',
    placeholder: 'kubectl patch storageclass ...',
    checks: [
      { label: 'Patches storageclass standard', pattern: 'kubectl\\s+patch\\s+storageclass\\s+standard\\b' },
      { label: 'Adds the default annotation', pattern: 'storageclass\\.kubernetes\\.io/is-default-class' },
      { label: 'Sets the annotation to true', pattern: '["\']?true["\']?' },
    ],
    hint: 'A JSON merge patch can add metadata.annotations. The annotation key is storageclass.kubernetes.io/is-default-class.',
    solution:
      'kubectl patch storageclass standard -p \'{"metadata":{"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}\'',
    explanation:
      'Only one class should normally be the default. A PVC without storageClassName uses it; set storageClassName: "" to opt out.',
    minutes: 8,
  },
  {
    id: 'cka-t12',
    domain: 'storage',
    title: 'Diagnose a Pending claim',
    brief:
      'PersistentVolumeClaim data is Pending. Show its events and list the available StorageClasses before changing anything.',
    placeholder: 'kubectl describe pvc ...',
    checks: [
      { label: 'Describes the claim', pattern: 'kubectl\\s+describe\\s+pvc\\s+data\\b' },
      { label: 'Lists StorageClasses', pattern: 'kubectl\\s+get\\s+storageclass(?:es)?\\b' },
    ],
    hint: 'describe pvc includes recent events. A separate get storageclass shows provisioners and default status.',
    solution: 'kubectl describe pvc data\nkubectl get storageclass',
    explanation:
      'Pending claims usually reflect missing capacity, an unavailable StorageClass/provisioner, a selector mismatch or WaitForFirstConsumer waiting for a Pod.',
    minutes: 7,
  },
  {
    id: 'cka-t13',
    domain: 'troubleshooting',
    title: 'Recover logs from a crash loop',
    brief:
      'Pod api-0 is restarting. Retrieve the logs from the previous container instance and the current Pod events.',
    placeholder: 'kubectl logs ...',
    checks: [
      { label: 'Reads previous logs', pattern: 'kubectl\\s+logs\\s+api-0\\b[\\s\\S]*--previous\\b' },
      { label: 'Describes the Pod', pattern: 'kubectl\\s+describe\\s+pod\\s+api-0\\b' },
    ],
    hint: 'Use kubectl logs api-0 --previous and kubectl describe pod api-0.',
    solution: 'kubectl logs api-0 --previous\nkubectl describe pod api-0',
    explanation:
      'Previous logs show the terminated container instance. Events explain image, scheduling, probe and restart behavior. Use both before changing the workload.',
    minutes: 6,
  },
  {
    id: 'cka-t14',
    domain: 'troubleshooting',
    title: 'Investigate a Pending Pod',
    brief:
      'Pod worker-0 is Pending. Show the Pod’s scheduling events and the node’s allocated resources.',
    placeholder: 'kubectl describe pod ...',
    checks: [
      { label: 'Describes the Pod', pattern: 'kubectl\\s+describe\\s+pod\\s+worker-0\\b' },
      { label: 'Describes a node', pattern: 'kubectl\\s+describe\\s+node\\s+\\S+' },
    ],
    hint: 'You need to compare the Pod’s requested resources with a node’s allocatable and currently allocated resources.',
    solution: 'kubectl describe pod worker-0\nkubectl describe node <node-name>',
    explanation:
      'Scheduler events name the failed filter, such as insufficient CPU, taints or affinity. Node allocated resources show whether capacity is actually available.',
    minutes: 8,
  },
  {
    id: 'cka-t15',
    domain: 'troubleshooting',
    title: 'Check Service endpoints',
    brief:
      'Users cannot reach Service web. List the EndpointSlices for the Service and describe the Service to inspect its selector and ports.',
    placeholder: 'kubectl get endpointslice ...',
    checks: [
      { label: 'Filters EndpointSlices by Service', pattern: 'kubectl\\s+get\\s+endpointslice\\b[\\s\\S]*kubernetes\\.io/service-name=web\\b' },
      { label: 'Describes Service web', pattern: 'kubectl\\s+describe\\s+svc(?:|\\s+)web\\b|kubectl\\s+describe\\s+service\\s+web\\b' },
    ],
    hint: 'EndpointSlice labels include kubernetes.io/service-name. Use -l to filter.',
    solution:
      'kubectl get endpointslice -l kubernetes.io/service-name=web\nkubectl describe svc web',
    explanation:
      'Empty endpoints point to selector, readiness, namespace or port mismatches. Describe the Service and compare its selector with Pod labels.',
    minutes: 7,
  },
  {
    id: 'cka-t16',
    domain: 'troubleshooting',
    title: 'Roll back a failed release',
    brief:
      'Deployment web was updated and is failing. Roll back to the previous revision and wait for the rollout to complete.',
    placeholder: 'kubectl rollout undo ...',
    checks: [
      { label: 'Rolls back deployment web', pattern: 'kubectl\\s+rollout\\s+undo\\s+deployment(?:/|\\s+)web\\b' },
      { label: 'Waits for rollout', pattern: 'kubectl\\s+rollout\\s+status\\s+deployment(?:/|\\s+)web\\b' },
    ],
    hint: 'rollout undo restores the previous template. Then check status and real traffic.',
    solution: 'kubectl rollout undo deployment/web\nkubectl rollout status deployment/web',
    explanation:
      'Rollback is a fast recovery, not a root-cause fix. Capture the failed revision’s evidence and verify the application, not only the controller.',
    minutes: 6,
  },
  {
    id: 'cka-t17',
    domain: 'troubleshooting',
    title: 'Check control-plane readiness',
    brief:
      'The API is responding slowly. Ask the API server for verbose readiness information and inspect etcd endpoint health.',
    placeholder: 'kubectl get --raw ...',
    checks: [
      { label: 'Reads verbose readyz', pattern: "kubectl\\s+get\\s+--raw=(?:'|\")?/readyz\\?verbose" },
      { label: 'Checks etcd health', pattern: 'etcdctl[\\s\\S]*endpoint\\s+health' },
    ],
    hint: 'The readyz endpoint accepts ?verbose. etcdctl needs the API version and TLS certificate flags.',
    solution:
      "kubectl get --raw='/readyz?verbose'\nsudo ETCDCTL_API=3 etcdctl --endpoints=https://127.0.0.1:2379 --cacert=/etc/kubernetes/pki/etcd/ca.crt --cert=/etc/kubernetes/pki/etcd/server.crt --key=/etc/kubernetes/pki/etcd/server.key endpoint health",
    explanation:
      'Readyz reports each API server check. etcd health covers quorum and latency. If the API server is down, run these checks from the control-plane host instead of through kubectl.',
    minutes: 9,
  },
]
