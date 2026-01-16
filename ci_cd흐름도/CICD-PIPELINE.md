# Jenkins CI/CD 파이프라인 구조

## 개요

GitHub 푸시 → Jenkins 빌드 → Docker Hub 푸시 → K8s 매니페스트 업데이트 자동화

## 파이프라인 흐름

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   GitHub    │────▶│   Jenkins   │────▶│ Docker Hub  │────▶│ K8s Cluster │
│   (Push)    │     │   (Build)   │     │   (Push)    │     │  (Deploy)   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
     │                    │                   │                    │
     │  Webhook 트리거     │  이미지 빌드       │  이미지 저장        │  매니페스트 적용
     └────────────────────┴───────────────────┴────────────────────┘
```

## 스테이지 설명

| 스테이지 | 설명 |
|---------|------|
| Checkout | GitHub에서 소스 코드 가져오기 |
| Backend Build | todo-dodo에서 Gradle 빌드 |
| Backend Docker Build & Push | 백엔드 Docker 이미지 빌드 후 Docker Hub 푸시 |
| Frontend Docker Build & Push | 프론트엔드 Docker 이미지 빌드 후 Docker Hub 푸시 |
| K8S Manifest Update | 매니페스트 파일 이미지 태그 업데이트 후 GitHub 커밋 |

## Docker 이미지

| 서비스 | 이미지명 | 태그 |
|--------|---------|------|
| 백엔드 | o2ppo/todoback002 | {빌드번호}, latest |
| 프론트엔드 | leehyungwook/todo-dodo-front | {빌드번호}, latest |

## Jenkins Credentials 설정

| ID | 타입 | 용도 |
|----|------|------|
| dockerhub-credentials | Username with password | Docker Hub 로그인 |
| github | Username with password | GitHub 푸시 (매니페스트 업데이트) |

## 파일 구조

```
프로젝트/
├── Jenkinsfile                    # 파이프라인 스크립트
├── todo-dodo/                     # 백엔드 (Spring Boot)
│   ├── Dockerfile
│   ├── gradlew
│   └── src/
├── todo-dodo-frontend/            # 프론트엔드 (Vue.js)
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/
└── kube_folder/                   # K8s 매니페스트
    ├── tododep001.yml             # 백엔드 Deployment
    ├── todoser001.yml             # 백엔드 Service
    ├── frontdep001.yml            # 프론트엔드 Deployment
    ├── frontser001.yml            # 프론트엔드 Service
    ├── ingress001.yml             # Ingress
    └── todo-secret.yml            # Secret (템플릿)
```

## 사용 방법

1. Jenkins에 Credentials 등록
2. Pipeline Job 생성 → Pipeline script에 Jenkinsfile 내용 붙여넣기
3. GitHub Webhook 설정 (ngrok 사용)
4. 코드 푸시하면 자동 빌드/배포
