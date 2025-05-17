#FROM python:3.11-slim
FROM dockerhub-mirror.services.mts.ru/python:3.11-slim

# Установка рабочей директории
WORKDIR /app

# Копирование файла зависимостей и установка зависимостей
COPY ./home_design_app_backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копирование исходного кода приложения
COPY ./home_design_app_backend/src /app/src

# Указание порта, на котором будет работать приложение
EXPOSE 8100
ENV FLASK_RUN_PORT=8100
# Переменные окружения для Flask (можно переопределить в docker-compose.yml)
ENV FLASK_APP=src/main.py
ENV FLASK_RUN_HOST=0.0.0.0
ENV FLASK_ENV=development
# Переменные окружения для базы данных (будут установлены в docker-compose.yml)
# ENV DB_USERNAME=postgres
# ENV DB_PASSWORD=password
# ENV DB_HOST=db
# ENV DB_PORT=5432
# ENV DB_NAME=homedesign

# Команда для запуска приложения
CMD ["flask", "run"]
#CMD ["python", "-m", "src.main"]
