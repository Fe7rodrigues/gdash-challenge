# ⛈️ GDASH Weather Challenge 2025/02

> 📹 **[Clique aqui para assistir ao vídeo explicativo do projeto (5 min)](https://youtu.be/dIEO-BcmfvM)**

Solução Full-Stack para monitoramento climático distribuído, desenvolvida como parte do processo seletivo GDASH. O sistema utiliza uma arquitetura de microsserviços para coletar, processar, armazenar e visualizar dados meteorológicos em tempo real, com segurança e insights gerados por IA.

## 🚀 Tecnologias Utilizadas

O projeto foi construído sobre uma arquitetura baseada em contêineres Docker:

* **Coleta de Dados:** Python 3.10 + Schedule (Consumo da Open-Meteo API)
* **Mensageria:** RabbitMQ (Comunicação assíncrona robusta)
* **Worker:** Go 1.21 (Processamento de alta performance)
* **Backend:** NestJS + Mongoose (API REST, Auth JWT e Regras de Negócio)
* **Banco de Dados:** MongoDB (Armazenamento NoSQL de logs e usuários)
* **Frontend:** React + Vite + TailwindCSS (Dashboard interativo e responsivo)
* **Infraestrutura:** Docker & Docker Compose

## 🏗️ Arquitetura da Solução

O fluxo de dados segue um pipeline unidirecional para garantir consistência e desacoplamento:

1.  **Python Collector:** Busca dados de clima (Temp, Umidade, Vento) periodicamente na Open-Meteo API.
2.  **RabbitMQ:** Recebe os dados brutos e os enfileira na fila `weather_data`.
3.  **Go Worker:** Consome a fila, valida a integridade dos dados e envia para a API via HTTP, com sistema de *retry* automático.
4.  **NestJS API:** Recebe os dados, aplica regras de **IA Simbólica** para gerar insights e salva no MongoDB. Também gerencia a autenticação e usuários.
5.  **React Frontend:** Área logada que exibe os dados em tempo real e permite interação manual.

## 📦 Como Rodar o Projeto

### Pré-requisitos
* Docker e Docker Compose instalados.
* Git instalado.

### Passo a Passo

1.  Clone este repositório:
    ```bash
    git clone [https://github.com/SEU-USUARIO/gdash-challenge.git](https://github.com/SEU-USUARIO/gdash-challenge.git)
    cd gdash-challenge
    ```

2.  Suba os contêineres (o build inicial pode levar alguns minutos):
    ```bash
    docker compose up --build -d
    ```

3.  Verifique se todos os serviços estão rodando:
    ```bash
    docker ps
    ```

## 🔐 Acesso e Credenciais

O sistema possui controle de acesso. Utilize o usuário administrador criado automaticamente (`Seed`):

| Serviço | URL | Login | Senha |
| :--- | :--- | :--- | :--- |
| **Frontend (Dashboard)** | http://localhost:5173 | `admin@example.com` | `123456` |
| **API Backend** | http://localhost:3000 | - | - |
| **RabbitMQ Admin** | http://localhost:15672 | `admin` | `admin123` |

## ✨ Funcionalidades Principais

* **🛡️ Autenticação Completa:** Sistema de Login seguro com JWT e rotas protegidas no Frontend.
* **🖥️ Monitoramento em Tempo Real:** Cards interativos com atualização automática via *polling*.
* **🤖 Insights de IA:** Análise automática das condições climáticas com alertas inteligentes (ex: *"🥵 Calor Extremo"*).
* **🔄 Atualização Manual:** Botão "Atualizar Agora" que dispara o pipeline completo instantaneamente.
* **📊 Histórico Detalhado:** Tabela com os registros coletados e seus respectivos insights.
* **📂 Exportação de Dados:** Download de relatórios em **Excel (.xlsx)** e **CSV**.
* **⚡ Alta Performance:** Worker em Go para processamento rápido de mensagens da fila.

## 📂 Estrutura do Projeto

```text
gdash-challenge/
├── backend/          # API NestJS (Auth, Users, Weather, IA)
├── data-collector/   # Script Python (Coleta agendada)
├── frontend/         # React + Vite (Context API, Rotas Privadas)
├── queue-worker/     # Worker Go (Consumidor AMQP)
└── docker-compose.yml # Orquestração completa