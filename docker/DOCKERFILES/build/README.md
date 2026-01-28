# Docker build

To be executed from git root path

### core

```
docker buildx build --platform linux/amd64 --file docker/DOCKERFILES/build/core.Dockerfile --tag core:local .
```

### automate-scan

```
docker buildx build --platform linux/amd64 --file docker/DOCKERFILES/build/generic.Dockerfile --build-arg APP=automate-scan --target runner --tag automate-scan:local .
```

### sync-scan

Same as automate-scan

### preview-generator

```
docker buildx build --platform linux/amd64 --file docker/DOCKERFILES/build/generic.Dockerfile --build-arg APP=preview-generator --target runner-preview-generator --tag preview-generator:local .
```
