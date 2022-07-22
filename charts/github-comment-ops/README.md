# github-comment-ops

![Version: 1.2.1](https://img.shields.io/badge/Version-1.2.1-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: v1.1.1](https://img.shields.io/badge/AppVersion-v1.1.1-informational?style=flat-square)

A tool for managing GitHub issues and pull requests via comment-ops. It uses GitHub webhooks to scale across repositories without needing to add a GitHub action to each of them.

## Chart deployment

You can deploy this application to Kubernetes with the helm chart included in this repo:

```
helm repo add github-comment-ops https://timja.github.io/github-comment-ops
helm install github-comment-ops github-comment-ops/github-comment-ops
```

## Example

```yaml
ingress:
  enabled: true
  hosts:
    - host: chart-example.local
      paths:
        - path: /
          pathType: ImplementationSpecific

github:
  app_id: 111111
  app_private_key: |
    -----BEGIN RSA PRIVATE KEY-----
    ...
    -----END RSA PRIVATE KEY-----
  webhook_secret: thisisnotarealsecret
```

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| affinity | object | `{}` | Object for node affinity, passed through as-is |
| autoscaling.enabled | bool | `false` | Enables autoscaling with the HorizontalPodAutoscaler |
| autoscaling.maxReplicas | int | `5` |  |
| autoscaling.minReplicas | int | `1` |  |
| autoscaling.targetCPUUtilizationPercentage | int | `80` |  |
| fullnameOverride | string | `""` |  |
| github.app_id | string | `nil` | The app ID for the GitHub app (required) |
| github.app_private_key | string | `nil` | The private key for the GitHub app (required) |
| github.webhook_secret | string | `nil` | The webhook secret for the GitHub app (required) |
| image.pullPolicy | string | `"IfNotPresent"` |  |
| image.repository | string | `"ghcr.io/timja/github-comment-ops"` |  |
| image.tag | string | `{{ .Chart.appVersion }}` | Overrides the image tag whose default is the chart appVersion. |
| imagePullSecrets | list | `[]` |  |
| ingress.annotations | object | `{}` | Key value pairs for annotations, e.g. `kubernetes.io/tls-acme: "true"` |
| ingress.className | string | `""` |  |
| ingress.enabled | bool | `false` |  |
| ingress.hosts[0].host | string | `"chart-example.local"` |  |
| ingress.hosts[0].paths[0].path | string | `"/"` |  |
| ingress.hosts[0].paths[0].pathType | string | `"ImplementationSpecific"` |  |
| ingress.tls | list | `[]` |  |
| nameOverride | string | `""` |  |
| nodeSelector | object | `{}` | Object for node selector, passed through as-is |
| podAnnotations | object | `{}` |  |
| podSecurityContext | object | `{}` |  |
| replicaCount | int | `1` |  |
| resources | object | `{}` | Resource limits |
| securityContext | object | `{}` |  |
| service.port | int | `80` |  |
| service.type | string | `"ClusterIP"` |  |
| serviceAccount.annotations | object | `{}` |  |
| serviceAccount.create | bool | `true` |  |
| serviceAccount.name | string | `""` |  |
| tolerations | list | `[]` | List of tolerations, passed through as-is |