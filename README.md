# 🍔 Rayane Food

Sistema completo de delivery de comida com painel administrativo e autenticação Firebase.

## 🚀 Tecnologias Utilizadas

- **React 18** - Biblioteca JavaScript para construção da interface
- **Vite** - Build tool moderna e rápida
- **Firebase** - Backend completo (Auth + Firestore)
- **TailwindCSS** - Framework CSS utility-first
- **Zustand** - Gerenciamento de estado
- **Framer Motion** - Animações fluidas
- **Recharts** - Gráficos e análises
- **Lucide React** - Ícones modernos

## 📋 Funcionalidades

### Para Clientes
- ✅ Autenticação completa (Login/Registro)
- ✅ Navegação de produtos por categorias
- ✅ Carrinho de compras
- ✅ Finalização de pedidos
- ✅ Histórico de pedidos

### Para Administradores
- ✅ Painel administrativo protegido com PIN
- ✅ Gerenciamento de produtos (CRUD completo)
- ✅ Visualização de pedidos em tempo real
- ✅ Controle de status de pedidos
- ✅ Analytics e estatísticas
- ✅ Logs de login de usuários
- ✅ Gerenciamento de usuários

## 🛠️ Instalação

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn

### Passos

1. **Clone o repositório**
```bash
git clone <url-do-seu-repositorio>
cd rayane-food
```

2. **Instale as dependências**
```bash
npm install
```

3. **Execute o projeto**
```bash
npm run dev
```

4. **Acesse no navegador**
```
http://localhost:5173
```

## 🔐 Configuração do Firebase

As configurações do Firebase já estão incluídas no projeto. O projeto utiliza:

- **Firebase Authentication** - Para login/registro de usuários
- **Cloud Firestore** - Para armazenamento de dados (pedidos, produtos, usuários)

### Credenciais Admin
- Email: `marmitasrayane@gmail.com`
- PIN: `8327`

## 📁 Estrutura do Projeto

```
rayane-food/
├── src/
│   ├── components/      # Componentes React
│   │   ├── admin/      # Componentes do painel administrativo
│   │   ├── auth/       # Componentes de autenticação
│   │   └── ui/         # Componentes de interface reutilizáveis
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Configurações (Firebase)
│   ├── pages/          # Páginas da aplicação
│   ├── store/          # Gerenciamento de estado (Zustand)
│   ├── App.jsx         # Componente principal
│   ├── main.jsx        # Entry point
│   └── index.css       # Estilos globais
├── public/             # Arquivos estáticos
├── index.html          # HTML principal
├── package.json        # Dependências do projeto
├── vite.config.js      # Configuração do Vite
└── tailwind.config.js  # Configuração do Tailwind

```

## 🎨 Scripts Disponíveis

```bash
# Modo de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build de produção
npm run preview
```

## 📝 Notas Importantes

- O acesso ao painel administrativo é restrito ao email `marmitasrayane@gmail.com`
- Todos os pedidos exigem que o usuário esteja autenticado
- O sistema registra todos os logins na coleção `loginLogs` do Firestore
- Os dados são sincronizados em tempo real com o Firebase

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

## 📄 Licença

Este projeto é de uso privado.

---

Desenvolvido com ❤️ por Rayane Food
