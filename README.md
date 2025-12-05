# ⛈️ GDASH Weather Challenge 2025/02

Solução Full-Stack para monitoramento climático distribuído, desenvolvida como parte do processo seletivo GDASH. O sistema utiliza uma arquitetura de microsserviços para coletar, processar, armazenar e visualizar dados meteorológicos em tempo real, com insights gerados por IA.

## 🚀 Tecnologias Utilizadas

O projeto foi construído sobre uma arquitetura baseada em contêineres Docker:

* **Coleta de Dados:** Python 3.10 + Schedule (Consumo da Open-Meteo API)
* **Mensageria:** RabbitMQ (Comunicação assíncrona robusta)
* **Worker:** Go 1.21 (Processamento de alta performance)
* **Backend:** NestJS + Mongoose (API REST e Regras de Negócio/IA)
* **Banco de Dados:** MongoDB (Armazenamento NoSQL de logs)
* **Frontend:** React + Vite + TailwindCSS (Dashboard interativo)
* **Infraestrutura:** Docker & Docker Compose

## 🏗️ Arquitetura da Solução

O fluxo de dados segue um pipeline unidirecional para garantir consistência e desacoplamento:

1.  **Python Collector:** Busca dados de clima (Temp, Umidade, Vento) a cada intervalo.
2.  **RabbitMQ:** Recebe os dados brutos e os enfileira (`weather_data`).
3.  **Go Worker:** Consome a fila, valida a integridade dos dados e envia para a API.
4.  **NestJS API:** Recebe os dados, aplica regras de **IA Simbólica** para gerar insights e salva no MongoDB.
5.  **React Frontend:** Consulta a API periodicamente e exibe os dados e insights em tempo real.

## 📦 Como Rodar o Projeto

### Pré-requisitos
* Docker e Docker Compose instalados.

### Passo a Passo

1.  Clone o repositório:
    ```bash
    git clone [https://github.com/fe7rodrigues/gdash-challenge.git](https://github.com/fe7rodriguesgit add ./gdash-challenge.git)
    cd gdash-challenge
    ```

2.  Suba os contêineres:
    ```bash
    docker compose up --build -d
    ```

3.  Aguarde alguns instantes para que todos os serviços iniciem.

## 🌐 Acesso aos Serviços

| Serviço | URL | Credenciais (se houver) |
| :--- | :--- | :--- |
| **Frontend (Dashboard)** | http://localhost:5173 | - |
| **API Backend** | http://localhost:3000/api/weather/logs | - |
| **RabbitMQ Management** | http://localhost:15672 | `admin` / `admin123` |

## ✨ Funcionalidades Principais

* **Monitoramento em Tempo Real:** Atualização automática dos dados no dashboard.
* **Insights de IA:** O sistema analisa as condições (ex: calor extremo, chuva) e emite alertas inteligentes.
* **Histórico:** Tabela com os últimos registros coletados.
* **Exportação de Dados:** Download de relatórios completos em **Excel (.xlsx)** e **CSV**.
* **Resiliência:** O Worker em Go possui sistema de *retry* automático em caso de falha na conexão.

## 📂 Estrutura do Projeto