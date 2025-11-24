# 📄 PDF Markdown API

API para gerar PDFs estruturados a partir de conteúdo em Markdown. Perfeita para automações, relatórios e documentos dinâmicos.

## ✨ Funcionalidades

- ✅ Converte Markdown para PDF estruturado
- ✅ Suporte a títulos (H1-H6), listas, negrito, itálico
- ✅ Blocos de código com formatação
- ✅ Citações em bloco
- ✅ Numeração automática de páginas
- ✅ Quebra de páginas automática
- ✅ Duas rotas: download direto ou retorno em base64
- ✅ CORS habilitado
- ✅ Containerizado com Docker

## 🚀 Quick Start

### Pré-requisitos

- Docker e Docker Compose
- ou Node.js 18+

### Com Docker Compose

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/pdf-markdown-api.git
cd pdf-markdown-api
```

2. Inicie com Docker Compose:
```bash
docker-compose up -d
```

3. A API estará disponível em `http://localhost:3000`

### Sem Docker (Local)

1. Instale as dependências:
```bash
npm install
```

2. Inicie o servidor:
```bash
npm start
```

## 📡 Endpoints

### `POST /gerar-pdf`

Gera um PDF e retorna como arquivo para download.

**Request:**
```bash
curl -X POST http://localhost:3000/gerar-pdf \
  -H "Content-Type: application/json" \
  -d '{
    "markdown": "# Título\n\n## Subtítulo\n\nConteúdo em **negrito** e *itálico*",
    "titulo": "meu-documento"
  }' \
  --output documento.pdf
```

**Body:**
```json
{
  "markdown": "string (obrigatório) - Conteúdo em Markdown",
  "titulo": "string (opcional) - Nome do arquivo PDF"
}
```

**Response:** Arquivo PDF

---

### `POST /gerar-pdf-base64`

Gera um PDF e retorna em JSON com encoding base64.

**Request:**
```bash
curl -X POST http://localhost:3000/gerar-pdf-base64 \
  -H "Content-Type: application/json" \
  -d '{
    "markdown": "# Título\n\nConteúdo aqui",
    "titulo": "relatorio"
  }'
```

**Body:**
```json
{
  "markdown": "string (obrigatório) - Conteúdo em Markdown",
  "titulo": "string (opcional) - Nome do arquivo"
}
```

**Response:**
```json
{
  "sucesso": true,
  "titulo": "relatorio",
  "pdf_base64": "JVBERi0xLjQuLi4="
}
```

---

### `GET /health`

Verifica se a API está operacional.

**Request:**
```bash
curl http://localhost:3000/health
```

**Response:**
```json
{
  "status": "ok",
  "message": "API está rodando!"
}
```

## 📝 Formato Markdown Suportado

```markdown
# Título (H1)
## Subtítulo (H2)
### Subseção (H3)

Parágrafo com texto simples.

**Texto em negrito**
*Texto em itálico*
`Código inline`

- Item 1 da lista
- Item 2 da lista

1. Item 1 ordenado
2. Item 2 ordenado

> Citação em bloco
> Múltiplas linhas

\`\`\`javascript
function exemplo() {
  console.log("Código formatado");
}
\`\`\`
```

## 🔧 Configuração

### Variáveis de Ambiente

Edite o `docker-compose.yml` conforme necessário:

```yaml
environment:
  - NODE_ENV=production  # Pode ser 'development'
  - PORT=3000            # Porta da API
```

### Redes (Portainer)

A API é configurada para usar a rede `n8n` existente. Caso queira mudar:

1. Edite o `docker-compose.yml`
2. Altere `networks.n8n.external` ou crie uma nova rede

## 📦 Estrutura de Arquivos

```
pdf-markdown-api/
├── Dockerfile
├── docker-compose.yml
├── package.json
├── server.js
├── .gitignore
└── README.md
```

## 🐳 Deploy no Portainer

1. Acesse seu Portainer
2. Vá em **Stacks** → **Add Stack**
3. Escolha **Git Repository**
4. Cole a URL do repositório GitHub
5. Configure o **Compose file path**: `docker-compose.yml`
6. Clique em **Deploy**

A API estará disponível em `http://seu-servidor:3000`

## 🔌 Integração com n8n

Use o endpoint `/gerar-pdf-base64` para integrar com n8n:

1. Crie uma requisição HTTP POST
2. URL: `http://pdf-api:3000/gerar-pdf-base64`
3. Body em JSON com `markdown` e `titulo`
4. A resposta conterá o PDF em base64

## 📊 Exemplos de Uso

### Python
```python
import requests
import base64

url = "http://localhost:3000/gerar-pdf-base64"
data = {
    "markdown": "# Relatório\n\nDados aqui",
    "titulo": "relatorio-vendas"
}

response = requests.post(url, json=data)
pdf_base64 = response.json()["pdf_base64"]

# Salvar arquivo
with open("relatorio.pdf", "wb") as f:
    f.write(base64.b64decode(pdf_base64))
```

### JavaScript/Node.js
```javascript
const axios = require('axios');
const fs = require('fs');

const data = {
  markdown: "# Título\n\nConteúdo",
  titulo: "documento"
};

axios.post('http://localhost:3000/gerar-pdf-base64', data)
  .then(res => {
    const pdfBuffer = Buffer.from(res.data.pdf_base64, 'base64');
    fs.writeFileSync('documento.pdf', pdfBuffer);
  })
  .catch(err => console.error(err));
```

## 🛠️ Troubleshooting

### Porta 3000 já em uso
```bash
docker-compose down
docker-compose up -d
```

### Erro ao conectar à rede n8n
```bash
# Verifique se a rede existe
docker network ls

# Se não existir, crie:
docker network create n8n
```

### Logs da aplicação
```bash
docker-compose logs -f pdf-api
```

## 📄 Limite de Tamanho

- Máximo 10MB por requisição
- Suporta documentos com múltiplas páginas

## 🔒 Segurança

- CORS habilitado (adapte conforme necessário em `server.js`)
- Validate input antes de usar em produção
- Use HTTPS em ambientes production

## 📝 Licença

MIT

## 👨‍💻 Contribuições

Sinta-se livre para abrir Issues e Pull Requests!

---

**Desenvolvido com ❤️**
