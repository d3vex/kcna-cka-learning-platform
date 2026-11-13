# A practical troubleshooting loop

Troubleshooting is evidence management. Start with the smallest question that can eliminate the largest part of the system, then move one layer inward.

## The loop

1. **State the symptom** in observable terms: Pending, CrashLoopBackOff, 503, timeout, high latency.
2. **Check object state** with `get` and `describe`.
3. **Read events** in chronological order.
4. **Inspect logs** and, if needed, exec into the container.
5. **Test connectivity** from the right place.
6. **Check resources** on the node and in the namespace.
7. **Change one thing**, verify, and record the result.

Avoid changing several variables at once. You will not know which change fixed the problem, and you may create a second one.

## State and events first

```bash
kubectl get pod -o wide
kubectl describe pod <pod>
kubectl get events --sort-by=.lastTimestamp
```

`describe` gives you status, conditions, container states, mounts and recent events in one place. The event at the bottom is often the most recent, but do not ignore earlier warnings.

## Common signatures

| Symptom | Likely layer | First check |
| --- | --- | --- |
| Pending | Scheduling | Requests, node capacity, taints, affinity |
| ImagePullBackOff | Registry/image | Image name, tag, pull secret, network |
| CrashLoopBackOff | Application/startup | Logs, command, config, probes, exit code |
| Running but not Ready | Probe/application | Readiness probe, logs, dependencies |
| Service returns 503 | Routing/endpoints | Selector, ready Pods, targetPort, NetworkPolicy |
| DNS timeout | DNS/network | CoreDNS pods, resolv.conf, NetworkPolicy |
| Evicted | Node resources | Disk, memory, ephemeral storage pressure |

## Logs and streams

```bash
kubectl logs <pod>
kubectl logs <pod> -c <container>
kubectl logs <pod> --previous
kubectl logs -l app=web --tail=50
kubectl exec -it <pod> -- sh
```

`--previous` is essential after a restart: it shows the logs from the terminated container instance. If the container never started, there may be no logs at all, so events become the primary evidence.

## Connectivity tests

Test from the same namespace and from a different one. A Service name resolves differently depending on scope.

```bash
kubectl run nettest --image=busybox:1.36 --rm -it --restart=Never -- sh
# inside the pod:
nslookup web
wget -qO- http://web
```

If DNS works but the HTTP request fails, move to Service ports, endpoints and NetworkPolicy. If DNS fails, check CoreDNS and the Pod's DNS configuration.

## Resource pressure

```bash
kubectl top nodes
kubectl top pods -A
kubectl describe node <node> | sed -n '/Allocated resources/,/Events/p'
```

CPU throttling shows up as latency, not necessarily as a failed Pod. Memory pressure can cause OOMKills or node evictions. Check requests, limits and actual usage together.

> **Exam lens.** Explain the difference between a scheduling failure and a runtime failure before you run a command. The evidence you need is different.

## Close the loop

After the fix, verify the original symptom is gone, check that related workloads still work, and write down the cause. A good incident note is shorter than the investigation and more useful than the logs.
