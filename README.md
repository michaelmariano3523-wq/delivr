# DelivR - Plataforma de Delivery

<div align="center">
  <img width="120" height="120" alt="DelivR Logo" src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/shopping-bag.svg" />
</div>

Plataforma completa de delivery com painel administrativo, gestão de restaurantes, entregadores e clientes.

## Funcionalidades

- **Dashboard Administrativo**: Gerenciamento completo de usuários, restaurantes e entregadores
- **Painel do Restaurante**: Gestão de pedidos, cardápio e finanças
- **Painel do Entregador**: Aceitação de pedidos e rastreamento em tempo real
- **Aplicativo do Cliente**: Browse restaurantes, pedidos e rastreamento de entrega
- **Pagamentos via PIX**: Integração com AbacatePay
- **Mapa em Tempo Real**: Rastreamento de entregadores com Google Maps

## Stack Tecnológica

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Express.js + WebSockets
- **Banco de Dados**: Supabase (PostgreSQL)
- **Mapas**: Google Maps
- **Pagamentos**: AbacatePay (PIX)
- **Estilização**: TailwindCSS

## Pré-requisitos

- Node.js 18+
- Conta no Supabase
- Conta no Google Cloud (para mapas)
- Conta no AbacatePay (para PIX)

## Instalação

1. Clone o repositório:
```bash
git clone <repo-url>
cd delivr-delivery-platform
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais:
```env
VITE_SUPABASE_URL=sua-url-do-supabase
VITE_SUPABASE_ANON_KEY=sua-chave-anon
VITE_GOOGLE_MAPS_API_KEY=sua-chave-google-maps
ABACATEPAY_API_KEY=sua-chave-abacatepay
SUPABASE_URL=sua-url
SUPABASE_ANON_KEY=sua-chave
SUPABASE_SERVICE_ROLE_KEY=sua-chave-admin
```

4. Execute o banco de dados:
   - Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
   - Crie um novo projeto
   - Execute o conteúdo de `db-schema.sql` no SQL Editor

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

6. Acesse `http://localhost:3000`

## Credenciais Padrão

- **Usuário**: admin
- **Senha**: Admin@123

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera build de produção |
| `npm run start` | Inicia o servidor de produção |
| `npm run lint` | Verifica tipos TypeScript |
| `npm run clean` | Remove a pasta dist |

## Estrutura do Projeto

```
├── src/
│   ├── App.tsx          # Componentes React principais
│   ├── main.tsx         # Entry point
│   └── index.css        # Estilos globais
├── server.ts            # Backend Express + WebSockets
├── db-schema.sql       # Schema do banco de dados
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## API Endpoints

### Autenticação
- `POST /api/login` - Login de usuário
- `POST /api/register` - Cadastro de novo usuário

### Admin
- `GET /api/admin/pending-clients` - Clientes pendentes
- `GET /api/admin/restaurants` - Todos restaurantes
- `GET /api/admin/drivers` - Todos entregadores
- `GET /api/admin/stats` - Estatísticas gerais

### Restaurantes
- `GET /api/restaurants` - Lista restaurantes
- `GET /api/restaurants/:id/menu` - Cardápio do restaurante
- `POST /api/restaurants/:id/menu` - Adicionar item ao cardápio

### Pedidos
- `POST /api/orders` - Criar pedido
- `GET /api/orders/client/:id` - Pedidos do cliente
- `POST /api/orders/:id/status` - Atualizar status

### Pagamentos
- `POST /api/payment/pix` - Gerar QR Code PIX
- `POST /api/payment/checkout` - Checkout com dinheiro/cartão
- `GET /api/payment/status/:id` - Verificar status do pagamento

## Deploy

### Railway (Recomendado)

1. Conecte seu repositório ao [Railway](https://railway.app)
2. Configure as variáveis de ambiente
3. Deploy automático

### Docker

```bash
docker build -t delivr-platform .
docker run -p 3000:3000 --env-file .env.local delivr-platform
```

## Licença

MIT License
