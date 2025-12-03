## 3.1.1 Metodologia

O projeto GlobalHoops adota uma metodologia Agile/Scrum adaptada, estruturada em sprints de duas semanas que permitem entregas incrementais e feedback contínuo. Esta abordagem iterativa foca-se na construção de MVPs (Minimum Viable Products) funcionais a cada sprint, garantindo que o produto evolui de forma controlada e validada pelos stakeholders.

A cadência de trabalho estabelecida inclui sprints quinzenais (10 dias úteis), complementados por daily stand-ups de 15 minutos, que podem ser realizados de forma assíncrona via Discord ou Slack quando necessário. No início de cada sprint realiza-se uma sessão de Sprint Planning com duração de duas horas, onde a equipa revê o backlog, seleciona as user stories prioritárias, quebra-as em tarefas técnicas e estima o esforço necessário usando story points. No final de cada sprint, dedicam-se uma hora à Sprint Review para demonstração das funcionalidades concluídas e recolha de feedback, seguida de 30 minutos de Sprint Retrospective para reflexão sobre o processo e identificação de melhorias. A meio de cada sprint, realiza-se ainda uma sessão de Backlog Refinement de uma hora para clarificar requisitos futuros e preparar o próximo sprint.

Relativamente aos papéis e responsabilidades, a equipa está estruturada com um Product Owner responsável por definir requisitos, priorizar funcionalidades e validar entregas; um Tech Lead/Scrum Master que coordena o desenvolvimento técnico, remove impedimentos e facilita as cerimónias; Full-Stack Developers que implementam tanto o frontend em React/Inertia.js como o backend em Laravel; e um QA/Tester responsável por testes funcionais, regressão e validação de requisitos.

Os principais artefactos do projeto incluem o Product Backlog, uma lista priorizada de todas as funcionalidades gerida em Notion ou Trello; o Sprint Backlog com as tarefas selecionadas para o sprint corrente; e um conjunto claro de critérios na Definition of Done que estabelece que uma funcionalidade só está completa quando o código foi revisado, os testes unitários e de integração passam, a documentação está atualizada, foi feito deploy em staging e houve validação funcional pelo Product Owner. Mantém-se ainda um Burndown Chart para acompanhar o progresso do sprint e documentação técnica que inclui README, documentação de API e diagramas de arquitetura.

O fluxo de trabalho de versionamento segue o Git Flow, com uma estrutura de branches que inclui main (produção), develop (integração), feature/* para novas funcionalidades, bugfix/* para correções e hotfix/* para correções urgentes em produção. O processo de desenvolvimento segue um ciclo rigoroso: cada nova funcionalidade parte da branch develop, sendo desenvolvida numa branch feature/* dedicada; após conclusão, é criado um Pull Request que requer pelo menos uma aprovação em code review e passagem na pipeline de CI/CD antes de poder ser integrado em develop; periodicamente, develop é merged para main com uma tag de versão seguindo Semantic Versioning (MAJOR.MINOR.PATCH), sendo então feito deploy para produção. As mensagens de commit seguem a convenção Conventional Commits (feat, fix, docs, style, refactor, test, chore) para facilitar a geração automática de changelogs e a compreensão do histórico do projeto.

As práticas de qualidade são transversais a todo o desenvolvimento. Todo o código passa obrigatoriamente por code review, com checklist de legibilidade, performance, segurança e cobertura de testes. Os testes automatizados incluem testes unitários com PHPUnit no backend e Jest/Vitest no frontend, visando uma cobertura mínima de 70%; testes de integração usando Laravel Feature Tests; e testes E2E com Cypress ou Playwright para fluxos críticos. A análise estática do código é garantida através de Laravel Pint para PHP (PSR-12) e ESLint com Prettier para JavaScript. A pipeline de CI/CD implementada em GitHub Actions executa automaticamente testes, linting e build em cada push e pull request, fazendo deploy automático para staging na branch develop e para produção na branch main. As preocupações de segurança incluem auditorias regulares de dependências, sanitização de inputs através de validação Laravel, proteção CSRF ativada, HTTPS obrigatório em produção e gestão segura de secrets via ficheiro .env. A performance é otimizada através de identificação e resolução de N+1 queries, caching com Redis, otimização de assets com Vite, lazy loading de imagens e rate limiting nas APIs.

## 3.1.2 Cronograma

O projeto GlobalHoops está planeado para uma duração total de 18 semanas, distribuídas em 9 sprints de duas semanas cada, com início em outubro de 2024 e conclusão prevista para fevereiro de 2025. Esta estrutura temporal permite uma evolução gradual e sustentável do produto, desde a fase inicial de setup até ao lançamento em produção.

O Sprint 0 (Outubro, semanas 1-2) destina-se ao setup inicial e planeamento estratégico, com foco na configuração dos ambientes de desenvolvimento, criação do repositório Git, definição do backlog inicial e estabelecimento da arquitetura técnica do sistema. O Sprint 1 (Outubro, semanas 3-4) concentra-se na implementação da base da aplicação, incluindo o sistema de autenticação (login e registo), o layout base da aplicação, a integração inicial com a ESPN API e a criação da página de listagem de equipas da NBA.

No Sprint 2 (Novembro, semanas 5-6) desenvolvem-se as funcionalidades core do sistema: o mecanismo de seguir equipas, o feed personalizado que agrega conteúdo relevante, a página de visualização de jogos e os sistemas de filtragem e pesquisa. O Sprint 3 (Novembro, semanas 7-8) é dedicado à implementação do sistema de notificações push através do protocolo Web Push, incluindo o desenvolvimento do Service Worker, a gestão de subscrições de utilizadores e a configuração de notificações automáticas relacionadas com jogos das equipas seguidas.

O Sprint 4 (Dezembro, semanas 9-10) adiciona funcionalidades avançadas como estatísticas detalhadas de jogos e equipas, melhorias no perfil de utilizador, sistema de favoritos e preferências, e otimização da responsividade para dispositivos móveis. O Sprint 5 (Dezembro, semanas 11-12) foca-se em features complementares e refinamento da experiência do utilizador, enquanto o Sprint 6 (Janeiro, semanas 13-14) é reservado para testes de aceitação, correção de bugs identificados e preparação para o lançamento.

Os Sprints 7 e 8 (Janeiro-Fevereiro, semanas 15-18) constituem a fase final de polimento e deployment, incluindo a implementação de testes end-to-end, otimizações de performance, conclusão da documentação técnica e do utilizador, e finalmente o deploy para o ambiente de produção com monitorização ativa.

Ao longo do projeto estabelecem-se checkpoints de validação cruciais: na semana 4 realiza-se uma review detalhada da arquitetura com stakeholders; na semana 8 apresenta-se uma demo do MVP a um grupo de utilizadores beta para recolha de feedback inicial; na semana 14 executam-se testes de aceitação formais; e na semana 18 concretiza-se o go-live em produção, marcando a entrega final do projeto.

### Diagrama de Gantt

```plantuml
@startgantt
title Cronograma GlobalHoops (Outubro 2024 - Fevereiro 2025)
projectscale weekly

printscale weekly

[Sprint 0: Setup & Planeamento] as [S0] lasts 2 weeks and starts 2024-10-07
[S0] is colored in LightBlue
note bottom
  - Ambiente dev configurado
  - Repositório Git
  - Backlog inicial
  - Arquitetura definida
end note

[Sprint 1: Autenticação & Base] as [S1] lasts 2 weeks and starts 2024-10-21
[S1] is colored in LightGreen
note bottom
  - Sistema de login/registo
  - Layout base da aplicação
  - Integração ESPN API
  - Página de equipas
end note

[Sprint 2: Core Features] as [S2] lasts 2 weeks and starts 2024-11-04
[S2] is colored in LightGreen
note bottom
  - Sistema de seguir equipas
  - Feed personalizado
  - Página de jogos
  - Filtragem e pesquisa
end note

[Sprint 3: Notificações] as [S3] lasts 2 weeks and starts 2024-11-18
[S3] is colored in Yellow
note bottom
  - Push notifications (Web Push)
  - Service Worker
  - Gestão de subscrições
  - Notificações de jogos
end note

[Sprint 4: Features Avançadas] as [S4] lasts 2 weeks and starts 2024-12-02
[S4] is colored in Yellow
note bottom
  - Estatísticas detalhadas
  - Perfil de utilizador
  - Favoritos/preferências
  - Responsividade mobile
end note

[Sprint 5: Refinamento UX] as [S5] lasts 2 weeks and starts 2024-12-16
[S5] is colored in Orange
note bottom
  - Animações e transições
  - Melhorias de acessibilidade
  - Otimização de formulários
  - Loading states
end note

[Sprint 6: Testes & QA] as [S6] lasts 2 weeks and starts 2024-12-30
[S6] is colored in Orange
note bottom
  - Testes de aceitação
  - Correção de bugs
  - Validação de requisitos
  - Preparação para deploy
end note

[Sprint 7: Polimento] as [S7] lasts 2 weeks and starts 2025-01-13
[S7] is colored in Pink
note bottom
  - Testes E2E
  - Otimizações performance
  - Refinamento final
  - Documentação técnica
end note

[Sprint 8: Deploy & Monitorização] as [S8] lasts 2 weeks and starts 2025-01-27
[S8] is colored in Pink
note bottom
  - Deploy produção
  - Documentação final
  - Monitorização ativa
  - Suporte pós-launch
end note

-- Milestones --
[Review Arquitetura] happens 2024-11-01
[Demo MVP Beta] happens 2024-11-29
[Testes Aceitação] happens 2025-01-10
[Go-Live Produção] happens 2025-02-07

@endgantt
```

## 3.1.3 Recursos

### Hardware

Para o desenvolvimento do projeto GlobalHoops, cada membro da equipa necessita de uma máquina de desenvolvimento com especificações mínimas que incluem processador Intel i5 ou AMD Ryzen 5 (ou superior) com pelo menos 4 cores, 8GB de RAM no mínimo sendo 16GB o recomendado para garantir fluidez no trabalho com múltiplas ferramentas em simultâneo, armazenamento SSD de pelo menos 256GB, e sistema operativo Windows 10/11, macOS 12+ ou Linux (Ubuntu 22.04+). Estas especificações garantem que os ambientes de desenvolvimento local (Laravel, Node.js, MySQL/SQLite, Redis) funcionam de forma adequada.

Para além dos ambientes locais, o projeto requer um servidor dedicado para staging, hospedado em providers como DigitalOcean, AWS ou Hetzner, com especificações de 2 vCPUs, 4GB de RAM e 50GB de armazenamento SSD, executando Ubuntu 22.04 LTS, com um custo estimado de 10-20€ mensais. Este ambiente permite testar as funcionalidades num contexto próximo da produção antes do deploy final. O ambiente de produção, quando necessário, utilizará infraestrutura similar mas com recursos ligeiramente superiores (2-4 vCPUs, 4-8GB RAM, 100GB SSD), complementado com CDN da Cloudflare (versão gratuita) para otimização de entrega de assets estáticos, totalizando aproximadamente 20-50€ mensais.

### Software/Stack

A stack tecnológica do projeto está dividida em várias camadas. No desenvolvimento utiliza-se primariamente o VS Code como IDE, equipado com extensões essenciais como Laravel, PHP Intelephense, ESLint, Prettier e GitLens; alternativamente, alguns membros da equipa podem optar pelo PhpStorm. Para testes de API utiliza-se Postman ou Insomnia.

O backend é construído sobre PHP 8.2+ com o framework Laravel 11.x, utilizando MySQL 8.0+ ou PostgreSQL 15+ como base de dados, Redis 7+ para caching e gestão de filas (Laravel Queue com Redis driver), e Composer 2.x como gestor de pacotes. Esta stack backend garante robustez, escalabilidade e acesso a um ecossistema maduro de bibliotecas.

O frontend utiliza JavaScript ES6+ com React 18.x como framework principal, Inertia.js 1.x como meta-framework que permite criar SPAs sem necessidade de API REST separada, Tailwind CSS 3.x para styling utility-first, Framer Motion para animações fluidas, Vite 5.x como build tool moderno e rápido, e npm 10.x para gestão de dependências. Esta combinação permite criar interfaces responsivas e performantes com excelente experiência de desenvolvimento.

As ferramentas de design incluem Figma para design de interfaces e prototipagem, draw.io, Excalidraw ou Mermaid para criação de diagramas técnicos. A documentação é mantida em formato Markdown (README.md, docs/*.md), com documentação de API em Swagger ou Postman Collections, e wiki do projeto em GitHub Wiki ou Notion.

Para testes, utiliza-se PHPUnit e Laravel Dusk no backend, Jest/Vitest e React Testing Library no frontend, Cypress ou Playwright para testes end-to-end, e Xdebug (PHP) e Istanbul (JavaScript) para análise de cobertura de testes. A pipeline de CI/CD é implementada em GitHub Actions, com deploy gerido através de Laravel Forge, Envoyer ou scripts customizados.

### Equipa

A equipa do projeto GlobalHoops é composta por 4-6 elementos com funções bem definidas. O Product Owner dedica 10-15 horas semanais à definição de requisitos, priorização do backlog, validação de entregas e comunicação com stakeholders. O Tech Lead trabalha 20-25 horas semanais em arquitetura técnica, code reviews, mentoria da equipa e resolução de impedimentos técnicos.

Os Backend Developers (1-2 pessoas) dedicam 20-30 horas semanais ao desenvolvimento de APIs Laravel, implementação de lógica de negócio, integrações com a ESPN API e modelação e otimização da base de dados. Os Frontend Developers (1-2 pessoas) trabalham o mesmo número de horas em interfaces React/Inertia, garantia de responsividade, implementação de animações e desenvolvimento do Service Worker para push notifications.

Um Full-Stack Developer dedica 20-30 horas semanais a features end-to-end que requerem coordenação entre frontend e backend, prestando suporte em ambas as áreas. O QA/Tester trabalha 10-15 horas semanais em testes manuais e automatizados, validação de requisitos e reporte de bugs. Por fim, um elemento de DevOps em part-time (5-10 horas semanais) gere a pipeline de CI/CD, infraestrutura, deploy e monitorização. O esforço total da equipa situa-se entre 100-140 horas semanais.

### Serviços/Contas

O repositório Git está alojado no GitHub (plano Free ou Team a ~4$/utilizador/mês) sob `JorgeFernandes2206/GlobalHoops`. A gestão do projeto utiliza GitHub Projects, Notion ou Trello com um board Kanban contendo colunas To Do, In Progress, In Review e Done, com backlog organizado por prioridade.

Quanto a APIs externas, o projeto depende principalmente da ESPN Basketball API (endpoint público `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/*`), que é gratuita mas tem rate limit de aproximadamente 60 requests por minuto. Para as push notifications utiliza-se o protocolo Web Push (VAPID) através do Firebase Cloud Messaging ou APIs nativas dos browsers, também sem custos associados.

A monitorização inclui logs nativos do Laravel (storage/logs), opcionalmente Sentry para error tracking (plano gratuito com 5k eventos/mês), Google Analytics 4 para analytics de utilizador, e UptimeRobot (gratuito) para monitorização de uptime. A comunicação da equipa é feita via Discord ou Slack para comunicação diária, email para notificações importantes, e Google Meet ou Zoom para reuniões e demos.

### Riscos (Top 3) & Mitigações

O risco mais significativo identificado é a dependência da ESPN API externa (probabilidade alta, impacto alto). Esta API pode estar offline ou instável, o rate limiting pode bloquear a aplicação, e podem ocorrer mudanças no formato de dados sem aviso prévio. As mitigações incluem implementação de caching agressivo com Redis (5-15 minutos de TTL), fallback automático para dados em cache quando a API está indisponível, rate limiting local (máximo 1 request a cada 5 segundos), retry logic com backoff exponencial, monitorização contínua da disponibilidade da API, e identificação de API alternativa (como TheSportsDB) como plano B.

O segundo risco mais relevante relaciona-se com a compatibilidade dos push notifications (probabilidade média, impacto médio). Service Workers não são suportados em todos os browsers, a configuração OpenSSL é complexa especialmente em ambientes Windows, e a gestão de certificados SSL em produção pode ser desafiante. As mitigações passam por implementar feature detection no frontend, providenciar fallback para notificações in-app quando push notifications não estão disponíveis, criar documentação detalhada do setup OpenSSL, realizar testes em múltiplos browsers, utilizar Let's Encrypt para certificados SSL gratuitos, e desenvolver script `artisan.bat` que configura automaticamente a variável de ambiente OPENSSL_CONF.

O terceiro risco identificado é a inconsistência dos ambientes de desenvolvimento (probabilidade média, impacto médio), resultante de diferentes versões de PHP e Node.js entre membros da equipa, dependências conflituantes, e problemas específicos de setup em Windows. As mitigações incluem uso de Docker ou Laravel Sail para ambientes isolados e replicáveis, manutenção de ficheiro `.env.example` completo e documentado, criação de scripts de setup automatizados, validação de versões específicas na pipeline de CI/CD, troubleshooting guide detalhado no README, e especificação clara de versões mínimas (PHP 8.2+, Node 20+).

Riscos adicionais de menor impacto incluem problemas de performance com volume alto de dados (mitigados com paginação, lazy loading, índices de base de dados e otimização de queries), vulnerabilidades de segurança como CSRF, XSS e SQL Injection (mitigados através das features de segurança nativas do Laravel, validação rigorosa de inputs e CSP headers), erros em deploy manual (mitigados com CI/CD automatizado, scripts de deploy e estratégia de rollback), e falta de testes em funcionalidades críticas (mitigado através de TDD quando possível, cobertura mínima de 70%, e testes E2E nos fluxos críticos).

Os custos mensais estimados para operação do projeto incluem servidor de staging (€15), servidor de produção (€35), domínio .com (€1-2), opcionalmente GitHub Team (€0-24 dependendo do plano), e Sentry error tracking (€0 no free tier), totalizando entre €51-76 mensais. Note-se que estes custos podem ser reduzidos a €0 utilizando free tiers de vários serviços e hospedagem gratuita em plataformas como Vercel ou Railway.


