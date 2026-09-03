# DevOps CI/CD Kubernetes Project #3

Production-style CI/CD for a containerized Node.js and Express application deployed to k3s on AWS EC2.

## Overview

The pipeline validates code, builds and publishes an immutable Docker image, then deploys the exact Git commit to Kubernetes with Helm.

## Tech stack

- Node.js 22 and Express
- Docker and Docker Hub
- GitHub Actions
- AWS EC2 with k3s
- Helm and Traefik Ingress
- Kubernetes Horizontal Pod Autoscaler (HPA)

## Architecture

```text
Developer → GitHub → CI (test/build/push) → CD (SSH) → AWS EC2
                                                    ↓
                                      k3s → Helm → Traefik → devops-app
                                                               ↓
                                                        3–6 application pods
```

## Application API

The application listens on port `3000`.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/` | Returns application information |
| `GET` | `/health` | Returns the health status |

Example response from `/`:

```json
{
  "message": "DevOps Project #3 is running!",
  "version": "1.0.0",
  "environment": "production"
}
```

## Docker

The application uses the lightweight `node:22-alpine` image. The container runs in production mode, installs only production dependencies with `npm ci --omit=dev`, runs as the non-root `node` user, and exposes port `3000`.

Images are published with two tags:

```text
<dockerhub-username>/devops-cicd-k8s-project-3:<git-sha>
<dockerhub-username>/devops-cicd-k8s-project-3:latest
```

Kubernetes deploys the SHA tag so every release is immutable and traceable to its source commit.

## CI/CD pipeline

CI runs on pushes and pull requests targeting `main`:

1. Check out the repository and set up Node.js 22.
2. Install dependencies with `npm ci` and run `npm test`.
3. Build the Docker image and push the SHA and `latest` tags.

After CI succeeds, CD:

1. Checks out the exact commit validated by CI.
2. Connects to the AWS EC2 host over SSH.
3. Copies the Helm chart and runs `helm upgrade --install`.
4. Deploys the SHA-tagged image and waits for the rollout.
5. Verifies the running pods.

Helm and `kubectl` run on the EC2 host, so the Kubernetes API does not need to be publicly exposed.

## Kubernetes configuration

| Setting | Value |
| --- | --- |
| Replicas | 3 |
| Service | ClusterIP |
| Container port | 3000 |
| Ingress | Traefik |
| HPA | 3–6 replicas at 70% CPU |
| Ingress host | `devops-project-3.local` |

Both readiness and liveness probes call `GET /health`.

Resources:

```yaml
requests:
  cpu: 100m
  memory: 128Mi
limits:
  cpu: 250m
  memory: 256Mi
```

The deployment also enforces non-root execution (UID/GID `1000`), disables privilege escalation, drops Linux capabilities, and uses a dedicated ServiceAccount.

## Local development

```bash
cd app
npm install
npm start
```

Open <http://localhost:3000> and check the health endpoint:

```bash
curl http://localhost:3000/health
```

## Kubernetes verification

```bash
kubectl get pods
kubectl get deployment devops-app
kubectl get service devops-app
kubectl get ingress
helm status devops-app
kubectl get deployment devops-app \
  -o jsonpath='{.spec.template.spec.containers[0].image}{"\n"}'
```

## Validation status

The complete workflow has been validated: CI tests, Docker build, Docker Hub push, SHA-based deployment, SSH/CD execution, Helm deployment, k3s rollout, three running pods, and both application endpoints.

## Project outcome

```text
Git → GitHub Actions CI → Docker → Docker Hub → GitHub Actions CD
    → SSH → AWS EC2 → k3s → Helm → Traefik → Kubernetes → Express
```