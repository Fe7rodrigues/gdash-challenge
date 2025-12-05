import os
import time
import json
import requests
import pika
import schedule
from datetime import datetime

# 1. Configurações via Variáveis de Ambiente
RABBIT_HOST = os.getenv('RABBITMQ_HOST', 'rabbitmq')
RABBIT_USER = os.getenv('RABBITMQ_USER', 'guest')
RABBIT_PASS = os.getenv('RABBITMQ_PASS', 'guest')
LATITUDE = os.getenv('LATITUDE', '0')
LONGITUDE = os.getenv('LONGITUDE', '0')

# URL da API Open-Meteo (Gratuita e não requer chave)
API_URL = f"https://api.open-meteo.com/v1/forecast?latitude={LATITUDE}&longitude={LONGITUDE}&current=temperature_2m,relative_humidity_2m,is_day,precipitation,rain,wind_speed_10m"

def get_weather_data():
    """Busca dados da API Open-Meteo"""
    try:
        print(f"[{datetime.now()}] Buscando dados meteorológicos...")
        response = requests.get(API_URL)
        response.raise_for_status() # Lança erro se status != 200
        data = response.json()
        
        # Simplificando o payload para o nosso sistema
        current = data.get('current', {})
        payload = {
            "timestamp": datetime.now().isoformat(),
            "latitude": LATITUDE,
            "longitude": LONGITUDE,
            "temperature": current.get('temperature_2m'),
            "humidity": current.get('relative_humidity_2m'),
            "wind_speed": current.get('wind_speed_10m'),
            "condition": "Day" if current.get('is_day') == 1 else "Night",
            "rain_prob": current.get('precipitation', 0)
        }
        return payload
    except Exception as e:
        print(f"Erro ao buscar dados: {e}")
        return None

def send_to_queue(data):
    """Envia os dados para o RabbitMQ"""
    if not data:
        return

    credentials = pika.PlainCredentials(RABBIT_USER, RABBIT_PASS)
    
    try:
        # Conexão com o RabbitMQ
        connection = pika.BlockingConnection(pika.ConnectionParameters(
            host=RABBIT_HOST, 
            credentials=credentials
        ))
        channel = connection.channel()

        # Declara a fila (garante que ela existe)
        queue_name = 'weather_data'
        channel.queue_declare(queue=queue_name, durable=True)

        # Publica a mensagem
        message = json.dumps(data)
        channel.basic_publish(
            exchange='',
            routing_key=queue_name,
            body=message,
            properties=pika.BasicProperties(
                delivery_mode=2,  # Torna a mensagem persistente
            )
        )
        print(f" [x] Enviado para fila: {message}")
        connection.close()
    except Exception as e:
        print(f"Erro ao conectar no RabbitMQ: {e}")

def job():
    """Função principal executada pelo agendador"""
    weather_data = get_weather_data()
    send_to_queue(weather_data)

# Configura o Dockerfile para rodar imediatamente ao iniciar e depois a cada hora
if __name__ == "__main__":
    print("Iniciando serviço de coleta de dados...")
    
    # Executa uma vez imediatamente para teste
    job()
    
    # Agenda para rodar a cada 1 hora
    schedule.every(1).hours.do(job)

    while True:
        schedule.run_pending()
        time.sleep(1)