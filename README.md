# TechStock - Controle de Estoque (Frontend)

Sistema web para gerenciamento de estoque de componentes eletrônicos e periféricos de TI.

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Passos

1. **Instalar dependências**
   ```bash
   npm install
   ```

2. **Iniciar o servidor de desenvolvimento**
   ```bash
   npm start
   ```
   Ou com proxy configurado:
   ```bash
   npm run start:proxy
   ```

3. Abra o navegador em `http://localhost:4200`

## 📋 Credenciais Padrão

- **Usuário:** `admin`
- **Senha:** `admin123`

## 🏗️ Estrutura do Projeto

```
src/
├── app/
│   ├── pages/           # Componentes de página
│   ├── services/        # Serviços HTTP
│   ├── shared/          # Utilitários e estilos compartilhados
│   └── app.*            # Componente raiz
├── environments/        # Configurações por ambiente
├── styles.css          # Estilos globais
└── index.html          # Página HTML
```

## 🎯 Funcionalidades

- ✅ Login com autenticação
- ✅ CRUD de Mercadorias (com filtros avançados)
- ✅ CRUD de Fornecedores (com filtros por cidade/estado)
- ✅ Visualizar mercadorias por fornecedor
- ✅ Ordenação de tabelas
- ✅ Modais de detalhes
- ✅ Validação de formulários
- ✅ Interface responsiva e profissional

## 🔧 Configuração da API

Edite `src/environments/environment.ts` para alterar a URL da API:

```typescript
export const environment = {
  apiUrl: 'http://localhost:8080/api'
};
```

## 📦 Build para Produção

```bash
npm run build
```

Os arquivos compilados estarão em `dist/controle-estoque-front`

## 💻 Requisitos Atendidos

- [x] Tela de login
- [x] Lista de mercadorias com filtros (busca, categoria, fornecedor, status, validade)
- [x] Adicionar, editar e excluir mercadorias
- [x] Lista de fornecedores com filtros (busca, cidade, estado, status)
- [x] Adicionar, editar e excluir fornecedores
- [x] Exibir todas as mercadorias de um fornecedor específico
- [x] Validação de dados
- [x] Tratamento de erros
- [x] Design profissional e responsivo
