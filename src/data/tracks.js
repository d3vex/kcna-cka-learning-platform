export const tracks = [
  {
    id: 'kcna',
    code: 'KCNA',
    title: 'Kubernetes & Cloud Native Associate',
    level: 'Foundations',
    tagline: 'Understand the system before you operate it.',
    description:
      'A complete conceptual foundation in Kubernetes, containers, cloud native architecture and the CNCF ecosystem. Built for students who are new to production infrastructure.',
    accent: '#b8ef67',
    accentInk: '#26330a',
    minutes: 90,
    questionCount: 60,
    format: 'Online proctored multiple-choice',
    version: 'Current CNCF curriculum',
    practiceTarget: 75,
    officialUrl:
      'https://training.linuxfoundation.org/certification/kubernetes-cloud-native-associate/',
    curriculumUrl: 'https://github.com/cncf/curriculum/blob/main/KCNA_Curriculum.pdf',
    domains: [
      {
        id: 'fundamentals',
        title: 'Kubernetes Fundamentals',
        weight: 44,
        color: '#6c8cff',
        summary:
          'Core objects, the API-driven control loop, administration with kubectl, scheduling and the container runtime.',
      },
      {
        id: 'orchestration',
        title: 'Container Orchestration',
        weight: 28,
        color: '#ff8a68',
        summary:
          'Networking, security, troubleshooting and storage: how workloads actually run and fail in a cluster.',
      },
      {
        id: 'delivery',
        title: 'Cloud Native Application Delivery',
        weight: 16,
        color: '#46b99a',
        summary:
          'The path from commit to running software, plus a repeatable method for debugging deployments.',
      },
      {
        id: 'architecture',
        title: 'Cloud Native Architecture',
        weight: 12,
        color: '#c89bff',
        summary:
          'Observability, cloud native principles, the CNCF landscape and open-source collaboration.',
      },
    ],
    modules: [
      {
        id: 'kcna-foundations',
        title: 'The Kubernetes operating model',
        domain: 'fundamentals',
        summary: 'Build the mental model that makes every kubectl command make sense.',
        lessonIds: ['kcna-cluster-model', 'kcna-kubectl-workflow', 'kcna-scheduling-containers'],
      },
      {
        id: 'kcna-orchestration',
        title: 'How a cluster behaves',
        domain: 'orchestration',
        summary: 'Connect pods, services, policy, failure modes and persistent data.',
        lessonIds: ['kcna-pod-networking', 'kcna-security-model', 'kcna-troubleshooting', 'kcna-storage'],
      },
      {
        id: 'kcna-delivery',
        title: 'Shipping software safely',
        domain: 'delivery',
        summary: 'Understand delivery pipelines and debug what reaches the cluster.',
        lessonIds: ['kcna-delivery-pipeline', 'kcna-debugging'],
      },
      {
        id: 'kcna-architecture',
        title: 'The cloud native landscape',
        domain: 'architecture',
        summary: 'Reason about observability, architecture and the community around the code.',
        lessonIds: [
          'kcna-observability',
          'kcna-cloud-native-principles',
          'kcna-community',
        ],
      },
    ],
  },
  {
    id: 'cka',
    code: 'CKA',
    title: 'Certified Kubernetes Administrator',
    level: 'Operator',
    tagline: 'Operate the cluster under pressure.',
    description:
      'A practical administrator track: cluster lifecycle, RBAC, workloads, networking, storage and the troubleshooting habits that carry the largest weight on the CKA exam.',
    accent: '#ffd36e',
    accentInk: '#3b2a00',
    minutes: 120,
    questionCount: 17,
    format: 'Performance-based, command line',
    version: 'Kubernetes v1.37',
    practiceTarget: 66,
    officialUrl:
      'https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/',
    curriculumUrl: 'https://github.com/cncf/curriculum/blob/main/CKA_Curriculum_v1.37.pdf',
    domains: [
      {
        id: 'cluster',
        title: 'Cluster Architecture, Installation & Configuration',
        weight: 25,
        color: '#6c8cff',
        summary:
          'Control plane design, kubeadm lifecycle, RBAC, Helm, Kustomize, CRDs, operators and extension interfaces.',
      },
      {
        id: 'workloads',
        title: 'Workloads & Scheduling',
        weight: 15,
        color: '#46b99a',
        summary:
          'Deployments, configuration, self-healing primitives, autoscaling, admission and placement decisions.',
      },
      {
        id: 'networking',
        title: 'Services & Networking',
        weight: 20,
        color: '#ff8a68',
        summary:
          'Pod connectivity, service types and endpoints, CoreDNS, Ingress, Gateway API and NetworkPolicy.',
      },
      {
        id: 'storage',
        title: 'Storage',
        weight: 10,
        color: '#c89bff',
        summary:
          'Volume types, access modes, reclaim policies, PersistentVolumes and dynamic provisioning.',
      },
      {
        id: 'troubleshooting',
        title: 'Troubleshooting',
        weight: 30,
        color: '#ff6f91',
        summary:
          'Diagnose nodes, control-plane components, workloads, resource pressure, logs, services and DNS.',
      },
    ],
    modules: [
      {
        id: 'cka-cluster',
        title: 'Build and govern the cluster',
        domain: 'cluster',
        summary: 'Know every moving part, then prove you can install, secure and extend it.',
        lessonIds: [
          'cka-cluster-anatomy',
          'cka-kubeadm-lifecycle',
          'cka-rbac',
          'cka-helm-kustomize',
        ],
      },
      {
        id: 'cka-workloads',
        title: 'Run workloads predictably',
        domain: 'workloads',
        summary: 'Own rollout strategy, configuration, placement and resource behaviour.',
        lessonIds: [
          'cka-deployments',
          'cka-config',
          'cka-scheduling',
          'cka-autoscaling-probes',
        ],
      },
      {
        id: 'cka-networking',
        title: 'Connect and protect traffic',
        domain: 'networking',
        summary: 'Trace a packet from a pod to a service, an ingress and the outside world.',
        lessonIds: ['cka-services', 'cka-ingress-gateway', 'cka-network-policy'],
      },
      {
        id: 'cka-storage',
        title: 'Persist data deliberately',
        domain: 'storage',
        summary: 'Choose volume semantics, provision storage and understand what happens on delete.',
        lessonIds: ['cka-volumes', 'cka-storage-classes'],
      },
      {
        id: 'cka-troubleshooting',
        title: 'Diagnose under time pressure',
        domain: 'troubleshooting',
        summary: 'Use evidence, not guesses, from node health to DNS resolution.',
        lessonIds: ['cka-troubleshooting-cluster', 'cka-troubleshooting-workloads'],
      },
    ],
  },
]

export function getTrack(trackId) {
  return tracks.find((track) => track.id === trackId)
}

export function getDomain(trackId, domainId) {
  return getTrack(trackId)?.domains.find((domain) => domain.id === domainId)
}

export function getModule(trackId, moduleId) {
  return getTrack(trackId)?.modules.find((module) => module.id === moduleId)
}
