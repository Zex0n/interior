# Инструкция по запуску проекта с использованием Docker

## Подготовленные файлы

1. `docker-compose.yml` - основной файл для запуска всех сервисов
2. `home_design_app_backend/Dockerfile` - Dockerfile для бэкенда (Flask)
3. `home_design_app_frontend/Dockerfile` - Dockerfile для фронтенда (React)
4. `nginx.conf` - конфигурация Nginx для проксирования запросов

## Предварительные требования

Для запуска проекта вам потребуется:

1. Docker Engine (версия 19.03.0+)
2. Docker Compose (версия 1.27.0+)

### Установка Docker и Docker Compose

#### Для Ubuntu/Debian:
```bash
# Установка Docker
sudo apt-get update
sudo apt-get install docker.io

# Установка Docker Compose
sudo apt-get install docker-compose-plugin
# или
sudo curl -L "https://github.com/docker/compose/releases/download/v2.18.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### Для macOS:
Установите Docker Desktop с официального сайта: https://www.docker.com/products/docker-desktop

#### Для Windows:
Установите Docker Desktop с официального сайта: https://www.docker.com/products/docker-desktop

## Запуск проекта

1. Поместите все файлы в одну директорию, сохраняя структуру:
   ```
   project_root/
   ├── docker-compose.yml
   ├── nginx.conf
   ├── home_design_app_backend/
   │   ├── Dockerfile
   │   └── ... (исходный код бэкенда)
   └── home_design_app_frontend/
       ├── Dockerfile
       └── ... (исходный код фронтенда)
   ```

2. Откройте терминал и перейдите в корневую директорию проекта:
   ```bash
   cd path/to/project_root
   ```

3. Запустите сборку и запуск контейнеров:
   ```bash
   docker-compose up --build
   ```
   
   Или в фоновом режиме:
   ```bash
   docker-compose up --build -d
   ```

4. После успешного запуска, приложение будет доступно по адресам:
   - Фронтенд: http://localhost
   - Бэкенд API: http://localhost/api
   - Прямой доступ к бэкенду: http://localhost:5000

## Управление контейнерами

- Остановка контейнеров:
  ```bash
  docker-compose down
  ```

- Просмотр логов:
  ```bash
  docker-compose logs
  ```
  
  Или для конкретного сервиса:
  ```bash
  docker-compose logs backend
  ```

- Перезапуск отдельного сервиса:
  ```bash
  docker-compose restart backend
  ```

## Настройка переменных окружения

Вы можете настроить переменные окружения, создав файл `.env` в корневой директории проекта:

```
DB_USERNAME=postgres
DB_PASSWORD=your_secure_password
DB_NAME=homedesign
```

## Структура проекта в Docker

- **db**: PostgreSQL база данных
- **backend**: Flask приложение, обрабатывающее API запросы
- **frontend**: React приложение (только для сборки)
- **nginx**: Веб-сервер, отдающий статические файлы фронтенда и проксирующий запросы к бэкенду

## Примечания

- Данные PostgreSQL сохраняются в Docker volume `postgres_data`
- Для продакшн-окружения рекомендуется настроить SSL в Nginx
- В текущей конфигурации фронтенд собирается при запуске docker-compose и отдаётся через Nginx
