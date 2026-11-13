import clusterModel from '../../content/kcna/cluster-model.md?raw'
import kubectlWorkflow from '../../content/kcna/kubectl-workflow.md?raw'
import schedulingContainers from '../../content/kcna/scheduling-containers.md?raw'
import podNetworking from '../../content/kcna/pod-networking.md?raw'
import securityModel from '../../content/kcna/security-model.md?raw'
import troubleshooting from '../../content/kcna/troubleshooting.md?raw'
import storage from '../../content/kcna/storage.md?raw'
import deliveryPipeline from '../../content/kcna/delivery-pipeline.md?raw'
import debugging from '../../content/kcna/debugging.md?raw'
import observability from '../../content/kcna/observability.md?raw'
import cloudNativePrinciples from '../../content/kcna/cloud-native-principles.md?raw'
import community from '../../content/kcna/community.md?raw'

export const kcnaLessons = [
  {
    id: 'kcna-cluster-model',
    trackId: 'kcna',
    domain: 'fundamentals',
    title: 'The cluster as a control loop',
    summary:
      'Learn the desired-state model and the responsibilities of the control plane and worker nodes.',
    minutes: 18,
    objectives: [
      'Describe how the API server, etcd, scheduler and controllers cooperate',
      'Explain the role of kubelet, the container runtime and kube-proxy',
      'Read a Kubernetes object as desired state rather than a command',
    ],
    body: clusterModel,
    lab: {
      title: 'Read the control plane',
      goal: 'Inspect the objects and components that expose how your cluster is assembled.',
      steps: [
        'Start a local single-node cluster with kind or minikube if you do not already have one.',
        'List the nodes and the namespaces that ship with the cluster.',
        'Ask the API server to explain the Pod object and inspect the kube-system pods.',
      ],
      verify: 'You can name the control-plane components and find them running in kube-system.',
      solution: `kubectl get nodes -o wide
kubectl get namespaces
kubectl explain pod --recursive | head -40
kubectl get pods -n kube-system`,
    },
    checkpoint: {
      question:
        'A Deployment asks for three replicas but only two Pods exist. Which component is responsible for closing that gap?',
      options: [
        'The kubelet on each worker node',
        'The controller manager through the ReplicaSet controller',
        'The container runtime on the control-plane node',
        'CoreDNS',
      ],
      answer: 1,
      explanation:
        'Controllers continuously compare observed state with desired state. The ReplicaSet controller creates or removes Pods to reach the requested replica count.',
    },
  },
  {
    id: 'kcna-kubectl-workflow',
    trackId: 'kcna',
    domain: 'fundamentals',
    title: 'kubectl, manifests and namespaces',
    summary:
      'Build a repeatable workflow around contexts, namespaces, labels and server-side validation.',
    minutes: 22,
    objectives: [
      'Switch safely between kubeconfig contexts and namespaces',
      'Choose between imperative commands and declarative manifests',
      'Use labels, selectors and dry-run to inspect changes before applying them',
    ],
    body: kubectlWorkflow,
    lab: {
      title: 'Create and inspect a deployment',
      goal: 'Move from a quick imperative command to a reviewed manifest.',
      steps: [
        'Create a namespace called study.',
        'Generate a Deployment manifest with 2 replicas of nginx using dry-run and save it.',
        'Apply the manifest, label the Deployment, then inspect its Pods by label.',
        'Scale the Deployment to 3 replicas and confirm the rollout status.',
      ],
      verify: 'Three nginx Pods run in the study namespace and carry your label.',
      solution: `kubectl create namespace study
kubectl create deployment web --image=nginx:1.27 --replicas=2 -n study --dry-run=client -o yaml > web.yaml
kubectl apply -f web.yaml -n study
kubectl label deployment web tier=frontend -n study
kubectl get pods -l app=web -n study
kubectl scale deployment web --replicas=3 -n study
kubectl rollout status deployment/web -n study`,
    },
    checkpoint: {
      question: 'What does `kubectl apply --dry-run=server` do?',
      options: [
        'Creates the object but immediately deletes it',
        'Sends the request to the API server for validation and admission without persisting the object',
        'Validates the YAML only on the local machine',
        'Downloads the current object from the server',
      ],
      answer: 1,
      explanation:
        'Server-side dry-run exercises API validation, defaulting and admission logic without writing the object to etcd. Client-side dry-run only checks that the request can be generated.',
    },
  },
  {
    id: 'kcna-scheduling-containers',
    trackId: 'kcna',
    domain: 'fundamentals',
    title: 'Containers, Pods and placement',
    summary:
      'Understand what a container really is, why Pods are the scheduling unit, and how resources shape placement.',
    minutes: 24,
    objectives: [
      'Contrast containers with virtual machines and explain image layers',
      'Describe the Pod lifecycle and multi-container patterns',
      'Predict scheduling outcomes from requests, limits, affinity and taints',
    ],
    body: schedulingContainers,
    lab: {
      title: 'Make scheduling visible',
      goal: 'Create a Pod with resource requests and observe where it lands.',
      steps: [
        'Create a Pod running busybox that requests 100m CPU and 64Mi memory.',
        'Inspect its node assignment, QoS class and events.',
        'Add a node selector that matches one of your cluster nodes and recreate the Pod.',
      ],
      verify: 'The Pod is Running, its QoS class is Burstable, and the events show a successful schedule.',
      solution: `kubectl run resources --image=busybox:1.36 --restart=Never --requests=cpu=100m,memory=64Mi -- sleep 3600
kubectl get pod resources -o wide
kubectl get pod resources -o jsonpath='{.status.qosClass}'
kubectl describe pod resources | sed -n '/Events/,$p'`,
    },
    checkpoint: {
      question: 'Which statement about Kubernetes resource requests is correct?',
      options: [
        'Requests are hard limits enforced by the kernel',
        'Requests tell the scheduler what capacity a Pod needs; limits cap runtime usage',
        'Limits are only used for billing',
        'Pods without requests are guaranteed the node’s full CPU',
      ],
      answer: 1,
      explanation:
        'The scheduler uses requests to find a node with enough allocatable capacity. Limits are enforced at runtime by the container runtime and cgroup settings.',
    },
  },
  {
    id: 'kcna-pod-networking',
    trackId: 'kcna',
    domain: 'orchestration',
    title: 'Pod networking and Services',
    summary:
      'Follow a packet from a Pod IP to a stable Service address and out through ingress.',
    minutes: 26,
    objectives: [
      'Explain the flat Pod network and the role of a CNI plugin',
      'Choose between ClusterIP, NodePort and LoadBalancer services',
      'Trace service discovery through endpoints and CoreDNS',
    ],
    body: podNetworking,
    lab: {
      title: 'Expose an application internally',
      goal: 'Create a Service and prove that DNS and endpoints resolve to healthy Pods.',
      steps: [
        'Deploy two nginx Pods with the label app=web.',
        'Expose them with a ClusterIP Service named web on port 80.',
        'Inspect the Service, its EndpointSlice and the DNS record from a temporary Pod.',
      ],
      verify: 'The Service has two ready endpoints and the DNS lookup returns the ClusterIP.',
      solution: `kubectl create deployment web --image=nginx:1.27 --replicas=2
kubectl expose deployment web --name=web --port=80 --target-port=80
kubectl get svc web
kubectl get endpointslice -l kubernetes.io/service-name=web
kubectl run dns-test --image=busybox:1.36 --rm -it --restart=Never -- nslookup web`,
    },
    checkpoint: {
      question: 'A Service has no endpoints. What is the most direct thing to check?',
      options: [
        'The Service’s selector against the labels of ready Pods',
        'The container image registry credentials',
        'The node’s disk pressure condition',
        'The kubeconfig user name',
      ],
      answer: 0,
      explanation:
        'Endpoints are populated from Pods whose labels match the Service selector and whose readiness gates pass. A selector mismatch is a common cause of an empty endpoint list.',
    },
  },
  {
    id: 'kcna-security-model',
    trackId: 'kcna',
    domain: 'orchestration',
    title: 'The cloud native security model',
    summary:
      'Reason from the four Cs through authentication, authorization and workload isolation.',
    minutes: 24,
    objectives: [
      'Apply the four Cs: cloud, cluster, container and code',
      'Distinguish authentication, authorization and admission',
      'Explain how RBAC, service accounts and NetworkPolicy reduce blast radius',
    ],
    body: securityModel,
    lab: {
      title: 'Grant least privilege',
      goal: 'Create a service account that can read Pods but cannot delete them.',
      steps: [
        'Create a namespace called secure and a service account called reader.',
        'Create a Role allowing get and list on Pods.',
        'Bind the Role to the service account and test with kubectl auth can-i.',
      ],
      verify: 'The reader can get Pods but cannot delete Pods or read Secrets.',
      solution: `kubectl create namespace secure
kubectl create serviceaccount reader -n secure
kubectl create role pod-reader --verb=get,list --resource=pods -n secure
kubectl create rolebinding read-pods --role=pod-reader --serviceaccount=secure:reader -n secure
kubectl auth can-i get pods -n secure --as=system:serviceaccount:secure:reader
kubectl auth can-i delete pods -n secure --as=system:serviceaccount:secure:reader`,
    },
    checkpoint: {
      question: 'Which question does authorization answer?',
      options: [
        'Who are you?',
        'May this authenticated identity perform this action on this resource?',
        'Is the container image signed?',
        'Which node has the most free memory?',
      ],
      answer: 1,
      explanation:
        'Authentication establishes identity. Authorization, commonly through RBAC, decides whether that identity may perform a verb on a resource.',
    },
  },
  {
    id: 'kcna-troubleshooting',
    trackId: 'kcna',
    domain: 'orchestration',
    title: 'A practical troubleshooting loop',
    summary:
      'Replace guesswork with a layered method: state, events, logs, connectivity and resources.',
    minutes: 22,
    objectives: [
      'Read Pod status and events in the right order',
      'Use logs, exec and port-forward as diagnostic tools',
      'Narrow a failure to scheduling, startup, readiness or networking',
    ],
    body: troubleshooting,
    lab: {
      title: 'Diagnose a failing Pod',
      goal: 'Use evidence to distinguish an image problem from an application crash.',
      steps: [
        'Create a Pod that uses the image nginx:does-not-exist.',
        'Inspect its status and events without deleting it.',
        'Create a second Pod with a command that exits immediately and compare the evidence.',
        'Delete both Pods and explain the different failure signatures.',
      ],
      verify: 'You can identify ImagePullBackOff versus CrashLoopBackOff from status and events.',
      solution: `kubectl run bad-image --image=nginx:does-not-exist --restart=Never
kubectl describe pod bad-image | sed -n '/Events/,$p'
kubectl run crash --image=busybox:1.36 --restart=Never -- sh -c 'echo starting; exit 1'
kubectl get pod crash
kubectl logs crash
kubectl delete pod bad-image crash`,
    },
    checkpoint: {
      question: 'A Pod is Pending with the event “0/3 nodes are available: insufficient cpu.” What should you inspect next?',
      options: [
        'The container logs',
        'The Pod’s CPU requests and the nodes’ allocatable CPU',
        'The Service selector',
        'The image pull secret',
      ],
      answer: 1,
      explanation:
        'Pending with an insufficient-resource event is a scheduling failure. Compare requests with allocatable capacity and current requests on each node.',
    },
  },
  {
    id: 'kcna-storage',
    trackId: 'kcna',
    domain: 'orchestration',
    title: 'Storage from emptyDir to PVC',
    summary:
      'Choose ephemeral, node-local and dynamically provisioned storage based on lifecycle and access needs.',
    minutes: 24,
    objectives: [
      'Compare emptyDir, hostPath and persistent volume claims',
      'Explain PV, PVC, StorageClass and reclaim policy relationships',
      'Select an access mode that matches the workload',
    ],
    body: storage,
    lab: {
      title: 'Persist data through a Pod restart',
      goal: 'Write to a PVC and verify the data survives Pod replacement.',
      steps: [
        'Create a PVC requesting 1Gi with the default StorageClass.',
        'Mount it at /data in a busybox Pod and write a file.',
        'Delete and recreate the Pod, then read the file back.',
      ],
      verify: 'The file written by the first Pod is present in the replacement Pod.',
      solution: `kubectl create -f - <<'YAML'
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: study-data
spec:
  accessModes: [ReadWriteOnce]
  resources:
    requests:
      storage: 1Gi
YAML
kubectl run writer --image=busybox:1.36 --restart=Never --overrides='{"spec":{"containers":[{"name":"writer","image":"busybox:1.36","command":["sh","-c","echo hello > /data/note; sleep 3600"],"volumeMounts":[{"name":"data","mountPath":"/data"}]}],"volumes":[{"name":"data","persistentVolumeClaim":{"claimName":"study-data"}}]}}'
kubectl delete pod writer
kubectl run reader --image=busybox:1.36 --restart=Never --overrides='{"spec":{"containers":[{"name":"reader","image":"busybox:1.36","command":["cat","/data/note"],"volumeMounts":[{"name":"data","mountPath":"/data"}]}],"volumes":[{"name":"data","persistentVolumeClaim":{"claimName":"study-data"}}]}}'
kubectl logs reader`,
    },
    checkpoint: {
      question: 'What does a StorageClass primarily enable?',
      options: [
        'Encryption of all Pod traffic',
        'Dynamic provisioning of PersistentVolumes from PersistentVolumeClaims',
        'Automatic container image updates',
        'Cross-namespace Service discovery',
      ],
      answer: 1,
      explanation:
        'A StorageClass describes a provisioner and parameters. When a PVC references it, the provisioner can create a matching PV dynamically.',
    },
  },
  {
    id: 'kcna-delivery-pipeline',
    trackId: 'kcna',
    domain: 'delivery',
    title: 'From commit to cluster',
    summary:
      'Understand the delivery chain: build, scan, publish, render, deploy and observe.',
    minutes: 20,
    objectives: [
      'Describe the stages of a cloud native delivery pipeline',
      'Explain immutable image tags, GitOps and progressive delivery',
      'Know where Helm and Kustomize fit',
    ],
    body: deliveryPipeline,
    lab: {
      title: 'Read a rendered manifest',
      goal: 'See how a templating tool turns parameters into Kubernetes objects.',
      steps: [
        'Install Helm if needed and create a throwaway chart.',
        'Render the chart with helm template.',
        'Compare the rendered YAML with the values that produced it.',
      ],
      verify: 'You can point to the values key that controls the rendered image tag.',
      solution: `helm create study-chart
helm template study study-chart --set image.tag=1.27.0 | grep -A2 'image:'
rm -rf study-chart`,
    },
    checkpoint: {
      question: 'Why should a deployment reference an immutable image digest or unique tag?',
      options: [
        'It reduces the image size',
        'It makes the exact artifact deployed auditable and reproducible',
        'It bypasses the need for a registry',
        'It automatically configures a Service',
      ],
      answer: 1,
      explanation:
        'Unique references prevent an unchanged tag from silently pointing at different code and make rollbacks and provenance checks meaningful.',
    },
  },
  {
    id: 'kcna-debugging',
    trackId: 'kcna',
    domain: 'delivery',
    title: 'Debugging a broken deployment',
    summary:
      'Use a deployment failure taxonomy to move from symptom to root cause quickly.',
    minutes: 20,
    objectives: [
      'Classify failures as image, configuration, startup, readiness, scheduling or networking',
      'Use rollout status and ReplicaSet history to understand change',
      'Know when to inspect events, logs, probes or Service endpoints',
    ],
    body: debugging,
    lab: {
      title: 'Break and repair a rollout',
      goal: 'Introduce a bad image tag, observe the rollout behavior, then restore service.',
      steps: [
        'Create a Deployment with 3 replicas of nginx:1.27.',
        'Update the image to a tag that does not exist.',
        'Inspect rollout status, ReplicaSets and Pod events.',
        'Roll back and confirm three healthy Pods.',
      ],
      verify: 'The failed rollout does not remove healthy old Pods, and rollback returns the Deployment to a complete state.',
      solution: `kubectl create deployment web --image=nginx:1.27 --replicas=3
kubectl set image deployment/web nginx=nginx:missing-tag
kubectl rollout status deployment/web --timeout=20s
kubectl get rs
kubectl describe pod -l app=web | sed -n '/Events/,$p'
kubectl rollout undo deployment/web
kubectl rollout status deployment/web`,
    },
    checkpoint: {
      question: 'A new Deployment revision is failing, but the old Pods remain healthy. What does this indicate?',
      options: [
        'The Deployment strategy is Recreate',
        'The rolling update is preserving availability while the new ReplicaSet fails to become ready',
        'The Service has been deleted',
        'etcd has lost quorum',
      ],
      answer: 1,
      explanation:
        'The default RollingUpdate strategy keeps old Pods available until new ones become ready. A stalled rollout with old replicas intact points to the new revision rather than a total cluster outage.',
    },
  },
  {
    id: 'kcna-observability',
    trackId: 'kcna',
    domain: 'architecture',
    title: 'Observability that answers questions',
    summary:
      'Connect metrics, logs and traces to the questions operators actually ask.',
    minutes: 20,
    objectives: [
      'Distinguish metrics, logs and traces and their tradeoffs',
      'Explain the roles of Prometheus, Grafana and OpenTelemetry',
      'Reason about SLIs, SLOs and alert quality',
    ],
    body: observability,
    lab: {
      title: 'Read resource signals',
      goal: 'Use built-in cluster signals before reaching for a full observability stack.',
      steps: [
        'Run kubectl top nodes and kubectl top pods if metrics-server is installed.',
        'Inspect Pod restart counts and container termination reasons.',
        'Describe how you would turn a crash loop into an actionable alert.',
      ],
      verify: 'You can name the signal, threshold and likely owner for a crash-loop alert.',
      solution: `kubectl top nodes
kubectl top pods -A --sort-by=memory | head
kubectl get pods -A --sort-by='.status.containerStatuses[0].restartCount' | tail -10
kubectl get pod <pod> -o jsonpath='{.status.containerStatuses[*].lastState}'`,
    },
    checkpoint: {
      question: 'Which signal best answers “why is this one request slow?”',
      options: [
        'A cluster-wide CPU graph',
        'A distributed trace showing time spent across services',
        'The number of nodes in the cluster',
        'A monthly billing report',
      ],
      answer: 1,
      explanation:
        'Traces preserve causal spans across service boundaries, making it possible to locate where a specific request spent its time. Metrics are better for aggregate trends.',
    },
  },
  {
    id: 'kcna-cloud-native-principles',
    trackId: 'kcna',
    domain: 'architecture',
    title: 'Cloud native principles and the CNCF landscape',
    summary:
      'Understand the design ideas behind the tooling and navigate the ecosystem without memorizing logos.',
    minutes: 22,
    objectives: [
      'Apply twelve-factor ideas to containerized services',
      'Explain orchestration, service mesh, serverless and GitOps at a conceptual level',
      'Place major CNCF projects into functional categories',
    ],
    body: cloudNativePrinciples,
    lab: {
      title: 'Map a project to a problem',
      goal: 'Practice choosing tools from the CNCF landscape by problem, not by popularity.',
      steps: [
        'Open the CNCF landscape and pick three categories: observability, networking and supply chain.',
        'For each category, identify one project and the problem it solves.',
        'Write a one-sentence tradeoff for adopting it.',
      ],
      verify: 'Your notes explain the problem and tradeoff without listing every project.',
      solution: `Example:
- Observability: Prometheus collects time-series metrics; tradeoff is operating long-term storage.
- Networking: Cilium provides CNI and network policy; tradeoff is added operational complexity.
- Supply chain: Sigstore signs and verifies artifacts; tradeoff is identity and key management.`,
    },
    checkpoint: {
      question: 'Which practice most directly supports the twelve-factor principle of configuration separation?',
      options: [
        'Baking environment-specific values into the image',
        'Injecting configuration through environment variables or mounted ConfigMaps',
        'Storing secrets in the Git repository in plain text',
        'Using one mutable image tag for every environment',
      ],
      answer: 1,
      explanation:
        'Twelve-factor applications separate configuration from code so the same build can run in different environments. Kubernetes ConfigMaps and Secrets support externalized configuration.',
    },
  },
  {
    id: 'kcna-community',
    trackId: 'kcna',
    domain: 'architecture',
    title: 'Working in the cloud native community',
    summary:
      'Navigate CNCF governance, contribution paths and the habits that keep your knowledge current.',
    minutes: 16,
    objectives: [
      'Describe how CNCF projects, SIGs and TAGs relate',
      'Find authoritative documentation and release notes',
      'Choose a realistic next certification and contribution path',
    ],
    body: community,
    lab: {
      title: 'Build a staying-current routine',
      goal: 'Create a lightweight weekly routine for following Kubernetes change.',
      steps: [
        'Bookmark the Kubernetes release notes, CNCF blog and the official curriculum page.',
        'Pick one CNCF project and read its contributing guide.',
        'Write down one small contribution you could make this month.',
      ],
      verify: 'You have three authoritative sources and one concrete contribution idea.',
      solution: `Suggested routine:
1. Read the Kubernetes release notes for the minor version in the exam.
2. Skim one CNCF blog post or TAG update.
3. Re-run one lab from this course without notes.
4. Record one question you could not answer and close that gap.`,
    },
    checkpoint: {
      question: 'What is the best source of truth for an exam objective?',
      options: [
        'A random social media post',
        'The CNCF curriculum PDF linked from the official certification page',
        'An exam dump shared by a previous candidate',
        'A vendor’s marketing page',
      ],
      answer: 1,
      explanation:
        'The CNCF curriculum and the Linux Foundation certification page are the authoritative sources. Exam dumps violate certification agreements and are unreliable.',
    },
  },
]
