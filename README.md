📅 APP-Agenda
===

**Organize seus compromissos em uma linha do tempo visual intuitiva.**

Gerencie tarefas, compromissos e eventos com categorias, subcategorias, anexos e drag-and-drop em uma interface responsiva e moderna.

---

## 📊 Badges

[![HTML5](https://img.shields.io/badge/HTML5-100%25-FF6B6B?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-Modern-1E90FF?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?style=flat-square&logo=javascript&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=flat-square)](CONTRIBUTING.md)

---

## 📋 Visão Geral

O **APP-Agenda** é uma aplicação web moderna para gerenciamento de agenda e tarefas em formato de linha do tempo interativa. Visualize todos os seus compromissos de forma organizada, filtre por categorias e subcategorias, e arraste eventos entre datas com facilidade. Perfeito para estudantes, profissionais e equipes que precisam manter o controle de seu tempo.

### ✨ Destaques Principais

- 📆 **Visualização em Linha do Tempo**: Interface intuitiva com navegação horizontal por datas
- 🎨 **Sistema de Categorias Colorido**: EBSERH (verde), UFU (azul), TCC (roxo) e Outros
- 🏷️ **Subcategorias Dinâmicas**: Organize eventos por tipo e contexto
- 🔄 **Drag-and-Drop**: Mova compromissos entre datas com um simples arrastar
- 📎 **Gerenciamento de Anexos**: Adicione e visualize arquivos diretamente nos cards
- 🔍 **Filtros Avançados**: Filtre por data, categoria e subcategoria em tempo real
- ⏰ **Indicadores Temporais**: Destaque visual para eventos de hoje, urgentes e passados
- 📱 **Totalmente Responsivo**: Interface adaptada para desktop, tablet e mobile
- ⌨️ **Acessibilidade**: Suporte a redução de movimento e navegação por teclado
- 💾 **Persistência Local**: Dados salvos automaticamente no navegador

---

## 🚀 Tecnologias

### **Frontend**
- **HTML5**: Estrutura semântica e forms avançados
- **CSS3**: Grid layout, flexbox, media queries, animações suaves
- **JavaScript Vanilla (ES6+)**: Lógica de aplicação sem dependências externas
- **LocalStorage API**: Persistência de dados no navegador

### **Integrações**
- **Inter Font** (Google Fonts): Tipografia moderna e legível
- **Sistema de Cores CSS Variables**: Tema customizável via CSS custom properties
- **File API**: Upload e gerenciamento de anexos

---

## 🔧 Configuração

### Pré-requisitos

- **Navegador Moderno** (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- **Node.js 14+** (opcional, apenas para desenvolvimento)
- **Conexão com Internet** (para carregar fontes)

### Instalação Local

#### 1️⃣ Clone o Repositório

```bash
git clone https://github.com/RaphaelMun1z/APP-Agenda.git
cd APP-Agenda
```

#### 2️⃣ Abra em um Servidor Local

```bash
# Usando Python 3
python -m http.server 8000

# Ou usando Node.js (http-server)
npx http-server

# Ou usando PHP
php -S localhost:8000
```

#### 3️⃣ Acesse no Navegador

```
http://localhost:8000
```

### Variáveis de Ambiente

As configurações da aplicação podem ser personalizadas via CSS variables no arquivo `index.html`:

```css
:root {
  --page: #eef1f5;              /* Cor de fundo principal */
  --surface: #ffffff;           /* Cor de superfícies */
  --text: #172033;              /* Cor do texto */
  --accent: #e86f19;            /* Cor de destaque (laranja) */
  --danger: #b42318;            /* Cor de perigo (vermelho) */
  --ebserh: #72b01d;            /* Cor categoria EBSERH (verde) */
  --ufu: #143d73;               /* Cor categoria UFU (azul) */
  --tcc: #6d28d9;               /* Cor categoria TCC (roxo) */
  --other: #64748b;             /* Cor padrão (cinza) */
}
```

### Docker Compose (Opcional)

Se desejar rodas a aplicação em um container Docker:

```yaml
# docker-compose.yml
version: '3.8'

services:
  app-agenda:
    image: nginx:alpine
    container_name: app-agenda
    ports:
      - "8080:80"
    volumes:
      - .:/usr/share/nginx/html
    environment:
      - TZ=America/Sao_Paulo
```

**Para iniciar:**

```bash
docker-compose up -d
# Acesse: http://localhost:8080
```

---

## 📚 API & Funcionalidades

### Funcionalidades Principais

| Funcionalidade | Descrição |
|---|---|
| **Criar Compromisso** | Adicione evento com data, hora, categoria e subcategoria |
| **Editar Evento** | Modifique dados do compromisso após criação |
| **Deletar Evento** | Remova compromissos não necessários |
| **Arrastar e Soltar** | Mova eventos entre diferentes datas |
| **Filtrar por Data** | Visualize compromissos de um período específico |
| **Filtrar por Categoria** | Mostre apenas eventos de uma categoria |
| **Filtrar por Subcategoria** | Refine ainda mais os resultados |
| **Adicionar Anexos** | Anexe arquivos aos compromissos |
| **Visualizar Anexos** | Acesse anexos salvos nos cards |
| **Marcar Completo** | Indique tarefas finalizadas |
| **Calcular Pontuação** | Sistema de pontos por categoria |

### Armazenamento de Dados

Os dados são armazenados no **localStorage** do navegador com a seguinte estrutura:

```javascript
// Estrutura de um compromisso
{
  id: "unique-id",
  date: "2024-01-15",
  category: "UFU",
  subcategory: "Estudo",
  title: "Prova de Cálculo",
  startTime: "10:00",
  endTime: "11:30",
  attachments: ["documento.pdf"],
  completed: false,
  score: 10
}
```

---

## 📖 Exemplo de Uso

### 1️⃣ Criar um Novo Compromisso

Clique no botão **"+"** flutuante no canto inferior direito:

```
1. Selecione a data
2. Escolha a categoria (EBSERH, UFU, TCC, OUTROS)
3. Selecione a subcategoria
4. Digite o título e descrição
5. Defina horário de início e fim
6. Adicione anexos (opcional)
7. Clique em "Salvar"
```

### 2️⃣ Mover Compromisso Entre Datas

```
1. Clique e segure em um card de evento
2. Arraste até a data desejada
3. Solte para mover
```

### 3️⃣ Filtrar Eventos

```
Na barra de ferramentas:
- Escolha a data inicial
- Selecione uma categoria
- Filtre por subcategoria
```

### 4️⃣ Adicionar Anexos

```
1. Clique no card do compromisso
2. Clique em "Adicionar Arquivo"
3. Selecione o arquivo do seu computador
4. Visualize na seção de anexos
```

### 5️⃣ Marcar Tarefa como Completa

```
1. Clique no ícone de checkbox no card
2. A tarefa será marcada como concluída
3. A pontuação será adicionada automaticamente
```

---

## 🏗️ Arquitetura

```
APP-Agenda/
├── 📄 index.html          # Arquivo principal com HTML, CSS e JavaScript
├── 📝 .gitignore          # Configuração Git
└── 📋 README.md           # Este arquivo
```

### Estrutura do Código HTML

```html
<!DOCTYPE html>
<html>
  <head>
    <!-- Meta tags, título, CSS inline -->
  </head>
  <body>
    <div class="app">
      <!-- Toolbar: Filtros e ferramentas -->
      <div class="toolbar">
        <input class="date-field" type="date">
        <select class="category-field">
          <option>Categoria</option>
        </select>
        <select class="subcategory-filter-field">
          <option>Subcategoria</option>
        </select>
        <button class="primary-button">Aplicar Filtro</button>
        <div class="toolbar-summary">Total de eventos</div>
      </div>

      <!-- Timeline: Visualização em linha do tempo -->
      <div class="timeline-shell">
        <div class="timeline-strip">
          <!-- Navegação de períodos -->
        </div>
        <div class="timeline">
          <!-- Colunas de dias dinâmicas -->
          <div class="day-column">
            <div class="day-heading">
              <h2>Data</h2>
              <p>Dia da semana</p>
            </div>
            <div class="cards">
              <!-- Cards de compromissos -->
              <div class="appointment-card">
                <div class="card-category">Categoria</div>
                <div class="card-subcategory">Subcategoria</div>
                <h3>Título do Evento</h3>
                <div class="card-time">
                  <span>10:00</span>
                  <span>-</span>
                  <span>11:30</span>
                </div>
                <div class="attachments">
                  <!-- Lista de anexos -->
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal: Formulário de criação/edição -->
      <dialog>
        <form class="appointment-form">
          <!-- Campos do formulário -->
        </form>
      </dialog>
    </div>

    <script>
      // Lógica da aplicação em JavaScript vanilla
    </script>
  </body>
</html>
```

---

## 🔐 Segurança

### Recursos de Segurança Implementados

- 🔒 **Validação de Entrada**: Todos os inputs são sanitizados antes de armazenar
- 🛡️ **XSS Protection**: Uso de `textContent` em vez de `innerHTML` para evitar injeção
- 📍 **LocalStorage Isolado**: Dados persistem apenas no navegador local
- 🚫 **CSRF Prevention**: Sem requisições HTTP sensíveis (dados locais)
- 📱 **Content Security**: Sem scripts externos não aprovados
- 🔐 **Dados Sensíveis**: Nenhuma senha ou dado sensível é armazenado
- 👤 **Privacidade**: 100% offline - seus dados nunca saem do navegador
- ✅ **Validação MIME**: Verificação de tipos de arquivo em anexos

### Boas Práticas de Uso

```javascript
// ✅ BOM: Escapar conteúdo do usuário
element.textContent = userInput;

// ❌ RUIM: Usar innerHTML diretamente
element.innerHTML = userInput;
```

---

## 🧪 Testes

### Testar Localmente

```bash
# 1. Abra o navegador Developer Tools (F12)
# 2. Vá para a aba Console
# 3. Execute os testes:

# Verificar se localStorage está funcionando
localStorage.setItem('test', 'works');
console.log(localStorage.getItem('test'));

# Verificar se os eventos estão sendo salvos
console.log(JSON.parse(localStorage.getItem('appointments')));

# Limpar todos os dados
localStorage.clear();
```

### Cenários de Teste Manuais

| Cenário | Resultado Esperado |
|---|---|
| Criar compromisso | ✅ Aparece no calendar na data correta |
| Mover para outra data | ✅ Event move sem perder informações |
| Filtrar por categoria | ✅ Mostra apenas eventos da categoria |
| Adicionar anexo | ✅ Arquivo aparece no card |
| Deletar evento | ✅ Remove do calendar e localStorage |
| Recarregar página | ✅ Todos os dados persistem |
| Modo responsivo (mobile) | ✅ Interface se adapta corretamente |

---

## 🐛 Troubleshooting

### ❌ Problema: "Os dados não estão sendo salvos"

**Solução:**
```bash
# 1. Verifique se localStorage está habilitado
# Abra DevTools > Application > LocalStorage

# 2. Se vazio, limpe o cache
# Ctrl+Shift+Delete (ou Cmd+Shift+Delete no Mac)

# 3. Recarregue a página
# F5 ou Cmd+R
```

### ❌ Problema: "A página fica em branco"

**Solução:**
```bash
# 1. Verifique o console para erros (F12)
# 2. Limpe o cache do navegador (Ctrl+Shift+Delete)
# 3. Feche todas as abas da aplicação
# 4. Abra novamente a URL
# 5. Se persistir, tente outro navegador
```

### ❌ Problema: "Anexos não aparecem"

**Solução:**
```bash
# 1. Verifique o tamanho do arquivo (máximo recomendado: 5MB)
# 2. Use formatos suportados: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG
# 3. Limpe o localStorage se está cheio
localStorage.clear();
```

### ❌ Problema: "Drag-and-drop não funciona no mobile"

**Solução:**
```bash
# Isso é uma limitação de alguns navegadores mobile
# Use a funcionalidade de "editar" em vez de arrastar
# Ou tente outro navegador com melhor suporte
```

### ❌ Problema: "Interface lenta em muitos eventos"

**Solução:**
```bash
# 1. Reduza o número de meses visíveis por vez
# 2. Arquive eventos antigos (exporte e depois delete)
# 3. Aumente a memória do navegador ou reinicie
# 4. Tente sincronizar com menos eventos carregados
```

---

## 📝 Contribuição

Adoramos contribuições! Se você quer melhorar o APP-Agenda, siga este guia:

### 1️⃣ Fork o Repositório

```bash
# Clique em "Fork" no GitHub
# Ou via linha de comando:
git clone https://github.com/seu-usuario/APP-Agenda.git
cd APP-Agenda
```

### 2️⃣ Crie uma Branch para Sua Feature

```bash
git checkout -b feature/sua-funcionalidade
# Ou para bugfix:
git checkout -b bugfix/nome-do-bug
```

### 3️⃣ Faça Suas Alterações

```bash
# Edite os arquivos necessários
# Teste localmente
git add .
git commit -m "Descrição clara da mudança"
```

### 4️⃣ Push para Seu Fork

```bash
git push origin feature/sua-funcionalidade
```

### 5️⃣ Abra um Pull Request

```
- Vá para https://github.com/RaphaelMun1z/APP-Agenda
- Clique em "New Pull Request"
- Selecione sua branch
- Descreva as mudanças detalhadamente
- Aguarde revisão
```

### 📋 Checklist para PRs

- [ ] Código testado localmente
- [ ] Sem erros no console
- [ ] Responsivo em mobile
- [ ] Compatível com navegadores principais
- [ ] Alterações bem documentadas
- [ ] Não quebra funcionalidades existentes

---

## 📞 Suporte & Contato

### Encontrou um Bug?

Abra uma [issue no GitHub](https://github.com/RaphaelMun1z/APP-Agenda/issues) com:
- Descrição do problema
- Passos para reproduzir
- Navegador e versão
- Screenshot (se aplicável)

### Sugestões de Funcionalidades

Temos uma página de [Discussions](https://github.com/RaphaelMun1z/APP-Agenda/discussions) para ideias!

### Documentação Oficial

- 📖 [Wiki do Projeto](https://github.com/RaphaelMun1z/APP-Agenda/wiki)
- 🐛 [Issues Abertas](https://github.com/RaphaelMun1z/APP-Agenda/issues)
- 📋 [Releases](https://github.com/RaphaelMun1z/APP-Agenda/releases)

