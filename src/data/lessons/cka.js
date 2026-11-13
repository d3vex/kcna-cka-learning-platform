import clusterAnatomy from '../../content/cka/cluster-anatomy.md?raw'
import kubeadmLifecycle from '../../content/cka/kubeadm-lifecycle.md?raw'
import rbac from '../../content/cka/rbac.md?raw'
import helmKustomize from '../../content/cka/helm-kustomize.md?raw'
import deployments from '../../content/cka/deployments.md?raw'
import config from '../../content/cka/config.md?raw'
import scheduling from '../../content/cka/scheduling.md?raw'
import autoscalingProbes from '../../content/cka/autoscaling-probes.md?raw'
import services from '../../content/cka/services.md?raw'
import ingressGateway from '../../content/cka/ingress-gateway.md?raw'
import networkPolicy from '../../content/cka/network-policy.md?raw'
import volumes from '../../content/cka/volumes.md?raw'
import storageClasses from '../../content/cka/storage-classes.md?raw'
import troubleshootingCluster from '../../content/cka/troubleshooting-cluster.md?raw'
import troubleshootingWorkloads from '../../content/cka/troubleshooting-workloads.md?raw'

export const ckaLessons = [
  {
    id: 'cka-cluster-anatomy',
    trackId: 'cka',
    domain: 'cluster',
    title: 'Cluster anatomy and the control plane',
    summary:
      'Map every component, port and data path you will diagnose when the cluster misbehaves.',
    minutes: 26,
    objectives: [
      'Describe control-plane and node component interactions',
      'Identify the data stored in etcd and how to back it up',
      'Read static Pod manifests and component health endpoints',
    ],
    body: clusterAnatomy,
    lab: {
      title: 'Inspect a live control plane',
      goal: 'Prove which components run where and how they are configured.',
      steps: [
        'List control-plane Pods across all namespaces.',
        'Inspect the kube-apiserver static Pod manifest directory.',
        'Read the kube-system ConfigMaps used by kubeadm.',
        'Check the health endpoints on the API server if you have access.',
      ],
      verify: 'You can locate the static Pod manifests and explain which host path backs the API server config.',
      solution: `kubectl get pods -n kube-system -o wide
sudo ls -l /etc/kubernetes/manifests
sudo sed -n '1,80p' /etc/kubernetes/manifests/kube-apiserver.yaml
kubectl get cm -n kube-system
kubectl get --raw='/readyz?verbose'`,
    },
    checkpoint: {
      question: 'Where does a kubeadm control-plane node store static Pod manifests?',
      options: ['/var/lib/kubelet', '/etc/kubernetes/manifests', '/etc/cni/net.d', '/var/log/pods'],
      answer: 1,
      explanation:
        'The kubelet watches /etc/kubernetes/manifests. kubeadm writes static Pod definitions there for the API server, scheduler, controller manager and etcd.',
    },
  },
  {
    id: 'cka-kubeadm-lifecycle',
    trackId: 'cka',
    domain: 'cluster',
    title: 'Provisioning and upgrading with kubeadm',
    summary:
      'Walk the cluster lifecycle from prerequisites and init through join, upgrade and certificate renewal.',
    minutes: 30,
    objectives: [
      'Prepare a host and bootstrap a control plane with kubeadm',
      'Join workers and understand the bootstrap token flow',
      'Plan and execute a control-plane and node upgrade',
    ],
    body: kubeadmLifecycle,
    lab: {
      title: 'Plan a safe upgrade',
      goal: 'Produce the command sequence for a minor-version upgrade without skipping a step.',
      steps: [
        'Check the current kubeadm and kubelet versions.',
        'Drain a worker and inspect what happens to its Pods.',
        'Upgrade kubeadm, run kubeadm upgrade plan, then apply the node upgrade.',
        'Uncordon the node and verify all Pods return.',
      ],
      verify: 'The node reports the target kubelet version and is Ready with no unexpected Pods left pending.',
      solution: `kubectl get nodes -o wide
kubectl drain <node> --ignore-daemonsets --delete-emptydir-data
sudo apt-mark unhold kubeadm kubelet kubectl
sudo apt-get install -y kubeadm=<version> kubelet=<version> kubectl=<version>
sudo kubeadm upgrade plan
sudo kubeadm upgrade node
sudo systemctl daemon-reload && sudo systemctl restart kubelet
kubectl uncordon <node>
kubectl get nodes`,
    },
    checkpoint: {
      question: 'What is the correct order for upgrading a worker node with kubeadm?',
      options: [
        'Drain, upgrade kubeadm, run kubeadm upgrade node, upgrade kubelet, uncordon',
        'Upgrade kubelet, drain, restart etcd, uncordon',
        'Delete the node, rejoin it, then upgrade the control plane',
        'Run kubeadm reset, then kubeadm init',
      ],
      answer: 0,
      explanation:
        'Drain first to move workloads safely. Upgrade the kubeadm binary, apply the node upgrade, upgrade kubelet/kubectl, restore the service and uncordon.',
    },
  },
  {
    id: 'cka-rbac',
    trackId: 'cka',
    domain: 'cluster',
    title: 'RBAC: identity, roles and bindings',
    summary:
      'Build least-privilege access for users and workloads, then prove it with impersonation.',
    minutes: 28,
    objectives: [
      'Distinguish Role, ClusterRole, RoleBinding and ClusterRoleBinding',
      'Grant namespaced and cluster-scoped permissions correctly',
      'Test access with kubectl auth can-i and impersonation',
    ],
    body: rbac,
    lab: {
      title: 'Build a namespace operator',
      goal: 'Grant a service account full control of Deployments and Pods in one namespace only.',
      steps: [
        'Create namespace team-a and service account deployer.',
        'Create a Role for deployments, replicasets and pods with the needed verbs.',
        'Bind it with a RoleBinding and verify access in team-a and denial in default.',
      ],
      verify: 'Impersonating the service account allows creating a Deployment in team-a but not in default.',
      solution: `kubectl create ns team-a
kubectl -n team-a create sa deployer
kubectl -n team-a create role deployer --verb=get,list,watch,create,update,patch,delete --resource=deployments,replicasets,pods
kubectl -n team-a create rolebinding deployer --role=deployer --serviceaccount=team-a:deployer
kubectl auth can-i create deployments -n team-a --as=system:serviceaccount:team-a:deployer
kubectl auth can-i create deployments -n default --as=system:serviceaccount:team-a:deployer`,
    },
    checkpoint: {
      question: 'A ClusterRoleBinding grants a ClusterRole to a ServiceAccount. What is the scope of that permission?',
      options: [
        'Only the ServiceAccount namespace',
        'The entire cluster, including all namespaces and cluster-scoped resources allowed by the role',
        'Only the kube-system namespace',
        'Only resources with the same name as the ServiceAccount',
      ],
      answer: 1,
      explanation:
        'A ClusterRoleBinding applies cluster-wide. Use a RoleBinding when the same ClusterRole should be limited to one namespace.',
    },
  },
  {
    id: 'cka-helm-kustomize',
    trackId: 'cka',
    domain: 'cluster',
    title: 'Helm, Kustomize and extension points',
    summary:
      'Render and install cluster components, then understand CRDs, operators and the CNI/CSI/CRI interfaces.',
    minutes: 28,
    objectives: [
      'Use Helm repositories, values and release history',
      'Build a Kustomize overlay and apply it with kubectl',
      'Explain how CRDs and operators extend the API',
    ],
    body: helmKustomize,
    lab: {
      title: 'Install and inspect a release',
      goal: 'Use Helm to install a small chart and inspect the rendered resources.',
      steps: [
        'Add a public chart repository and search for a simple chart.',
        'Render the chart with helm template before installing.',
        'Install it into a dedicated namespace, inspect the release, then uninstall.',
      ],
      verify: 'You can show the rendered manifests, release status and the clean uninstall.',
      solution: `helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
helm search repo bitnami/nginx
helm template demo bitnami/nginx --namespace demo --create-namespace > rendered.yaml
helm install demo bitnami/nginx --namespace demo --create-namespace
helm list -n demo
helm uninstall demo -n demo`,
    },
    checkpoint: {
      question: 'What does a CustomResourceDefinition add to a cluster?',
      options: [
        'A new container runtime',
        'A new API type and endpoint that controllers can reconcile',
        'A replacement for etcd',
        'A mandatory network plugin',
      ],
      answer: 1,
      explanation:
        'A CRD registers a new kind with the API server. An operator or controller then watches those custom resources and performs the desired work.',
    },
  },
  {
    id: 'cka-deployments',
    trackId: 'cka',
    domain: 'workloads',
    title: 'Deployments, rollouts and rollbacks',
    summary:
      'Control revision history, rollout strategy and availability during change.',
    minutes: 26,
    objectives: [
      'Create and update a Deployment with a recorded cause',
      'Tune maxSurge, maxUnavailable and minReadySeconds',
      'Roll back a failed revision and verify availability',
    ],
    body: deployments,
    lab: {
      title: 'Perform a controlled rollout',
      goal: 'Update an image, observe revision history and roll back cleanly.',
      steps: [
        'Create a 3-replica Deployment with nginx:1.27.',
        'Record a change cause and update to nginx:1.28.',
        'Inspect rollout status and the two ReplicaSets.',
        'Roll back and verify the original image is running.',
      ],
      verify: 'Revision history shows both changes and the final Pods use nginx:1.27.',
      solution: `kubectl create deployment web --image=nginx:1.27 --replicas=3
kubectl annotate deployment/web kubernetes.io/change-cause="initial nginx 1.27"
kubectl set image deployment/web nginx=nginx:1.28
kubectl annotate deployment/web kubernetes.io/change-cause="upgrade nginx 1.28"
kubectl rollout status deployment/web
kubectl rollout history deployment/web
kubectl rollout undo deployment/web
kubectl get pods -l app=web -o jsonpath='{.items[*].spec.containers[*].image}'`,
    },
    checkpoint: {
      question: 'Which Deployment strategy recreates all Pods and can cause downtime?',
      options: ['RollingUpdate', 'Recreate', 'Canary', 'BlueGreen'],
      answer: 1,
      explanation:
        'The Recreate strategy terminates old Pods before creating new ones. RollingUpdate preserves availability by replacing Pods gradually.',
    },
  },
  {
    id: 'cka-config',
    trackId: 'cka',
    domain: 'workloads',
    title: 'Configuration with ConfigMaps and Secrets',
    summary:
      'Inject configuration without rebuilding images, and understand update and immutability behavior.',
    minutes: 26,
    objectives: [
      'Create and consume ConfigMaps as env vars, args and files',
      'Create and consume Secrets safely',
      'Predict which updates require a Pod restart',
    ],
    body: config,
    lab: {
      title: 'Mount configuration as files',
      goal: 'Project a ConfigMap and Secret into a Pod and verify the mounted content.',
      steps: [
        'Create a ConfigMap with app.properties and a Secret with a password.',
        'Mount both into a busybox Pod at /config and /secret.',
        'Read the files, then update the ConfigMap and observe the delay before the projected file changes.',
      ],
      verify: 'Both files appear, and the ConfigMap volume reflects the update without recreating the Pod.',
      solution: `kubectl create configmap app-config --from-literal=app.properties='mode=study'
kubectl create secret generic app-secret --from-literal=password='s3cr3t'
kubectl run config-demo --image=busybox:1.36 --restart=Never --overrides='{"spec":{"containers":[{"name":"config-demo","image":"busybox:1.36","command":["sh","-c","cat /config/app.properties; cat /secret/password; sleep 3600"],"volumeMounts":[{"name":"config","mountPath":"/config"},{"name":"secret","mountPath":"/secret"}]}],"volumes":[{"name":"config","configMap":{"name":"app-config"}},{"name":"secret","secret":{"secretName":"app-secret"}}]}}'
kubectl logs config-demo`,
    },
    checkpoint: {
      question: 'A ConfigMap used only through envFrom is updated. What happens to the running Pod?',
      options: [
        'Environment variables update automatically',
        'The Pod restarts automatically',
        'The running container keeps its original environment until it is recreated',
        'The ConfigMap change is rejected',
      ],
      answer: 2,
      explanation:
        'Environment variables are fixed when the container starts. Mounted ConfigMap volumes are updated eventually, but env-based configuration requires a new container.',
    },
  },
  {
    id: 'cka-scheduling',
    trackId: 'cka',
    domain: 'workloads',
    title: 'Scheduling, affinity and disruption budgets',
    summary:
      'Place Pods intentionally and protect availability during voluntary disruptions.',
    minutes: 30,
    objectives: [
      'Use nodeSelector, node affinity and pod affinity/anti-affinity',
      'Apply taints and tolerations to reserve nodes',
      'Protect workloads with PodDisruptionBudgets',
    ],
    body: scheduling,
    lab: {
      title: 'Reserve a node for a workload',
      goal: 'Taint a node, add a toleration and confirm the Pod lands there.',
      steps: [
        'Label and taint a worker node dedicated=gpu:NoSchedule.',
        'Create a Pod with the matching toleration and nodeSelector.',
        'Verify placement, then remove the taint and delete the Pod.',
      ],
      verify: 'Without the toleration the Pod stays Pending; with it, the Pod schedules on the tainted node.',
      solution: `kubectl label node <node> dedicated=gpu
kubectl taint node <node> dedicated=gpu:NoSchedule
kubectl run gpu-demo --image=busybox:1.36 --restart=Never --overrides='{"spec":{"nodeSelector":{"dedicated":"gpu"},"tolerations":[{"key":"dedicated","operator":"Equal","value":"gpu","effect":"NoSchedule"}],"containers":[{"name":"gpu-demo","image":"busybox:1.36","command":["sleep","3600"]}]}}'
kubectl get pod gpu-demo -o wide
kubectl taint node <node> dedicated=gpu:NoSchedule-
kubectl delete pod gpu-demo`,
    },
    checkpoint: {
      question: 'A Pod has a toleration for a taint but no nodeSelector for that node. Will it necessarily run there?',
      options: [
        'Yes, a toleration forces scheduling to that node',
        'No, a toleration permits scheduling but does not attract the Pod to the node',
        'Yes, taints override affinity',
        'No, only DaemonSets can use tolerations',
      ],
      answer: 1,
      explanation:
        'Tolerations allow a Pod to be placed on a tainted node. Node affinity or a selector is needed to make that node the preferred or required target.',
    },
  },
  {
    id: 'cka-autoscaling-probes',
    trackId: 'cka',
    domain: 'workloads',
    title: 'Probes and workload autoscaling',
    summary:
      'Make health checks meaningful and scale on signals rather than guesses.',
    minutes: 28,
    objectives: [
      'Configure startup, readiness and liveness probes correctly',
      'Understand HPA metrics, behavior and prerequisites',
      'Recognize when VPA or cluster autoscaling is the right tool',
    ],
    body: autoscalingProbes,
    lab: {
      title: 'Add a readiness probe',
      goal: 'Prevent traffic from reaching an application until it is ready.',
      steps: [
        'Create a Deployment whose app listens on port 80.',
        'Add an HTTP readiness probe on / with a short initial delay.',
        'Inspect the Pod readiness condition and endpoints before and after the app is ready.',
      ],
      verify: 'The Pod becomes Ready only after the probe succeeds and the Service has an endpoint.',
      solution: `kubectl create deployment web --image=nginx:1.27 --replicas=2
kubectl patch deployment web --type=json -p='[{"op":"add","path":"/spec/template/spec/containers/0/readinessProbe","value":{"httpGet":{"path":"/","port":80},"initialDelaySeconds":2,"periodSeconds":5}}]'
kubectl rollout status deployment/web
kubectl get pods -l app=web -o jsonpath='{range .items[*]}{.metadata.name}{" ready="}{.status.containerStatuses[0].ready}{"\\n"}{end}'`,
    },
    checkpoint: {
      question: 'Which probe should you use to avoid restarting a container that is merely slow to start?',
      options: ['Liveness probe', 'Readiness probe', 'Startup probe', 'Exec probe'],
      answer: 2,
      explanation:
        'A startup probe gives a slow-starting application time to initialize. Liveness probes can restart containers; readiness removes them from service endpoints.',
    },
  },
  {
    id: 'cka-services',
    trackId: 'cka',
    domain: 'networking',
    title: 'Services, endpoints and cluster DNS',
    summary:
      'Debug traffic by following the Service path from name resolution to a ready Pod.',
    minutes: 28,
    objectives: [
      'Create ClusterIP, NodePort and LoadBalancer services',
      'Inspect EndpointSlices and diagnose empty endpoints',
      'Resolve service names across namespaces with CoreDNS',
    ],
    body: services,
    lab: {
      title: 'Prove a Service path',
      goal: 'Trace DNS, endpoints and HTTP through a Service.',
      steps: [
        'Deploy two nginx Pods with a shared label.',
        'Create a ClusterIP Service on port 80.',
        'Inspect the EndpointSlice, then test DNS and HTTP from a temporary Pod.',
      ],
      verify: 'The DNS name resolves to the Service IP and HTTP returns the nginx welcome page.',
      solution: `kubectl create deployment web --image=nginx:1.27 --replicas=2
kubectl expose deployment web --port=80 --target-port=80
kubectl get svc web
kubectl get endpointslice -l kubernetes.io/service-name=web -o yaml
kubectl run nettest --image=busybox:1.36 --rm -it --restart=Never -- sh -c 'nslookup web; wget -qO- http://web'`,
    },
    checkpoint: {
      question: 'A NodePort Service is created but external clients cannot connect. Which is a likely cause?',
      options: [
        'The Service has no ClusterIP',
        'A firewall or security group blocks the node port',
        'CoreDNS is not installed',
        'The Pods are using the wrong container runtime',
      ],
      answer: 1,
      explanation:
        'NodePort opens a port on each node, but external network controls may still block it. Check firewall/security group rules and whether the node is reachable.',
    },
  },
  {
    id: 'cka-ingress-gateway',
    trackId: 'cka',
    domain: 'networking',
    title: 'Ingress, Gateway API and traffic flow',
    summary:
      'Route HTTP traffic with the right resource and isolate failures to the controller or backend.',
    minutes: 30,
    objectives: [
      'Create an Ingress with host and path routing',
      'Explain the Ingress controller and Gateway API resource model',
      'Diagnose TLS and backend failures',
    ],
    body: ingressGateway,
    lab: {
      title: 'Publish an app over HTTP',
      goal: 'Route a hostname to a Service through an Ingress controller.',
      steps: [
        'Install an Ingress controller such as ingress-nginx in a local cluster.',
        'Deploy two apps and create Services.',
        'Create an Ingress routing /app-a and /app-b to the right Services.',
        'Test with curl and the Host header.',
      ],
      verify: 'Both paths return the expected app response through the controller.',
      solution: `kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
kubectl create deployment app-a --image=nginx:1.27
kubectl create deployment app-b --image=httpd:2.4
kubectl expose deployment app-a --port=80
kubectl expose deployment app-b --port=80
kubectl create ingress demo --rule='study.example.com/app-a*=app-a:80' --rule='study.example.com/app-b*=app-b:80'
kubectl get ingress
curl -H 'Host: study.example.com' http://localhost/app-a`,
    },
    checkpoint: {
      question: 'An Ingress exists but no external IP or address is assigned. What is the first thing to check?',
      options: [
        'The Pod image tag',
        'Whether an Ingress controller is installed and ready',
        'The node’s container runtime version',
        'The PersistentVolume reclaim policy',
      ],
      answer: 1,
      explanation:
        'An Ingress is a routing declaration; it does nothing without an Ingress controller. Check the controller Deployment/Service and its status before editing the Ingress.',
    },
  },
  {
    id: 'cka-network-policy',
    trackId: 'cka',
    domain: 'networking',
    title: 'NetworkPolicy: default deny to precise allow',
    summary:
      'Build isolation from zero trust, then add only the flows the application needs.',
    minutes: 28,
    objectives: [
      'Explain default allow and how policy selection changes it',
      'Write ingress and egress rules with namespace and pod selectors',
      'Verify policy behavior with controlled connectivity tests',
    ],
    body: networkPolicy,
    lab: {
      title: 'Isolate a backend',
      goal: 'Allow only the frontend to reach the backend on port 80.',
      steps: [
        'Create frontend and backend Deployments with distinct labels and Services.',
        'Apply a default-deny ingress policy in the namespace.',
        'Add a policy allowing frontend Pods to reach backend Pods on port 80.',
        'Test connectivity from frontend, an unrelated Pod and the host.',
      ],
      verify: 'Frontend reaches backend; an unrelated Pod is denied; DNS still works for allowed traffic.',
      solution: `kubectl create ns policy-demo
kubectl -n policy-demo create deployment frontend --image=nginx:1.27
kubectl -n policy-demo create deployment backend --image=nginx:1.27
kubectl -n policy-demo expose deployment frontend --port=80
kubectl -n policy-demo expose deployment backend --port=80
cat <<'YAML' | kubectl -n policy-demo apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-ingress
spec:
  podSelector: {}
  policyTypes: [Ingress]
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: frontend-to-backend
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes: [Ingress]
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: frontend
      ports:
        - protocol: TCP
          port: 80
YAML
kubectl -n policy-demo run client --image=busybox:1.36 --rm -it --restart=Never -- wget -qO- --timeout=2 http://backend`,
    },
    checkpoint: {
      question: 'What happens when a NetworkPolicy selects a Pod for ingress but has no ingress rules?',
      options: [
        'All ingress is allowed',
        'All ingress to the selected Pod is denied',
        'Only DNS is denied',
        'The policy is ignored until an egress rule is added',
      ],
      answer: 1,
      explanation:
        'Selecting a Pod with policyTypes Ingress isolates it. With no allow rules, no ingress traffic is permitted. Add rules for the flows you need.',
    },
  },
  {
    id: 'cka-volumes',
    trackId: 'cka',
    domain: 'storage',
    title: 'Volumes, PVs and PVCs',
    summary:
      'Match volume type and access mode to the data lifecycle, then diagnose binding failures.',
    minutes: 28,
    objectives: [
      'Mount emptyDir, ConfigMap, Secret and PVC volumes',
      'Understand PV/PVC binding and access modes',
      'Diagnose Pending claims and multi-attach errors',
    ],
    body: volumes,
    lab: {
      title: 'Persist and inspect a claim',
      goal: 'Create a PVC, mount it, and observe the bound PV.',
      steps: [
        'Create a 1Gi PVC using the default StorageClass.',
        'Mount it into a Pod and write a file.',
        'Inspect the PVC, PV and the Pod’s volume mounts.',
      ],
      verify: 'The PVC is Bound, the PV matches the claim, and the file survives a Pod recreation.',
      solution: `kubectl create -f - <<'YAML'
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: data
spec:
  accessModes: [ReadWriteOnce]
  resources:
    requests:
      storage: 1Gi
YAML
kubectl get pvc data
kubectl get pv
kubectl run writer --image=busybox:1.36 --restart=Never --overrides='{"spec":{"containers":[{"name":"writer","image":"busybox:1.36","command":["sh","-c","echo persisted > /data/out; sleep 3600"],"volumeMounts":[{"name":"data","mountPath":"/data"}]}],"volumes":[{"name":"data","persistentVolumeClaim":{"claimName":"data"}}]}}'
kubectl exec writer -- cat /data/out`,
    },
    checkpoint: {
      question: 'A PVC stays Pending while a suitable PV exists. Which mismatch is most likely?',
      options: [
        'The Pod has no Service',
        'Access mode, storage class, capacity or selector does not match',
        'The node has no kube-proxy',
        'The image tag is mutable',
      ],
      answer: 1,
      explanation:
        'Binding requires compatibility on capacity, access modes, storage class and any selector. A Pending claim with an available PV usually points to one of those constraints.',
    },
  },
  {
    id: 'cka-storage-classes',
    trackId: 'cka',
    domain: 'storage',
    title: 'StorageClasses and dynamic provisioning',
    summary:
      'Control provisioning, binding mode and reclaim behavior for production data.',
    minutes: 24,
    objectives: [
      'Create a StorageClass and provision a PV from a claim',
      'Choose Immediate versus WaitForFirstConsumer binding',
      'Reason about Delete versus Retain reclaim policies',
    ],
    body: storageClasses,
    lab: {
      title: 'Compare binding modes',
      goal: 'Observe when a dynamically provisioned volume is created.',
      steps: [
        'Inspect the default StorageClass and its volumeBindingMode.',
        'Create a PVC and compare its status before and after a consuming Pod is scheduled.',
        'Inspect the resulting PV and its reclaim policy.',
      ],
      verify: 'With WaitForFirstConsumer, the claim remains Pending until a Pod consumes it.',
      solution: `kubectl get storageclass
kubectl get storageclass -o jsonpath='{range .items[*]}{.metadata.name}{" "}{.volumeBindingMode}{" "}{.reclaimPolicy}{"\\n"}{end}'
kubectl create -f - <<'YAML'
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: delayed
spec:
  accessModes: [ReadWriteOnce]
  resources:
    requests:
      storage: 1Gi
YAML
kubectl get pvc delayed
kubectl run consumer --image=busybox:1.36 --restart=Never --overrides='{"spec":{"containers":[{"name":"consumer","image":"busybox:1.36","command":["sleep","3600"],"volumeMounts":[{"name":"data","mountPath":"/data"}]}],"volumes":[{"name":"data","persistentVolumeClaim":{"claimName":"delayed"}}]}}'
kubectl get pvc delayed`,
    },
    checkpoint: {
      question: 'What does a Retain reclaim policy do when the PVC is deleted?',
      options: [
        'Deletes the PV and backing storage',
        'Keeps the PV and its data for manual cleanup or reuse',
        'Automatically rebinds the PV to another namespace',
        'Formats the volume and returns it to the default class',
      ],
      answer: 1,
      explanation:
        'Retain preserves the PV after claim deletion. The PV becomes Released and requires an administrator to clean up or rebind it deliberately.',
    },
  },
  {
    id: 'cka-troubleshooting-cluster',
    trackId: 'cka',
    domain: 'troubleshooting',
    title: 'Diagnosing nodes and control-plane components',
    summary:
      'Work from node conditions to static Pods, etcd and the API server without breaking quorum.',
    minutes: 32,
    objectives: [
      'Read node conditions and system-level evidence',
      'Diagnose kubelet, static Pod and certificate failures',
      'Check etcd health and API server readiness safely',
    ],
    body: troubleshootingCluster,
    lab: {
      title: 'Investigate a NotReady node',
      goal: 'Follow a layered diagnostic sequence and record evidence at each step.',
      steps: [
        'Inspect node conditions and the kubelet service status.',
        'Read kubelet logs and check the container runtime.',
        'Verify the node can reach the API server and that certificates are valid.',
        'Write a short cause statement before attempting a fix.',
      ],
      verify: 'You can distinguish a kubelet failure from network, disk pressure or runtime failure using evidence.',
      solution: `kubectl describe node <node> | sed -n '/Conditions/,/Addresses/p'
sudo systemctl status kubelet --no-pager
sudo journalctl -u kubelet -n 100 --no-pager
sudo systemctl status containerd --no-pager
sudo crictl ps
kubectl get --raw='/readyz?verbose'
sudo kubeadm certs check-expiration`,
    },
    checkpoint: {
      question: 'A node is NotReady and kubelet logs show it cannot reach the API server. What should you check first?',
      options: [
        'The application Deployment replicas',
        'Node network connectivity, API server endpoint and certificates',
        'The Service selector',
        'The PersistentVolume reclaim policy',
      ],
      answer: 1,
      explanation:
        'Kubelet must reach the API server with valid credentials. Check network paths, the configured API endpoint and certificate expiry before changing workloads.',
    },
  },
  {
    id: 'cka-troubleshooting-workloads',
    trackId: 'cka',
    domain: 'troubleshooting',
    title: 'Diagnosing workloads, services and DNS',
    summary:
      'Use events, logs, endpoints and in-cluster tests to localize failures quickly.',
    minutes: 34,
    objectives: [
      'Diagnose Pending, crash-looping and unready workloads',
      'Trace Service traffic through endpoints and NetworkPolicy',
      'Debug CoreDNS resolution and resource pressure',
    ],
    body: troubleshootingWorkloads,
    lab: {
      title: 'Find the broken link',
      goal: 'Localize a service outage to the workload, Service, DNS or policy layer.',
      steps: [
        'Deploy a working app and Service, then intentionally change the Service selector.',
        'Confirm the outage and inspect EndpointSlices.',
        'Restore the selector and test DNS plus HTTP from a temporary Pod.',
        'Add a NetworkPolicy that denies traffic and observe the difference in symptoms.',
      ],
      verify: 'You can explain each failure signature and identify the layer from evidence.',
      solution: `kubectl create deployment web --image=nginx:1.27 --replicas=2
kubectl expose deployment web --port=80
kubectl get endpointslice -l kubernetes.io/service-name=web
kubectl patch svc web -p '{"spec":{"selector":{"app":"wrong"}}}'
kubectl get endpointslice -l kubernetes.io/service-name=web
kubectl patch svc web -p '{"spec":{"selector":{"app":"web"}}}'
kubectl run nettest --image=busybox:1.36 --rm -it --restart=Never -- sh -c 'nslookup web; wget -qO- --timeout=2 http://web'`,
    },
    checkpoint: {
      question: 'DNS resolution fails for all Services in the cluster. What is the most likely shared dependency?',
      options: [
        'Each application Deployment',
        'CoreDNS Pods or their Service/network path',
        'The Ingress controller',
        'The container image tags',
      ],
      answer: 1,
      explanation:
        'All names resolving through cluster DNS share CoreDNS and its Service path. Check CoreDNS Pod health, the kube-dns Service and network policy affecting DNS.',
    },
  },
]
