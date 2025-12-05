# Usa uma imagem Python leve
FROM python:3.10-slim

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Desabilita buffer para logs aparecerem imediatamente no Docker
ENV PYTHONUNBUFFERED=1

# Copia e instala dependências
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia o código fonte
COPY main.py .

# Comando para rodar a aplicação
CMD ["python", "main.py"]