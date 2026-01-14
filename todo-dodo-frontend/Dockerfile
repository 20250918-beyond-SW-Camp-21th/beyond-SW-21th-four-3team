# 1. 빌드 스테이지
FROM node:20-alpine AS build

WORKDIR /app

# 의존성 파일 복사 및 설치
COPY package*.json ./
RUN npm ci

# 소스 코드 복사 및 빌드
COPY . .
RUN npm run build

# 2. 실행 스테이지
FROM nginx:alpine

# 빌드된 정적 파일 복사
# (주의: Vue/Vite는 기본이 dist지만, 혹시 build 폴더로 생성된다면 경로를 /app/build로 바꿔야 합니다)
COPY --from=build /app/dist /usr/share/nginx/html

# [추가됨] 작성한 Nginx 설정 파일을 컨테이너의 설정 경로로 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 80 포트 노출
EXPOSE 80

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]