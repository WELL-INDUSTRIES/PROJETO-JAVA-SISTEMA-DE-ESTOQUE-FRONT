# TechStock | CRUD de estoque em Angular

Aplicação web da WELL-INDUSTRIES para consultar mercadorias, atualizar quantidades e gerenciar fornecedores. As telas usam Angular 21, TypeScript e serviços HTTP para acessar a [API em Spring Boot](https://github.com/WELL-INDUSTRIES/SISTEMA-DE-ESTOQUE-WELL-INDUSTRIES-BACK).

O CRUD reúne cadastro, consulta, edição e exclusão lógica. Ao excluir um registro, ele fica inativo e pode ser reativado.

## Fluxos disponíveis

- Cadastro, edição, desativação e reativação de fornecedores e mercadorias.
- Consulta de mercadorias vinculadas a um fornecedor.
- Listagens paginadas e formulários de manutenção de estoque.

## Executar localmente

Inicie a API na porta 8080. Com Node.js 24 e npm, execute na raiz deste repositório:

```sh
npm ci
npm run start:proxy
```

Abra http://localhost:4200. A tela de demonstração usa o usuário `admin` e a senha `admin123`. A sessão é simulada no navegador. O proxy de desenvolvimento encaminha as chamadas para a API.

## Build

```sh
npm run build
```

O endereço usado pela versão compilada está em `src/environments/environment.ts`. Para hospedagem, o servidor precisa encaminhar o prefixo `/api` para as rotas correspondentes do backend.
