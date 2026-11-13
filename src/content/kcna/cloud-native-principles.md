# Cloud native principles and the CNCF landscape

Cloud native is a set of architectural and operational choices: package software in containers, orchestrate it dynamically, expose behavior through APIs, and design for failure. The tools are implementations of those choices.

## Twelve-factor habits

The twelve-factor app remains a useful vocabulary:

- one codebase, many deploys
- explicit dependencies
- configuration in the environment
- backing services as attached resources
- stateless processes with disposable containers
- graceful shutdown
- logs as event streams
- administrative tasks as one-off processes

Kubernetes reinforces these ideas. Pods are replaceable, ConfigMaps externalize configuration, and Services abstract backing resources. It also adds new failure modes, so the principles are a starting point, not a complete operating model.

## Architecture patterns

- **Microservices**: independently deployable services with clear boundaries. Benefits include independent scaling; costs include network complexity and distributed debugging.
- **Service mesh**: moves traffic policy, mTLS, retries and telemetry into a data plane. Useful at scale; unnecessary for a small system.
- **Serverless**: abstracts infrastructure further, often with event-driven scaling. Tradeoffs include cold starts and reduced control.
- **Event-driven architecture**: services communicate through events rather than synchronous calls. Improves decoupling but requires idempotency and delivery semantics.
- **GitOps**: Git is the desired-state source, with an agent reconciling the cluster.

There is no universal "best" architecture. Match the operational cost to the problem.

## Navigating the CNCF landscape

The landscape is a map, not a checklist. Learn the categories:

- **Orchestration and scheduling**: Kubernetes, KEDA, Karpenter
- **Networking**: Cilium, Calico, Envoy, CoreDNS, Gateway API implementations
- **Observability**: Prometheus, Grafana, OpenTelemetry, Fluent Bit
- **Storage**: Rook, Longhorn, CSI drivers
- **Security and supply chain**: cert-manager, Kyverno, Sigstore, Trivy
- **Delivery**: Argo CD, Flux, Helm, Kustomize
- **Runtime**: containerd, CRI-O

For each project, ask: what problem does it solve, what does it replace, what new operational burden does it add, and is it mature enough for this context?

## CNCF maturity

CNCF projects move through stages such as sandbox, incubating and graduated. Graduation signals adoption and governance maturity, not a guarantee that a project fits your use case. Always check the project's own documentation and release cadence.

> **Exam lens.** Questions often test category understanding rather than obscure product features. Know what a service mesh, a CNI, a CSI driver, a GitOps controller and an observability pipeline each do.

## A useful heuristic

Start with the platform primitives: containers, Pods, Services, Deployments, ConfigMaps, Secrets and PVCs. Add a project only when a specific operational problem is not well served by those primitives. Complexity is a budget; spend it deliberately.
