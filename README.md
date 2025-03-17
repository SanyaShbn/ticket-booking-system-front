## Установка и запуск приложения

В этом кратком руководстве описывается процесс настройки и запуска приложения локально.
Для корректной работы приложения необходимо скачать и выболнить сборку двух других проектов (бэкенд-часть приложения): TicketBookingSystem и ImageService.
Ссылка на репозитории, где также есть гайды и пояснения, как все корректно настроить и запустить: 

```
https://github.com/SanyaShbn/TicketBookingSystem.git

https://github.com/SanyaShbn/ImageService.git
```

### Установка

Сначала клонируйте репозиторий проекта:

```
https://github.com/SanyaShbn/ticket-booking-system-front.git
```

Выполните сборку проекта:

```
ng build
```

Для запуска docker-compose (проверьте что для контейнера данного проекта и контейнеров обоих проектов, связанных с бэкенд-частью, создана одна сеть в docker, данный шаг описан в README.md вышеупомянутых проектов):

```
docker-compose up
```

### Использование

Тестирование должно быть доступно на порту 4200:

```
http://localhost:4200
```

**Данные администратора (зарегистрироваться можно только в качестве обычного пользователя):**

username/email: admin@gmail.com

пароль: Admin_12345

## Описание процесса деплоя в kubernetes (на данный момент, инструкция - только для Windows)

### Предварительные требования

Убедитесь, что установлены следующие инструменты:

- [Minikube](https://minikube.sigs.k8s.io/docs/start/) (для локального Kubernetes-кластера)
- [kubectl](https://kubernetes.io/docs/tasks/tools/) (для управления кластером)
- Docker (с поддержкой локального демона Minikube)
- В качестве виртуальной машины использовал Oracle VirtualBox(https://www.virtualbox.org/wiki/Downloads)

### Шаг 1: Запуск Minikube

Запустите Minikube, если он ещё не запущен (в PowerShell):

```
minikube start --no-vtx-check
```

Настройте Docker-клиент на использование Docker-демона Minikube:

```
minikube docker-env | Invoke-Expression
```

### Шаг 2: Построение Docker-образа

Перед сборокй image для kubernetes необходимо внести некоторые изменения в файле nginx.conf в корне проекта. На данный момент у вас он должен выглядеть следующим образом:

```
# nginx.conf

events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 4200;
        server_name localhost;

        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri /index.html;
        }

        location /api/ {
            proxy_pass http://spring-boot-app:8080/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /ws/ {
            proxy_pass http://image-service:8081/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }
    }
}
```

Нужно изменить proxy_pass для бэкенд-сервисов на localhost:

```
# nginx.conf (для k8s)

events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 4200;
        server_name localhost;

        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri /index.html;
        }

        location /api/ {
            proxy_pass http://localhost:8080/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /ws/ {
            proxy_pass http://localhost:8081/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }
    }
}
```

Перейдите в корневую директорию проекта и выполните:

```
docker build -t ticket-booking-system-frontend:latest .
```

### Шаг 3: Деплой проекта в kubernetes

Перейдите в директорию 'kubernetes' (папка, содержащая необходимый .yaml-файл) вашего проекта в PowerShell/командной строке.

Примените файл frontend-deployment.yaml:

```
kubectl apply -f frontend-deployment.yaml
```

Перенаправьте порт для локального доступа после его запуска:

```
kubectl port-forward svc/frontend-service 4200:4200
```

Теперь тестирование сервиса доступно по адресу http://localhost:4200 (повторюсь, что до сборки данного проекта прошу ознакомиться с инструкциями, данными в github-репозиториях указанных в начале гайда проектов для бэкенд-части данного приложения).