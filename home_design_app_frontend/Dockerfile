# Этап сборки
FROM node:20-alpine AS builder

# Установка pnpm
RUN npm install -g pnpm

WORKDIR /app

# Копирование файлов package.json и pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Установка зависимостей
RUN pnpm install --frozen-lockfile

# Копирование остального исходного кода фронтенда
COPY . .

# Создание директорий для моделей и миниатюр, если их нет
RUN mkdir -p public/models public/thumbnails

# Сборка приложения
RUN pnpm run build

# Конечный образ будет содержать только собранные статические файлы
FROM alpine:latest
WORKDIR /app/dist
COPY --from=builder /app/dist .
