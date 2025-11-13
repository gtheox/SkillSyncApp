# 📱 SkillSync - Mobile Application

<div align="center">

**Plataforma de Matchmaking entre Freelancers e Projetos utilizando Inteligência Artificial**

[![React Native](https://img.shields.io/badge/React%20Native-0.74.1-61DAFB?logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-51.0.0-000020?logo=expo)](https://expo.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript)](https://www.javascript.com/)

[Descrição](#-sobre-o-projeto) • [Instalação](#-instalação) • [Funcionalidades](#-funcionalidades) • [Documentação](#-documentação)

</div>

---

## 📖 Sobre o Projeto

O **SkillSync Mobile** é um aplicativo React Native desenvolvido para a plataforma SkillSync, uma solução completa de matchmaking entre freelancers e projetos utilizando Inteligência Artificial.

O aplicativo oferece interfaces personalizadas para três tipos de usuários:

- **Freelancers**: Criar e gerenciar perfis profissionais, visualizar projetos disponíveis, filtrar por habilidades e receber dicas de IA.
- **Contratantes**: Criar e gerenciar projetos, gerar matches com freelancers usando IA, visualizar perfis e gerenciar projetos próprios.
- **Administradores**: Acesso completo para gerenciar perfis, projetos e usuários.

A aplicação se integra com a API .NET do SkillSync, que se comunica com a API de IA (Python/FastAPI) para gerar matches inteligentes entre projetos e perfis de freelancers.

---

## 👨‍💻 Desenvolvedores

| Nome                           | RM     | GitHub                                          |
| ------------------------------ | ------ | ----------------------------------------------- |
| Gabriel Teodoro Gonçalves Rosa | 555962 | [gtheox](https://github.com/gtheox)             |
| Luka Shibuya                   | 558123 | [lukashibuya](https://github.com/lukashibuya)   |
| Eduardo Giovannini             | 555030 | [DuGiovannini](https://github.com/DuGiovannini) |

---

## 🎥 Vídeo de Apresentação

📹 **[Link para o vídeo de demonstração](https://youtube.com)** *(Adicionar link quando disponível)*

**Duração:** 5 minutos  
**Conteúdo:** Demonstração completa de todas as funcionalidades do aplicativo

---

## ✨ Funcionalidades Principais

### 🔐 Autenticação
- Login e registro com seleção de role (FREELANCER, CONTRATANTE, ADMIN)
- Logout funcional com limpeza de sessão
- Proteção de rotas e armazenamento seguro de tokens JWT
- Persistência de sessão do usuário

### 📋 CRUD de Perfis
- Listar, visualizar, criar, editar e deletar perfis
- Visualização exclusiva "Meu Perfil" para freelancers
- Exibição de informações do freelancer (nome e email) para contratantes
- Filtro por habilidades e permissões baseadas em roles

### 🚀 CRUD de Projetos
- Listar, visualizar, criar, editar e deletar projetos
- Filtro "Meus Projetos" para contratantes
- Filtro por habilidades para freelancers
- Exibição de informações do contratante (nome e email) para freelancers
- Permissões baseadas em roles

### 🤖 Integração com IA
- Geração de matches inteligentes entre projetos e perfis
- Exibição de scores de compatibilidade e justificativas
- Feed de dicas personalizadas geradas por IA
- Indicadores visuais de loading durante processamento

### 🎨 Interface e Experiência
- Tema personalizado com suporte a light/dark mode
- Navegação fluida com ícones e componentes reutilizáveis
- Feedback visual (loading, erros, sucesso)
- Validação de formulários e tratamento robusto de erros

---

## 🛠️ Tecnologias Utilizadas

### Core
- **React Native** (0.74.1) - Framework para desenvolvimento mobile
- **Expo** (~51.0.0) - Plataforma e ferramentas para React Native
- **React** (18.2.0) - Biblioteca JavaScript para construção de interfaces

### Navegação
- **React Navigation** (6.x) - Roteamento e navegação (Stack e Tab Navigators)

### Gerenciamento de Estado
- **TanStack Query** (5.17.0) - Gerenciamento de estado de servidor, cache e loading
- **React Context API** - Estado global (Auth, Theme)

### Comunicação com API
- **Axios** (1.6.2) - Cliente HTTP para requisições à API
- **AsyncStorage** - Armazenamento local (tokens, dados do usuário)

### UI/UX
- **@expo/vector-icons** - Ícones (Ionicons)
- **react-native-safe-area-context** - Safe area handling
- **react-native-gesture-handler** - Gestos e interações

---

## 🚀 Instalação

### Pré-requisitos

- **Node.js** (versão 18 ou superior)
- **npm** (vem com Node.js)
- **Git** (para clonar o repositório)
- **Expo CLI** (opcional, instalado via npm)

### Passo a Passo

1. **Clone o repositório**
   ```bash
   git clone https://github.com/gtheox/SkillSyncApp.git
   cd SkillSyncApp/Mobile
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
   
   Para usar localmente, altere para:
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
   - **Dispositivo Físico**: Instale o Expo Go e escaneie o QR Code

---

## 📁 Estrutura do Projeto

```
Mobile/
├── assets/                      # Imagens e recursos estáticos
├── src/
│   ├── api/                     # Camada de comunicação com a API
│   ├── components/              # Componentes reutilizáveis
│   ├── contexts/                # Contextos React (estado global)
│   ├── hooks/                   # Custom hooks
│   ├── navigation/              # Configuração de navegação
│   ├── screens/                 # Telas do aplicativo
│   │   ├── Auth/                # Telas de autenticação
│   │   ├── Home/                # Telas principais
│   │   ├── Projetos/            # Telas de projetos
│   │   ├── Perfis/              # Telas de perfis
│   │   ├── Dicas/               # Feed de dicas
│   │   └── Matches/             # Resultados de matches
│   └── theme/                   # Configuração de tema
├── App.js                       # Componente raiz
├── app.json                     # Configuração do Expo
├── package.json                 # Dependências do projeto
└── README.md                    # Este arquivo
```

---

## 🔧 Configuração

### Configuração da API

A URL da API está configurada em `src/api/apiService.js`:

```javascript
const API_BASE_URL = 'https://skillsync-api-t4l2.onrender.com/api/v1';
```

### Configuração do Tema

O tema pode ser personalizado em `src/theme/theme.js`, incluindo cores, fontes e espaçamentos.

---

## 📦 Build e Publicação

### Desenvolvimento

```bash
npm start
```

### Produção (EAS Build)

```bash
# Build para Android
eas build --profile production --platform android

# Build para iOS
eas build --profile production --platform ios
```

### Firebase App Distribution

O aplicativo foi publicado no Firebase App Distribution. Para criar novos builds:

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Publicar
firebase appdistribution:distribute app.apk --app APP_ID
```

---

## ✅ Requisitos Atendidos

### 1. Autenticação (20 pts)
- ✅ Tela de Login e Cadastro
- ✅ Logout funcional
- ✅ Proteção de rotas
- ✅ Validação de formulários e tratamento de erros

### 2. Mínimo de 6 Telas (10 pts)
- ✅ 14 telas implementadas (Login, Register, Home, Projetos, Perfis, Dicas, Matches, About)

### 3. CRUD Completo (30 pts)
- ✅ CRUD de Projetos e Perfis
- ✅ Integração com API .NET usando Axios
- ✅ Feedback visual e tratamento de erros

### 4. Estilização (5 pts)
- ✅ Tema personalizado com light/dark mode
- ✅ Identidade visual consistente
- ✅ Componentes estilizados

### 5. Arquitetura (20 pts)
- ✅ Organização clara de arquivos e pastas
- ✅ Separação de responsabilidades
- ✅ Componentes reutilizáveis
- ✅ Código limpo e bem formatado

### 6. Publicação (5 pts)
- ✅ Tela "Sobre o App" com hash do commit
- ✅ Publicação no Firebase App Distribution

### 7. Vídeo (10 pts)
- ⏳ Gravação de vídeo de 5 minutos (pendente)

---

## 🔗 Links Úteis

- **API em Produção:** https://skillsync-api-t4l2.onrender.com
- **API de IA:** https://skillsync-ai-api.onrender.com
- **Repositório GitHub:** https://github.com/gtheox/SkillSyncApp
- **Expo Documentation:** https://docs.expo.dev/
- **React Navigation:** https://reactnavigation.org/
- **TanStack Query:** https://tanstack.com/query

---

## 📄 Licença

Este projeto está sob a licença MIT.

---

<div align="center">

**Desenvolvido com ❤️ para Global Solution - Mobile Application Development**

**FIAP - 2025**

</div>
