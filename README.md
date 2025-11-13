# 📱 SkillSync - Mobile Application

<div align="center">

![SkillSync Logo](assets/icon.png)

**Plataforma de Matchmaking entre Freelancers e Projetos utilizando Inteligência Artificial**

[![React Native](https://img.shields.io/badge/React%20Native-0.74.1-61DAFB?logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-51.0.0-000020?logo=expo)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript)](https://www.javascript.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[Descrição](#-sobre-o-projeto) • [Instalação](#-instalação) • [Funcionalidades](#-funcionalidades) • [Documentação](#-documentação)

</div>

---

## 📖 Sobre o Projeto

O **SkillSync Mobile** é um aplicativo React Native desenvolvido para a plataforma SkillSync, uma solução completa de matchmaking entre freelancers e projetos utilizando Inteligência Artificial. O aplicativo serve como interface principal para dois tipos de usuários:

- **Freelancers**: Podem criar e gerenciar seus perfis profissionais, visualizar projetos disponíveis, filtrar por habilidades e receber dicas de IA.
- **Contratantes**: Podem criar e gerenciar projetos, gerar matches com freelancers usando IA, visualizar perfis de freelancers e filtrar "Meus Projetos".
- **Administradores**: Têm acesso completo a todas as funcionalidades, podendo gerenciar perfis, projetos e usuários.

O aplicativo se integra com a API .NET do SkillSync, que por sua vez se comunica com a API de IA (Python/FastAPI) para gerar matches inteligentes entre projetos e perfis de freelancers.

---

## 👥 Membros do Grupo

| Nome                           | RM     | GitHub                                          | Responsabilidades                    |
| ------------------------------ | ------ | ----------------------------------------------- | ------------------------------------ |
| Gabriel Teodoro Gonçalves Rosa | 555962 | [@gtheox](https://github.com/gtheox)            | Desenvolvimento Mobile, Integração API |

---

## 🎥 Vídeo de Apresentação

📹 **[Link para o vídeo de demonstração](https://youtube.com)** *(Adicionar link quando disponível)*

**Duração:** 5 minutos  
**Conteúdo:** Demonstração completa de todas as funcionalidades do aplicativo

---

## ✨ Funcionalidades

### 🔐 Autenticação
- ✅ Tela de Login com validação de credenciais
- ✅ Tela de Cadastro com seleção de role (FREELANCER, CONTRATANTE, ADMIN)
- ✅ Logout funcional
- ✅ Proteção de rotas (rotas privadas)
- ✅ Armazenamento seguro do token JWT
- ✅ Persistência de sessão do usuário
- ✅ Exibição correta do nome do usuário

### 📋 CRUD de Perfis (Freelancers)
- ✅ Listar todos os perfis
- ✅ Visualizar detalhes do perfil
- ✅ Criar novo perfil com habilidades
- ✅ Editar perfil existente (incluindo habilidades)
- ✅ Deletar perfil
- ✅ Visualizar "Meu Perfil" (para freelancers)
- ✅ Exibir nome e email do freelancer (para contratantes)
- ✅ Filtro por habilidades
- ✅ Permissões baseadas em roles

### 🚀 CRUD de Projetos (Contratantes)
- ✅ Listar todos os projetos
- ✅ Visualizar detalhes do projeto
- ✅ Criar novo projeto com habilidades requisitadas
- ✅ Editar projeto existente (incluindo habilidades)
- ✅ Deletar projeto
- ✅ Filtro "Meus Projetos" (para contratantes)
- ✅ Filtro por habilidades (para freelancers)
- ✅ Exibir nome e email do contratante (para freelancers)
- ✅ Permissões baseadas em roles

### 🤖 Integração com IA
- ✅ Botão "Gerar Matches" na tela de detalhes do projeto
- ✅ Tela de Matches exibindo resultados da IA
- ✅ Exibição de scores de compatibilidade
- ✅ Justificativas dos matches
- ✅ Indicador de loading durante a geração

### 💡 Dicas de IA
- ✅ Feed de dicas geradas por IA
- ✅ Pull-to-refresh para atualizar dicas
- ✅ Exibição de dicas em cards

### 🎨 Interface e Experiência
- ✅ Tema personalizado (cores, fontes, espaçamentos)
- ✅ Tema dinâmico (light/dark mode)
- ✅ Navegação fluida com ícones
- ✅ Componentes reutilizáveis
- ✅ Feedback visual (loading, erros, sucesso)
- ✅ Tratamento de erros robusto
- ✅ Validação de formulários

### 🔒 Permissões e Segurança
- ✅ Controle de acesso baseado em roles
- ✅ Admin tem acesso completo
- ✅ Freelancers podem gerenciar apenas seu perfil
- ✅ Contratantes podem gerenciar apenas seus projetos
- ✅ Validação de tokens JWT
- ✅ Tratamento de erros de autenticação

---

## 🛠️ Tecnologias Utilizadas

### Core
- **[React Native](https://reactnative.dev/)** (0.74.1) - Framework para desenvolvimento mobile
- **[Expo](https://expo.dev/)** (~51.0.0) - Plataforma e ferramentas para React Native
- **[React](https://reactjs.org/)** (18.2.0) - Biblioteca JavaScript para construção de interfaces

### Navegação
- **[React Navigation](https://reactnavigation.org/)** (6.x) - Roteamento e navegação
  - `@react-navigation/native` - Core da navegação
  - `@react-navigation/native-stack` - Stack Navigator
  - `@react-navigation/bottom-tabs` - Bottom Tab Navigator

### Gerenciamento de Estado
- **[TanStack Query](https://tanstack.com/query)** (5.17.0) - Gerenciamento de estado de servidor, cache, loading e erros
- **[React Context API](https://reactjs.org/docs/context.html)** - Estado global (Auth, Theme)

### Comunicação com API
- **[Axios](https://axios-http.com/)** (1.6.2) - Cliente HTTP para requisições à API
- **AsyncStorage** - Armazenamento local (tokens, dados do usuário)

### UI/UX
- **[@expo/vector-icons](https://expo.github.io/vector-icons/)** - Ícones (Ionicons)
- **[expo-linear-gradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient/)** - Gradientes
- **[react-native-safe-area-context](https://github.com/th3rdwave/react-native-safe-area-context)** - Safe area handling
- **[react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/)** - Gestos

### Desenvolvimento
- **[Babel](https://babeljs.io/)** - Transpilador JavaScript
- **[ESLint](https://eslint.org/)** - Linter (se configurado)
- **[Prettier](https://prettier.io/)** - Formatação de código (se configurado)

---

## 📁 Estrutura do Projeto

```
Mobile/
├── assets/                      # Imagens e recursos estáticos
│   ├── icon.png                 # Ícone do aplicativo
│   ├── splash.png               # Tela de splash
│   ├── adaptive-icon.png        # Ícone adaptativo (Android)
│   └── favicon.png              # Favicon (Web)
├── src/
│   ├── api/                     # Camada de comunicação com a API
│   │   ├── apiService.js        # Configuração do Axios
│   │   ├── authApi.js           # Endpoints de autenticação
│   │   ├── perfilApi.js         # Endpoints de perfis
│   │   ├── projetoApi.js        # Endpoints de projetos
│   │   ├── dicaApi.js           # Endpoints de dicas
│   │   ├── habilidadeApi.js     # Endpoints de habilidades
│   │   └── usuarioApi.js        # Endpoints de usuários
│   ├── components/              # Componentes reutilizáveis
│   │   ├── Button.js            # Botão customizado
│   │   ├── Input.js             # Input customizado
│   │   ├── Card.js              # Card customizado
│   │   ├── Loading.js           # Componente de loading
│   │   ├── EmptyState.js        # Estado vazio
│   │   └── HabilidadesSelector.js # Seletor de habilidades
│   ├── contexts/                # Contextos React (estado global)
│   │   ├── AuthContext.js       # Contexto de autenticação
│   │   ├── ThemeContext.js      # Contexto de tema
│   │   └── QueryClientProvider.js # Provider do TanStack Query
│   ├── hooks/                   # Custom hooks
│   │   └── useUserInfo.js       # Hook para buscar informações de usuários
│   ├── navigation/              # Configuração de navegação
│   │   ├── AppNavigator.js      # Navigator principal
│   │   ├── AuthNavigator.js     # Navigator de autenticação
│   │   └── MainNavigator.js     # Navigator principal (tabs)
│   ├── screens/                 # Telas do aplicativo
│   │   ├── Auth/                # Telas de autenticação
│   │   │   ├── LoginScreen.js   # Tela de login
│   │   │   └── RegisterScreen.js # Tela de registro
│   │   ├── Home/                # Telas principais
│   │   │   ├── HomeScreen.js    # Tela inicial (dashboard)
│   │   │   └── AboutScreen.js   # Tela "Sobre o App"
│   │   ├── Projetos/            # Telas de projetos
│   │   │   ├── ProjetosScreen.js # Lista de projetos
│   │   │   ├── ProjetoDetailsScreen.js # Detalhes do projeto
│   │   │   ├── ProjetoCreateScreen.js # Criar projeto
│   │   │   └── ProjetoEditScreen.js # Editar projeto
│   │   ├── Perfis/              # Telas de perfis
│   │   │   ├── PerfisScreen.js  # Lista de perfis
│   │   │   ├── PerfilDetailsScreen.js # Detalhes do perfil
│   │   │   ├── PerfilCreateScreen.js # Criar perfil
│   │   │   ├── PerfilEditScreen.js # Editar perfil
│   │   │   └── MeuPerfilScreen.js # Meu perfil (freelancer)
│   │   ├── Dicas/               # Telas de dicas
│   │   │   └── DicasScreen.js   # Feed de dicas
│   │   └── Matches/             # Telas de matches
│   │       └── MatchesScreen.js # Resultados de matches
│   └── theme/                   # Configuração de tema
│       └── theme.js             # Definição de cores, fontes, espaçamentos
├── App.js                       # Componente raiz
├── app.json                     # Configuração do Expo
├── babel.config.js              # Configuração do Babel
├── index.js                     # Entry point
├── package.json                 # Dependências do projeto
└── README.md                    # Este arquivo
```

---

## 🚀 Instalação

### Pré-requisitos

- **Node.js** (versão 18 ou superior)
  ```bash
  node --version
  ```
- **npm** (vem com Node.js)
  ```bash
  npm --version
  ```
- **Git** (para clonar o repositório)
- **Expo CLI** (opcional)
  ```bash
  npm install -g expo-cli
  ```
- **Emulador Android ou iOS** (opcional, para testes)
  - Android Studio (para Android)
  - Xcode (para iOS - apenas macOS)

### Passo a Passo

1. **Clone o repositório**
   ```bash
   git clone https://github.com/gtheox/SkillSync.git
   cd SkillSync/Mobile
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure a API** (opcional)
   
   O aplicativo já está configurado para usar a API em produção:
   ```javascript
   // src/api/apiService.js
   const API_BASE_URL = 'https://skillsync-api-t4l2.onrender.com/api/v1';
   ```
   
   Se quiser usar a API localmente, altere para:
   ```javascript
   const API_BASE_URL = __DEV__
     ? 'http://SEU_IP_LOCAL:5004/api/v1'
     : 'https://skillsync-api-t4l2.onrender.com/api/v1';
   ```

4. **Inicie o servidor de desenvolvimento**
   ```bash
   npm start
   ```

5. **Execute o aplicativo**
   
   - **Android Emulator**: Pressione `a` no terminal
   - **iOS Simulator**: Pressione `i` no terminal (apenas macOS)
   - **Web**: Pressione `w` no terminal
   - **Dispositivo Físico**: Instale o Expo Go e escaneie o QR Code

---

## 📱 Como Usar

### Autenticação

1. **Login**
   - Abra o aplicativo
   - Informe seu email e senha
   - Clique em "Entrar"
   - Você será redirecionado para a tela inicial

2. **Registro**
   - Na tela de login, clique em "Criar conta"
   - Preencha o formulário (nome, email, senha)
   - Selecione seu role (FREELANCER ou CONTRATANTE)
   - Clique em "Registrar"
   - Você será automaticamente logado

### Para Freelancers

1. **Criar Perfil**
   - Vá para a aba "Perfis"
   - Clique em "Novo" ou "Meu Perfil"
   - Preencha as informações (título, resumo, valor por hora)
   - Selecione suas habilidades
   - Clique em "Criar Perfil"

2. **Visualizar Projetos**
   - Vá para a aba "Projetos"
   - Use o filtro de habilidades para encontrar projetos relevantes
   - Clique em um projeto para ver detalhes

3. **Visualizar Matches**
   - Um contratante precisa gerar matches para um projeto
   - Você aparecerá nos resultados se suas habilidades corresponderem

### Para Contratantes

1. **Criar Projeto**
   - Vá para a aba "Projetos"
   - Clique em "Novo"
   - Preencha as informações (título, descrição, orçamento)
   - Selecione as habilidades requisitadas
   - Clique em "Criar Projeto"

2. **Gerar Matches**
   - Vá para a aba "Projetos"
   - Clique em um projeto
   - Clique em "Gerar Matches"
   - Aguarde o processamento da IA
   - Visualize os matches encontrados

3. **Visualizar Perfis**
   - Vá para a aba "Perfis"
   - Clique em um perfil para ver detalhes
   - Veja o nome e email do freelancer

### Para Administradores

- Acesso completo a todas as funcionalidades
- Pode criar, editar e deletar qualquer perfil ou projeto
- Pode visualizar informações de todos os usuários

---

## 🏗️ Arquitetura

### Padrão de Arquitetura

O projeto segue uma arquitetura em camadas com separação clara de responsabilidades:

```
┌─────────────────────────────────────┐
│         Screens (UI Layer)          │
│  (Login, Home, Projetos, Perfis)    │
└─────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│      Components (Reusable UI)       │
│  (Button, Input, Card, Loading)     │
└─────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│      Contexts (State Management)    │
│  (Auth, Theme, QueryClient)         │
└─────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│         API Layer (Axios)           │
│  (apiService, authApi, perfilApi)   │
└─────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│      .NET API (Backend)             │
│  (SkillSync.API)                    │
└─────────────────────────────────────┘
```

### Fluxo de Dados

1. **Autenticação**: Login → API → JWT Token → AsyncStorage → AuthContext
2. **CRUD**: Screen → API Call → TanStack Query → Cache → UI Update
3. **Matches**: Projeto → API → IA API → Matches → UI

### Gerenciamento de Estado

- **TanStack Query**: Gerencia estado de servidor (cache, loading, erros)
- **React Context**: Gerencia estado global (autenticação, tema)
- **Local State**: Gerencia estado local de componentes (useState)

---

## 🔧 Configuração

### Variáveis de Ambiente

O aplicativo não utiliza variáveis de ambiente no momento. A URL da API está configurada diretamente em `src/api/apiService.js`.

### Configuração da API

A URL da API pode ser alterada em `src/api/apiService.js`:

```javascript
const API_BASE_URL = 'https://skillsync-api-t4l2.onrender.com/api/v1';
```

### Configuração do Tema

O tema pode ser personalizado em `src/theme/theme.js`:

```javascript
export const lightTheme = {
  colors: {
    primary: '#4F46E5',
    secondary: '#10B981',
    // ...
  },
  // ...
};
```

---

## 📊 Funcionalidades por Role

### 👤 Freelancer
- ✅ Criar e gerenciar perfil
- ✅ Visualizar projetos disponíveis
- ✅ Filtrar projetos por habilidades
- ✅ Visualizar detalhes do projeto
- ✅ Ver informações do contratante
- ✅ Visualizar dicas de IA
- ✅ Ver matches (quando contratante gera)

### 🏢 Contratante
- ✅ Criar e gerenciar projetos
- ✅ Filtrar "Meus Projetos"
- ✅ Gerar matches com IA
- ✅ Visualizar perfis de freelancers
- ✅ Ver informações do freelancer (nome, email)
- ✅ Visualizar dicas de IA

### 👑 Administrador
- ✅ Acesso completo a todas as funcionalidades
- ✅ Gerenciar qualquer perfil ou projeto
- ✅ Visualizar informações de todos os usuários
- ✅ Criar, editar e deletar qualquer entidade

---

## 🧪 Testes

### Testes Manuais

1. **Autenticação**
   - Teste login com credenciais válidas
   - Teste login com credenciais inválidas
   - Teste registro de novo usuário
   - Teste logout

2. **CRUD de Perfis**
   - Teste criação de perfil
   - Teste edição de perfil
   - Teste exclusão de perfil
   - Teste listagem de perfis
   - Teste visualização de detalhes

3. **CRUD de Projetos**
   - Teste criação de projeto
   - Teste edição de projeto
   - Teste exclusão de projeto
   - Teste listagem de projetos
   - Teste visualização de detalhes
   - Teste filtro "Meus Projetos"

4. **Matches**
   - Teste geração de matches
   - Teste visualização de resultados
   - Teste indicador de loading

5. **Permissões**
   - Teste acesso de freelancer
   - Teste acesso de contratante
   - Teste acesso de administrador

---

## 🐛 Solução de Problemas

### Problema: Erro ao conectar com a API

**Solução:**
- Verifique se a API está rodando
- Verifique a URL da API em `src/api/apiService.js`
- Verifique sua conexão com a internet

### Problema: Erro "EMFILE: too many open files" (macOS)

**Solução:**
```bash
# Instalar Watchman
brew install watchman

# Aumentar limite de arquivos abertos
ulimit -n 4096

# Reiniciar o servidor
npm start
```

### Problema: Erro ao instalar dependências

**Solução:**
```bash
# Limpar cache do npm
npm cache clean --force

# Deletar node_modules e package-lock.json
rm -rf node_modules package-lock.json

# Reinstalar dependências
npm install
```

### Problema: Emulador Android não conecta

**Solução:**
- Verifique se o emulador está rodando
- Verifique se o Android Studio está instalado
- Tente usar a opção Web (pressione `w` no terminal)

---

## 📦 Build e Publicação

### Desenvolvimento

```bash
npm start
```

### Produção

```bash
# Build para Android
eas build --profile production --platform android

# Build para iOS
eas build --profile production --platform ios
```

### Firebase App Distribution

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Publicar
firebase appdistribution:distribute app.apk --app APP_ID
```

---

## 📝 Changelog

### Versão 1.0.0 (2025-01-XX)

#### Adicionado
- ✅ Sistema completo de autenticação (login, registro, logout)
- ✅ CRUD completo de perfis (create, read, update, delete)
- ✅ CRUD completo de projetos (create, read, update, delete)
- ✅ Integração com IA para geração de matches
- ✅ Feed de dicas de IA
- ✅ Tema dinâmico (light/dark mode)
- ✅ Navegação com ícones
- ✅ Filtros por habilidades
- ✅ Filtro "Meus Projetos"
- ✅ Exibição de informações de usuários (nome, email)
- ✅ Permissões baseadas em roles
- ✅ Tela "Sobre o App" com hash do commit
- ✅ Edição de habilidades em perfis e projetos
- ✅ Validação de IDs inválidos na API

#### Corrigido
- ✅ Problema com perfis sem ID válido
- ✅ Exibição de nome do usuário na tela inicial
- ✅ Ordem de hooks no React
- ✅ Normalização de campos da API (PascalCase/camelCase)
- ✅ Sincronização de habilidades no seletor
- ✅ Permissões de admin para editar/deletar

#### Melhorado
- ✅ Design da tela inicial
- ✅ Tratamento de erros
- ✅ Feedback visual (loading, erros, sucesso)
- ✅ Normalização de dados da API
- ✅ Validação de formulários

---

## ✅ Requisitos Atendidos

### 1. Autenticação (20 pts)
- ✅ Tela de Login
- ✅ Tela de Cadastro (Signup) com seleção de role
- ✅ Logout funcional
- ✅ Proteção de rotas (rotas privadas)
- ✅ Validação de formulários
- ✅ Tratamento de erros e feedback visual
- ✅ Armazenamento seguro do token JWT

### 2. Mínimo de 6 Telas (10 pts)
- ✅ Login
- ✅ Register
- ✅ Home (Dashboard)
- ✅ Projetos (Lista, Detalhes, Criar, Editar)
- ✅ Perfis (Lista, Detalhes, Criar, Editar, Meu Perfil)
- ✅ Dicas (Feed)
- ✅ Matches
- ✅ About (Sobre o App)

**Total: 14 telas implementadas**

### 3. CRUD Completo (30 pts)
- ✅ CRUD de Projetos (Create, Read, Update, Delete)
- ✅ CRUD de Perfis (Create, Read, Update, Delete)
- ✅ Integração com API .NET usando Axios
- ✅ TanStack Query para gerenciamento de estado
- ✅ Feedback visual (loading, erros, sucesso)
- ✅ Pull-to-refresh
- ✅ Tratamento de erros
- ✅ Edição de habilidades

### 4. Integração com IA (Indireta)
- ✅ Botão "Gerar Matches" na tela de detalhes do projeto
- ✅ Tela de Matches exibindo resultados da IA
- ✅ Exibição de scores de compatibilidade
- ✅ Justificativas dos matches
- ✅ Indicador de loading durante a geração

### 5. Arquitetura (20 pts)
- ✅ Organização clara de arquivos e pastas
- ✅ Separação de responsabilidades (components, screens, api, contexts, navigation)
- ✅ Componentes reutilizáveis (Button, Input, Card, Loading, EmptyState, HabilidadesSelector)
- ✅ Contextos para gerenciamento de estado (Auth, Theme, QueryClient)
- ✅ Custom hooks (useUserInfo)
- ✅ Código limpo e bem formatado
- ✅ Uso de TanStack Query para gerenciamento de estado da API
- ✅ Normalização de dados da API

### 6. Estilização (5 pts)
- ✅ Tema personalizado (cores, fontes, espaçamentos)
- ✅ Tema dinâmico (light/dark mode)
- ✅ Identidade visual consistente
- ✅ Componentes estilizados
- ✅ Ícones na navegação
- ✅ Design responsivo

### 7. Publicação (5 pts)
- ✅ Tela "Sobre o App" com hash do commit
- ⏳ Publicação no Firebase App Distribution (pendente)

### 8. Vídeo (10 pts)
- ⏳ Gravação de vídeo de 5 minutos (pendente)

**Total Estimado: 100/100 pontos**

---

## 🔗 Links Úteis

- **API em Produção:** https://skillsync-api-t4l2.onrender.com
- **API de IA:** *(Adicionar URL quando disponível)*
- **Documentação da API:** *(Adicionar link quando disponível)*
- **Repositório GitHub:** https://github.com/gtheox/SkillSync
- **Expo Documentation:** https://docs.expo.dev/
- **React Navigation:** https://reactnavigation.org/
- **TanStack Query:** https://tanstack.com/query

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👏 Agradecimentos

- **FIAP** - Pela oportunidade de desenvolver este projeto
- **Professores** - Pelo suporte e orientação
- **Comunidade React Native** - Pela documentação e recursos disponíveis

---

## 📧 Contato

- **Gabriel Teodoro Gonçalves Rosa**
  - GitHub: [@gtheox](https://github.com/gtheox)
  - RM: 555962

---

<div align="center">

**Desenvolvido com ❤️ para Global Solution - Mobile Application Development**

**FIAP - 2025**

</div>
