# Estágio de Build
FROM golang:1.21-alpine AS builder

WORKDIR /app

# 1. Copia os arquivos de definição do módulo
COPY go.mod ./

# 2. Copia o código fonte AGORA (necessário para o 'tidy' funcionar)
COPY *.go ./

# 3. Baixa dependências e gera o go.sum automaticamente
RUN go mod tidy

# 4. Compila o binário
RUN go build -o /gdash-worker

# Estágio Final (Imagem leve)
FROM alpine:latest

WORKDIR /
COPY --from=builder /gdash-worker /gdash-worker

CMD ["/gdash-worker"]