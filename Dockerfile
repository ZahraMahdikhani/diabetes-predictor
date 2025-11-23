# Use official Python slim image
FROM python:3.10-slim

# set workdir
WORKDIR /app

# install system deps
RUN apt-get update && apt-get install -y build-essential && rm -rf /var/lib/apt/lists/*

# copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# copy app files
COPY . .

# expose port (Render/Heroku usually provide PORT env)
EXPOSE 5000

# use gunicorn for production
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:5000", "--workers", "2", "--threads", "4"]
