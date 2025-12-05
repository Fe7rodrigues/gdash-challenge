package main

import (
	"bytes"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

// URL interna do serviço NestJS dentro do Docker
const BackendURL = "http://backend:3000/api/weather/logs"

func main() {
	// 1. Recupera configurações do ambiente
	rabbitHost := os.Getenv("RABBITMQ_HOST")
	rabbitUser := os.Getenv("RABBITMQ_USER")
	rabbitPass := os.Getenv("RABBITMQ_PASS")
	rabbitPort := os.Getenv("RABBITMQ_PORT")

	connString := fmt.Sprintf("amqp://%s:%s@%s:%s/", rabbitUser, rabbitPass, rabbitHost, rabbitPort)

	// 2. Loop de conexão resiliente
	var conn *amqp.Connection
	var err error

	log.Println("Aguardando inicialização do RabbitMQ...")
	for i := 0; i < 15; i++ {
		conn, err = amqp.Dial(connString)
		if err == nil {
			break
		}
		log.Printf("Tentativa %d falhou. Retentando em 5s...", i+1)
		time.Sleep(5 * time.Second)
	}

	if err != nil {
		log.Fatalf("Falha crítica ao conectar no RabbitMQ: %v", err)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("Falha ao abrir canal: %v", err)
	}
	defer ch.Close()

	// 3. Garante fila
	q, err := ch.QueueDeclare("weather_data", true, false, false, false, nil)
	if err != nil {
		log.Fatalf("Falha ao declarar fila: %v", err)
	}

	// 4. Configura consumidor
	msgs, err := ch.Consume(q.Name, "", false, false, false, false, nil)
	if err != nil {
		log.Fatalf("Falha ao registrar consumidor: %v", err)
	}

	// 5. Loop de processamento
	forever := make(chan struct{})

	go func() {
		for d := range msgs {
			log.Printf(" [⬇️] Recebido: %s", d.Body)

			// Tenta enviar para o Backend
			if err := sendToBackend(d.Body); err != nil {
				log.Printf(" [!] Erro ao enviar para API: %v", err)
				d.Nack(false, true) 
				time.Sleep(2 * time.Second)
				continue
			}

			log.Println(" [✅] Sucesso! Dados salvos na API.")
			d.Ack(false)
		}
	}()

	log.Printf(" [*] Worker Go rodando. Enviando dados para: %s", BackendURL)
	<-forever
}

func sendToBackend(jsonData []byte) error {
	// Cria a requisição HTTP POST
	req, err := http.NewRequest("POST", BackendURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	// Executa a requisição
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	// Verifica se a API aceitou (200 OK ou 201 Created)
	if resp.StatusCode != 200 && resp.StatusCode != 201 {
		return fmt.Errorf("API retornou status inválido: %d", resp.StatusCode)
	}

	return nil
}