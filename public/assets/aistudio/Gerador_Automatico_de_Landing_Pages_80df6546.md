# Central de Clientes, Portal do Cliente e Gerador de Landing Pages

**Especificação funcional e técnica · Versão 3.0**

## 1. Visão do sistema

O sistema tem dois ambientes autenticados. O **Painel Administrativo**, exclusivo de administradores, concentra cadastros, documentos, tarefas, histórico e o gerador de landing pages. O **Portal do Cliente** permite acompanhar as próprias páginas, ver as prévias liberadas e abrir o site publicado quando o endereço estiver registrado.

A landing page exportada é um terceiro ambiente. Ela roda na hospedagem escolhida e, se publicada em endereço público, abre sem login. Para apresentar uma página em particular, o administrador usa a prévia autenticada do portal.

O operador cadastra o cliente uma vez e pode criar várias páginas vinculadas a ele. Uma mesma empresa pode ter uma página institucional, outra para um serviço e outra para uma campanha. Cada página tem conteúdo, prévia e histórico próprios.

O painel é autenticado e usa armazenamento centralizado. Cada landing page é entregue como um ZIP com HTML, CSS e imagens. A hospedagem da página é independente do painel e a publicação é feita pelo operador.

### Exemplo de ponta a ponta

O operador cadastra uma fotógrafa com nome, contato administrativo e CPF, quando necessário para a prestação do serviço. Na aba **Perfil de divulgação**, informa o nome comercial, os serviços, o WhatsApp comercial e escolhe um retrato autorizado. Ao clicar em **Sugerir landing page**, recebe uma proposta com modelo Portfólio, galeria e botão de orçamento. Ele pode trocar o modelo, revisar textos e liberar uma prévia específica. A fotógrafa recebe o convite, ativa a conta e visualiza a página pelo portal. Após a aprovação administrativa, o administrador baixa o ZIP, publica os arquivos e registra a URL para que ela possa abrir o site final.

## 2. Fluxo de trabalho

1. Cadastrar cliente pessoa física ou jurídica.
2. Organizar dados internos, contatos e, quando necessários, documentos de identificação.
3. Preencher o perfil de divulgação. O painel indica os dados essenciais que ainda faltam.
4. Escolher o objetivo da landing page ou aceitar a sugestão inicial.
5. Gerar uma recomendação com modelo, ordem das seções, título, texto inicial e CTA.
6. Ajustar os elementos desejados e abrir a prévia para celular e desktop.
7. Conferir os dados e as imagens da revisão e, quando desejar, liberá-la como prévia privada.
8. Convidar o cliente pela ficha. Após ativar a conta, ele vê em **Minhas páginas** as páginas disponibilizadas e pode abrir a prévia liberada.
9. Aprovar administrativamente a revisão, baixar o ZIP, publicar e registrar a URL com a versão correspondente.
10. Acompanhar tarefas, acessos ao portal, versões e publicações na ficha do cliente.

**Meta do MVP.** Com perfil de divulgação válido e imagens já disponíveis, gerar, conferir e exportar uma página em até cinco minutos em teste de homologação.

## 3. Telas e design dos ambientes

### 3.1 Painel Administrativo

| Tela | Conteúdo principal | Ações |
| --- | --- | --- |
| Dashboard | Total de clientes ativos, tarefas vencidas, páginas aguardando revisão e últimas alterações | Abrir filas filtradas e iniciar novo cadastro |
| Clientes | Nome, tipo, cidade, responsável, tags, status e última atualização | Buscar, filtrar, ordenar e abrir ficha |
| Ficha do cliente | Visão geral e abas Cadastro, Contatos, Documentos, Perfil de divulgação, Tarefas, Histórico e Landing pages | Editar, atribuir responsável e arquivar |
| Biblioteca de páginas | Páginas da carteira, cliente, modelo, estado editorial e situação informada da publicação | Abrir, duplicar, filtrar, arquivar e criar |
| Assistente de criação | Objetivo, oferta, perfil de divulgação e recomendação explicada | Aplicar sugestão, escolher outro modelo ou salvar rascunho |
| Editor e prévia | Seções, textos, tema, imagens, contatos, SEO e simulação de larguras | Editar, reordenar, testar contato, aprovar e exportar |
| Administração | Administradores, contas do portal, convites e auditoria | Convidar, reenviar convite, revogar acesso, revisar sessões e consultar eventos |

No desktop, o editor combina controles e prévia. No celular, as abas **Editar** e **Prévia** alternam entre os dois modos. Campos obrigatórios têm erro próximo ao controle. A interface mostra estados de carregamento, lista vazia, erro, salvamento e conflito de edição.

### 3.2 Portal do Cliente

| Tela | Conteúdo | Ação principal |
| --- | --- | --- |
| Entrar | Identidade do serviço, e-mail, senha e recuperação | Entrar no portal |
| Ativar acesso | Validação do convite, definição da senha e confirmação | Ativar minha conta |
| Início | Saudação, página mais recente, status e atalho de suporte configurado | Abrir minha página |
| Minhas páginas | Cartões com nome, miniatura autorizada, status e data da revisão visível | Ver prévia ou abrir site |
| Detalhe da página | Prévia responsiva, versão visível e link externo publicado, quando disponível | Visualizar no celular ou desktop |
| Minha conta | E-mail da conta, troca de senha e saída | Gerenciar meu acesso |

Quando não houver material liberado, exibir **Suas páginas aparecerão aqui quando estiverem disponíveis**. Se houver somente uma página, destacá-la no início sem retirar o acesso à listagem. O portal exibe apenas o resumo da conta e informações da landing page destinadas ao cliente. A revisão do cliente, nesta versão, é de consulta. Alterações e aprovação editorial ocorrem no painel administrativo.

### 3.3 Direção visual

| Elemento | Painel Administrativo | Portal do Cliente |
| --- | --- | --- |
| Navegação | Barra lateral com Dashboard, Clientes, Landing Pages e Administração | Cabeçalho simples com Início, Minhas páginas e Conta |
| Primeira tela | Indicadores de trabalho e listas que levam à ação | Cartão amplo com capa ou miniatura, status e botão para abrir a página |
| Organização | Tabelas filtráveis no desktop e cartões empilhados no celular | Cartões com poucos dados e textos claros |
| Identidade inicial | Fundo cinza claro, superfícies brancas, texto grafite e azul como ação principal | Mesma base visual, com maior destaque para a capa da página |
| Estados | Foco visível, carregamento, confirmação, erro, conteúdo vazio e revisão pendente | Carregamento, acesso expirado, prévia disponível e site publicado |

Paleta inicial sugerida. Fundo `#F4F6FA`, superfície `#FFFFFF`, texto `#172033` e ação `#2447C6`. Usar espaçamento baseado em múltiplos de 4 px, tipografia de sistema, áreas de toque de pelo menos 44 px nos controles principais e status com texto além da cor. Cada landing page usa a identidade visual de seu cliente. A tela de login do administrador tem identificação própria e oferece fluxo para o segundo fator.

## 4. Central de Clientes

### 4.1 Cadastro e destino dos dados

| Grupo | Campos | Uso |
| --- | --- | --- |
| Cadastro mínimo | Tipo PF/PJ, nome de identificação e responsável interno | Identificar e atribuir o registro no painel |
| Identificação PF | Nome civil, CPF e, se necessário, RG/CIN ou outro documento com tipo, número e campos aplicáveis | Área restrita de identificação |
| Identificação PJ | Razão social, nome fantasia, CNPJ e representante, quando necessário | Área interna. O nome fantasia pode ser escolhido separadamente como nome público |
| Contatos administrativos | Nome da pessoa de contato, telefone, e-mail e papel no atendimento | Atendimento interno |
| Dados administrativos | Endereço, observações, tags, data de entrada e origem do cliente | Organização e histórico do atendimento |
| Documentos | Frente e verso quando necessário, contrato e anexos internos, com categoria e finalidade | Área restrita de documentos |
| Imagem interna | Retrato cadastral opcional e separado dos materiais de divulgação | Identificação visual na ficha |
| Perfil de divulgação | Nome público, atividade, apresentação, cidade ou região de atendimento, canais comerciais, redes, serviços e mídia de divulgação | Fonte elegível para a landing page após seleção e revisão |

**CPF, identidade e anexos são opcionais.** O operador informa a finalidade ao registrar um identificador ou documento e coleta apenas o necessário para o atendimento. A geração funciona com o perfil de divulgação. É possível registrar apenas o número quando o processo exigir esse dado e dispensar a cópia da identidade.

O tipo de documento determina os campos aplicáveis. RG legado, CIN e outros documentos aceitos podem ter estruturas diferentes. Preservar zeros à esquerda ao normalizar identificadores. Validar CPF e CNPJ conforme o formato aplicável, sem tratar validação de formato ou dígitos como prova de identidade. No MVP, o operador digita os dados. A leitura automática de documentos pode ser tratada em uma etapa posterior.

### 4.2 Controle da carteira

- Status do cliente **Em cadastro**, **Ativo**, **Inativo** e **Arquivado**. Esse status é independente dos estados das páginas.
- Busca por nome, nome público, cidade, tags e contato quando autorizado. Filtros por status, responsável, tipo PF/PJ e período. Paginação e ordenação por última atualização.
- Detectar identificador exato em registros do mesmo ambiente por índice protegido. Alertar usuários autorizados sobre duplicidade e oferecer abertura do cadastro existente. Para coincidência de nome ou contato, tratar como possível duplicidade e permitir cadastro após conferência.
- Registrar atividades de atendimento com data, autor, canal e resumo. Vincular tarefas com responsável, prazo e estado **Aberta**, **Concluída** ou **Cancelada**.
- Mostrar, na ficha, páginas vinculadas, datas de exportação e publicações informadas. A trilha operacional pode reunir eventos de atendimento e páginas. A auditoria de segurança tem acesso e armazenamento próprios.
- Arquivar retira o cadastro das listas ativas e restringe novas páginas até reativação. Exclusão segue um fluxo administrativo com verificação de vínculos, arquivos e política de retenção.

### 4.3 Perfil de divulgação

| Campo público | Regra inicial |
| --- | --- |
| Nome público | Obrigatório para gerar. Até 80 caracteres |
| Atividade ou profissão | Obrigatória para gerar. Até 80 caracteres |
| Apresentação breve | Obrigatória para gerar. Até 300 caracteres |
| Canal comercial principal | Obrigatório para gerar. WhatsApp, telefone, e-mail ou URL HTTPS |
| Local de atendimento | Cidade, região, atendimento remoto ou endereço comercial explicitamente destinado à divulgação |
| Serviços ou ofertas | Até seis itens. Nome e descrição de até 280 caracteres por item |
| Sobre e diferenciais | Sobre de até 1.500 caracteres e até quatro diferenciais de 140 caracteres |
| Mídia | Retrato público, logo, imagem de capa e até seis itens de portfólio. Limite de dez imagens por página |
| Redes | Até cinco links com rótulo e URL HTTPS |
| Identidade visual | Cor principal, estilo de tema e logo opcional |

Uma foto cadastral pode ser reaproveitada somente por ação explícita de **Criar cópia para divulgação** e confirmação do uso. A cópia é processada como um novo recurso, com vínculo de autorização e remoção de metadados. Arquivos classificados como identidade, contrato ou anexo administrativo nunca entram nesse fluxo.

Ao criar a página, o assistente oferece uma seleção dos campos do perfil público. A revisão recebe uma cópia dos valores selecionados. Alterações futuras no cadastro geram uma indicação de atualização disponível, com comparação e aplicação por campo. Páginas exportadas e edições manuais continuam vinculadas à revisão em que foram feitas.

## 5. Motor de sugestão

### 5.1 Entradas, resultados e regras

O motor recebe somente objetivo, atividade, conteúdo de divulgação selecionado, canais públicos, mídias autorizadas e preferências visuais. A resposta contém modelo recomendado, uma justificativa curta, configuração de seções, textos-base, CTA e pendências.

| Situação | Modelo recomendado | CTA inicial |
| --- | --- | --- |
| Divulgar portfólio com imagens selecionadas | Portfólio | Ver trabalhos ou solicitar orçamento, conforme o destino configurado |
| Receber pedidos de orçamento | Serviços | Solicitar orçamento |
| Agendar atendimento | Serviços | Agendar atendimento |
| Apresentar perfil | Profissional | Entre em contato |
| Divulgar campanha com uma oferta selecionada | Campanha | Saiba mais ou solicitar informações, conforme o destino |
| Objetivo ausente | Sugerir Portfólio quando houver galeria, Serviços quando houver serviços ou Profissional nos demais casos | Sugerir rótulo coerente com o modelo e confirmar o objetivo |

Quando o operador define o objetivo, ele prevalece sobre a inferência. Portfólio sem imagens continua disponível com destaque tipográfico e aviso de que falta material para a galeria. Campanha exige uma oferta selecionada. Se houver campos essenciais incompletos, mostrar as pendências e liberar o rascunho, mantendo a aprovação e a exportação bloqueadas.

A geração inicial usa regras e modelos, sem serviço de IA. Textos partem dos fatos fornecidos, com edição manual por campo. Preços, certificações, depoimentos e resultados aparecem somente quando cadastrados para divulgação. Regenerar atualiza os campos automáticos e preserva substituições manuais. O operador pode restaurar o texto automático por campo.

### 5.2 Exemplos de sugestão

| Cliente e objetivo | Sugestão apresentada |
| --- | --- |
| Fotógrafa, seis fotos e objetivo de portfólio | Destaque com retrato, galeria antes da biografia e botão de orçamento |
| Eletricista, quatro serviços e objetivo de orçamento | Destaque com região atendida, serviços em cartões e CTA de WhatsApp |
| Professora particular, perfil e agenda por link | Apresentação profissional, disciplinas oferecidas e botão de agendamento |
| Pequeno negócio com promoção cadastrada | Destaque na oferta selecionada, condições fornecidas e CTA para o canal comercial |

## 6. Editor e padrões de design

| Modelo | Estrutura inicial |
| --- | --- |
| Profissional | Destaque, sobre, serviços, diferenciais, portfólio e contato |
| Serviços | Destaque, serviços, diferenciais, sobre, portfólio e contato |
| Portfólio | Destaque, galeria, sobre, serviços e contato |
| Campanha | Destaque, oferta, detalhes da oferta, informações complementares e CTA final |

- Permitir editar título, subtítulo, nome da ação, descrições, ordem e visibilidade das seções opcionais. Seções vazias são omitidas. Links de navegação apontam para seções existentes.
- Aplicar um visual responsivo com título de destaque, espaços consistentes, tipografia legível, contraste e CTA evidente. Galerias e serviços se ajustam de uma coluna no celular a grades em telas maiores.
- Oferecer temas **Claro**, **Escuro** e **Neutro**, com cores de marca definidas por tokens. Corrigir combinações de baixo contraste e indicar o ajuste na prévia.
- Permitir prévia em celular, tablet e desktop. Renderizar a mesma revisão usada pelo exportador em iframe isolado, com scripts e formulários desativados. Links externos podem ser testados por ação separada no painel.
- Usar imagens públicas em JPEG, PNG ou WebP, até 8 MiB e 20 megapixels por arquivo na entrada. Validar o formato real, redimensionar para até 1.600 pixels no lado maior e reprocessar para remover metadados. Solicitar texto alternativo para imagens informativas.
- Usar um único H1, hierarquia de títulos, idioma pt-BR, navegação por teclado, foco visível e contraste mínimo de 4,5:1 para texto comum e 3:1 para texto grande.
- Gerar título, descrição e metadados sociais. Gerar URL canônica e `og:url` quando a URL final for conhecida. Gerar `og:image` absoluta quando houver URL final e imagem autorizada.

### Validação dos canais

WhatsApp e telefone usam o código internacional e os dígitos normalizados. Para WhatsApp, gerar `https://wa.me/<numero>?text=<mensagem-codificada>`. Telefone usa `tel:` e e-mail usa `mailto:` sem parâmetros fornecidos pelo usuário. URLs externas devem ser HTTPS, absolutas e sem credenciais embutidas. A validação verifica o formato. O operador testa o destino na revisão.

## 7. Login, contas e permissões

### 7.1 Papéis e rotas

| Operação | Administrador | Cliente autenticado |
| --- | --- | --- |
| Entrar no painel e nas APIs administrativas | Sim, com MFA | Acesso bloqueado |
| Criar e editar cadastros, contatos, tarefas e perfil de divulgação | Sim | — |
| Consultar CPF, identidade e anexos | Com permissão explícita e ação de acesso auditada | — |
| Criar, editar, liberar prévia, aprovar e exportar páginas | Sim | — |
| Ver páginas liberadas no portal | Pode conferir a mesma projeção de dados exibida ao cliente | Somente das fichas com vínculo ativo |
| Ver prévia e recursos de uma revisão | Revisões do painel | Somente a revisão liberada para aquele vínculo |
| Abrir link do site registrado | Sim | Somente páginas vinculadas e disponibilizadas no portal |
| Gerir convites, sessões e auditoria | Conforme as permissões administrativas | Gerencia apenas a própria sessão e senha |

Rotas de interface propostas. `/admin/entrar` e `/admin/*` para a administração. `/portal/entrar`, `/portal/ativar` e `/portal/*` para clientes. Usar o mesmo serviço de identidade com áreas e permissões explícitas. Um login no portal não concede contexto administrativo. A API verifica sessão, papel e escopo do recurso a cada operação, inclusive em downloads e imagens de prévia. Aplicar recusa por padrão. Para identificadores pertencentes a outro cliente, responder sem revelar se o recurso existe.

Na primeira versão, os papéis de entrada são **Administrador** e **Cliente**. Contas administrativas são individuais. A função é atribuída somente por um administrador autorizado. A primeira conta administrativa é provisionada no ambiente de implantação, com MFA ativado antes de acessar dados reais.

### 7.2 Convite, ativação e recuperação

1. Na ficha do cliente, o administrador informa o e-mail de acesso e seleciona **Convidar para o portal**. O e-mail de acesso é independente do WhatsApp e dos contatos publicados.
2. O sistema envia um convite com token aleatório, de uso único e validade inicial proposta de 48 horas. Guarda apenas a representação protegida do token. O vínculo fica **Convite pendente** até a aceitação.
3. O destinatário abre o link, confirma o acesso e cria sua senha. Se já tiver conta, entra com o mesmo e-mail verificado para aceitar o novo vínculo. O convite só é consumido após confirmação explícita, em operação atômica.
4. O administrador acompanha **Pendente**, **Ativo**, **Suspenso** e **Revogado**. Reenviar invalida o convite anterior. Alterar o e-mail exige nova verificação e revoga o vínculo anterior.
5. **Esqueci minha senha** apresenta resposta genérica e envia, quando aplicável, link de uso único com validade inicial de 30 minutos. Após redefinição, invalidar sessões anteriores. CPF, identidade e contatos públicos ficam fora da recuperação de conta.

Uma ficha pode ter mais de uma pessoa autorizada, cada uma com login próprio. Uma conta pode ter vínculos explícitos com mais de uma ficha e alternar entre elas. O servidor valida o vínculo ativo sempre que consultar páginas e recursos. Suspender ou revogar um vínculo corta o acesso àquela ficha imediatamente, inclusive em uma aba já aberta para novas requisições. Arquivar um cliente suspende os acessos do portal e exige ação explícita para reabilitá-los após reativação.

### 7.3 Sessões e autenticação

- Usar provedor de identidade consolidado ou implementação server-side revisada. Para sessão web, usar cookies com `HttpOnly`, `Secure` e política `SameSite` adequada, proteção CSRF em mutações, rotação após autenticação e invalidação no servidor. Evitar tokens de sessão em armazenamento acessível a scripts.
- Exigir MFA de administradores, inclusive para recuperação, e reautenticar para revelar documentos, conceder acesso administrativo ou mudar fatores de autenticação. Prever códigos de recuperação de uso único com trilha de auditoria.
- Limitar tentativas de login, envio de convites e recuperação por conta e origem. Se a aplicação gerenciar senhas, armazenar somente hash com algoritmo dedicado, como Argon2id. Permitir gerenciadores de senhas e colagem.
- Prazos iniciais sugeridos. Administração com 30 minutos de inatividade e limite absoluto de 8 horas. Portal com 60 minutos de inatividade e limite absoluto de 12 horas. Revogar no logout, suspensão ou alteração de privilégios. Proteger os fluxos contra redirecionamentos externos arbitrários.
- Auditar convites, ativação, falhas relevantes de autenticação, revogação, alteração de papéis, liberação de revisão e acesso a documentos. Registrar identificadores operacionais e resultados, sem senhas, tokens ou conteúdo dos anexos.

Referências para implementação. [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) · [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) · [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)

## 8. Arquitetura e modelo de dados

### 8.1 Estrutura proposta

- **Aplicação web** em React e TypeScript, com rotas responsivas separadas para administração e portal, cada uma com sua navegação e seu escopo.
- **API** em Node.js e TypeScript, com módulos de clientes, documentos, divulgação, páginas, exportação e auditoria.
- **PostgreSQL** para registros de negócio e revisões. Armazenamento de objetos privado para documentos, imagens processadas e pacotes temporários.
- **Gerador** com validação de entrada, composição de conteúdo e renderização determinística de HTML/CSS. O painel e o site exportado têm ciclos de execução separados.

### 8.2 Entidades principais

| Entidade | Conteúdo |
| --- | --- |
| `users`, `admin_roles`, `sessions` | Contas, permissões administrativas e controle de sessões |
| `client_access_grants`, `invitations` | Vínculos usuário–cliente e convites com e-mail, estado, validade e autor |
| `portal_page_visibility` | Páginas disponibilizadas, revisão de prévia liberada, data e administrador responsável |
| `clients`, `client_contacts` | Cadastro administrativo, status e contatos internos |
| `client_identifiers`, `private_documents` | Identificadores protegidos, finalidade, categoria e referência aos arquivos restritos |
| `public_profiles`, `publication_assets` | Campos elegíveis para divulgação, autorização de uso e mídia processada |
| `client_activities`, `client_tasks` | Eventos operacionais e tarefas |
| `landing_pages`, `page_revisions` | Página vinculada ao cliente, versões do modelo e instantâneos públicos |
| `page_exports`, `publication_records` | Revisão empacotada, autor e registros manuais de URL ou retirada |
| `audit_events` | Ator, ação, recurso, momento e resultado, sem valores sensíveis |

O gerador recebe um contrato próprio que lista os campos permitidos. O exemplo abaixo representa uma entrada reduzida, derivada de uma revisão pública. A camada de validação rejeita chaves fora do contrato. A API do gerador não consulta tabelas de identidade e recebe apenas referências autorizadas de mídia de divulgação.

```json
{
  "schemaVersion": 2,
  "template": "portfolio",
  "templateVersion": 1,
  "goal": "portfolio",
  "slug": "marina-fotografia",
  "identity": {
    "publicName": "Marina Fotografia",
    "activity": "Fotografia de família",
    "summary": "Ensaios externos para famílias em Goiânia e região."
  },
  "contact": {
    "kind": "whatsapp",
    "value": "+55 62 90000-0000",
    "ctaLabel": "Solicitar orçamento"
  },
  "assets": []
}
```

### 8.3 Rotas de referência

| Operação | Rotas propostas |
| --- | --- |
| Identidade | `POST /auth/login`, `POST /auth/mfa/verify`, `POST /auth/logout`, `POST /auth/password-reset/request`, `POST /auth/password-reset/confirm`, `POST /auth/invitations/accept` |
| Administração de acessos | `GET/POST /admin/clients/{id}/invitations`, `POST /admin/clients/{id}/invitations/{inviteId}/resend`, `PATCH /admin/clients/{id}/access/{grantId}` |
| Portal | `GET /portal/me`, `GET /portal/clients/{id}/pages`, `GET /portal/pages/{id}`, `GET /portal/pages/{id}/revisions/{revision}/preview`, `GET /portal/pages/{id}/revisions/{revision}/assets/{assetId}` |
| Disponibilidade no portal | `PUT /admin/pages/{id}/portal-visibility` para liberar, trocar a revisão ou retirar a página |
| Clientes e carteira | `GET/POST /clients`, `GET/PATCH /clients/{id}`, `POST /clients/{id}/archive` |
| Documentos e identificação | `GET/POST /clients/{id}/documents`, `GET /clients/{id}/documents/{documentId}/content`, `POST /clients/{id}/identifiers/{identifierId}/reveal` |
| Perfil público e mídias | `GET/PATCH /clients/{id}/public-profile`, `POST /clients/{id}/publication-assets` |
| Atendimento e tarefas | `GET/POST /clients/{id}/activities`, `GET/POST /clients/{id}/tasks`, `PATCH /clients/{id}/tasks/{taskId}` |
| Páginas | `GET/POST /clients/{id}/pages`, `GET/PATCH /pages/{id}` |
| Geração e revisão | `POST /pages/{id}/suggestions`, `GET /pages/{id}/revisions/{revision}/preview`, `POST /pages/{id}/revisions/{revision}/approve` |
| Exportação e publicação | `POST /pages/{id}/revisions/{revision}/exports`, `GET /pages/{id}/exports/{exportId}/download`, `POST /pages/{id}/publication-records` |

As rotas operacionais da carteira, documentos, edição, aprovação e exportação da tabela usam prefixo `/admin` e exigem contexto administrativo. Rotas do portal usam projeções de dados próprias. Usar paginação em listagens e respostas de validação por campo. Usar revisão esperada na edição e retornar conflito se outra alteração já tiver sido gravada. Sugestões retornam uma proposta que o editor aplica de forma explícita. Aprovação e exportação referenciam uma revisão imutável. Retentativas de exportação usam chave de idempotência e o pacote é liberado após validação completa.

## 9. Proteção dos dados e dos arquivos

1. **Autenticação e escopo.** Exigir sessão no painel, MFA para contas com acesso a documentos e verificação por recurso na API. Encerrar sessões revogadas e limitar tentativas de autenticação e revelação.
2. **Armazenamento.** Criptografar identificadores e arquivos restritos, com chaves gerenciadas separadamente e tráfego HTTPS. Para busca exata e deduplicação, usar índice derivado com chave própria e escopo do ambiente. Manter documentos restritos separados das mídias de publicação.
3. **Upload de documentos.** Aceitar JPEG, PNG e PDF de até 10 MiB por arquivo. Validar tamanho, assinatura e tipo real. Gerar nome interno opaco. Colocar o arquivo em quarentena até análise de segurança. Abrir ou baixar somente por rota autenticada e autorizada, com registro do acesso.
4. **Barreira de exportação.** Montar o site a partir do contrato público e de referências de mídia autorizada. Bloquear documentos internos por tipo e origem. Escapar HTML, validar URLs e impedir caminhos fora da pasta do pacote. Conferir textos, metadados e nomes de arquivos para identificar dados restritos inseridos por engano. Submeter a mesma revisão à aprovação visual.
5. **Logs e retenção.** Registrar visualização, download, alteração e exclusão de dados restritos, com acesso limitado à trilha. Evitar CPF, identidade, conteúdo de documentos e URLs de acesso em logs, notificações e eventos de análise. Definir prazos de retenção por finalidade antes do uso com dados reais, incluindo backups. Testar recuperação e exclusão controlada.
6. **Retirada de dados.** Ao retirar autorização de uma imagem, bloquear novas prévias, downloads e exportações das revisões afetadas, sinalizar páginas publicadas e orientar a substituição ou remoção dos arquivos no host. A revisão nova exige nova aprovação.

Referências para implementação. [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html) · [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html) · [OWASP Developer Guide sobre identidade digital](https://devguide.owasp.org/en/04-design/02-web-app-checklist/06-digital-identity/)

## 10. Revisões, exportação e publicação

| Controle | Estados e transições |
| --- | --- |
| Revisão editorial | Rascunho → Em revisão → Aprovada. Alterar conteúdo após aprovação cria nova revisão em rascunho |
| Visibilidade no portal | Oculta ou Disponível. Uma página disponível pode mostrar a prévia, o link publicado ou ambos |
| Prévia para cliente | Ausente ou Liberada. A liberação aponta para uma revisão específica e pode ser retirada ou substituída pelo administrador |
| Exportação | Solicitada → Processando → Disponível ou Falhou. Cada pacote pertence a uma revisão aprovada e tem acesso autenticado |
| Publicação informada | Sem registro → Publicada informada → Retirada informada. Registrar URL HTTPS, revisão, data e operador |

### Prévia privada e URL publicada

- Toda página nasce oculta no portal. O administrador decide quando disponibilizá-la e qual revisão mostrar. A liberação é independente da aprovação para exportação. Uma nova edição não troca a prévia liberada. A publicação registrada pode apontar para uma revisão diferente da prévia.
- O cliente abre a prévia dentro da sessão. O servidor verifica vínculo, disponibilidade, revisão e autorização da imagem a cada requisição, inclusive para miniaturas, CSS e mídia. Responder com `Cache-Control: private, no-store` e evitar cache compartilhado e indexação. A prévia permanece isolada no iframe e usa recursos servidos por rotas protegidas. Convites e links do portal não funcionam como links públicos de prévia.
- O portal pode exibir duas ações independentes, **Ver prévia** para a revisão liberada e **Abrir site publicado** para a URL registrada. Quando a prévia for mais recente, identificar a versão de cada uma. Ao registrar retirada, o portal deixa de oferecer o link. Arquivos já publicados são retirados na hospedagem.
- A exportação é acessível ao administrador. O pacote usa somente o conteúdo aprovado para publicação. Sua publicação em hospedagem pública disponibiliza o site para qualquer visitante que tenha o endereço.

### Pacote

```text
marina-fotografia.zip
  index.html
  assets/
    style.css
    perfil.webp
    portfolio-01.webp
```

O `index.html` fica na raiz. CSS e imagens usam caminhos relativos para funcionar localmente, na raiz da hospedagem ou em subpastas. O conteúdo principal e os links devem funcionar com JavaScript desativado. Usar fontes do sistema e recursos locais. O ZIP contém somente arquivos necessários para exibir a versão aprovada.

Validar slug em minúsculas, com letras ASCII, números e hífens internos, até 60 caracteres. Se a normalização resultar em vazio, sugerir `pagina-<id-curto>`. Mostrar instrução para extrair o ZIP, subir `index.html` junto da pasta `assets` e conferir a URL no celular e no computador. Para atualizar, publicar uma nova exportação completa e registrar a revisão correspondente.

## 11. Critérios de aceitação

| ID | Cenário | Resultado esperado |
| --- | --- | --- |
| T01 | Cadastrar cliente PF ou PJ sem documento | Ficha criada e perfil público pode gerar uma página |
| T02 | Cadastrar CPF, identidade e foto cadastral. Exportar página do mesmo cliente | HTML, CSS, imagens, metadados e ZIP contêm apenas conteúdo aprovado para divulgação |
| T03 | Cliente tenta abrir documento privado, exportação ou rota administrativa | A API nega acesso, inclusive com requisição direta, e registra o evento conforme a política |
| T04 | Enviar um arquivo com extensão de imagem e conteúdo incompatível | Arquivo rejeitado. Dados restantes continuam disponíveis |
| T05 | Repetir identificador em duas solicitações concorrentes | Restrição no armazenamento impede dois registros com o mesmo identificador no ambiente |
| T06 | Criar página com galeria e objetivo de portfólio, depois trocar para Serviços | Recomendação inicial coerente e edição preservada ao trocar o modelo |
| T07 | Criar com dados mínimos, sem mídia | Destaque, CTA e contato funcionam. Seções vazias são omitidas |
| T08 | Gerar CTA com telefone incompleto ou URL `javascript:` | Campo sinalizado e exportação bloqueada |
| T09 | Inserir marcação HTML no nome ou descrição | Texto escapado, sem execução de código |
| T10 | Atualizar dados públicos e editar a mesma página em duas abas | Alteração no perfil exige aplicação explícita. Edição concorrente retorna conflito sem perda silenciosa |
| T11 | Editar revisão já aprovada e tentar exportar a nova | Nova revisão exige aprovação. Exportações anteriores preservam a referência à versão original |
| T12 | Abrir ZIP em subpasta com JavaScript desativado e testar 320, 390, 768 e 1.440 px | Imagens, estilos e links funcionam. Layout sem rolagem horizontal |
| T13 | Revogar autorização de uma foto presente em revisão já exportada | Novos downloads ficam bloqueados e publicação registrada recebe indicação de atualização ou retirada |
| T14 | Simular falha de upload ou geração de ZIP | Sistema preserva o rascunho e permite nova tentativa sem duplicar registros |
| T15 | Filtrar carteira, concluir tarefa e arquivar cliente | Lista, histórico e ações disponíveis refletem o novo estado |
| T16 | Usar convite expirado, já aceito ou substituído | A ativação falha e orienta pedir novo convite. O vínculo existente permanece consistente |
| T17 | Cliente A tenta abrir revisão, miniatura ou imagem do cliente B por URL direta | Resposta sem conteúdo e sem revelar a existência do recurso |
| T18 | Abrir login administrativo com conta de cliente ou interromper o MFA de administrador | Sessão administrativa não é concedida |
| T19 | Liberar revisão 2, editar revisão 3 e testar pelo portal | O cliente continua vendo a revisão 2 até nova liberação explícita |
| T20 | Suspender vínculo ou retirar prévia durante uma sessão aberta | Novas requisições ao conteúdo e aos arquivos são negadas imediatamente |
| T21 | Redefinir senha e tentar reutilizar link ou sessão anterior | Link consumido e sessões anteriores rejeitados |
| T22 | Registrar publicação com uma revisão diferente da prévia | Portal distingue as duas ações. O ZIP publicado abre independentemente da sessão |
| T23 | Testar portal vazio, várias páginas e múltiplos vínculos no celular | Estados claros, navegação funcional e troca de contexto sem misturar fichas |

## 12. Etapas de implementação

| Etapa | Entrega | Condição para avançar |
| --- | --- | --- |
| 1. Identidade e base administrativa | Login, MFA, papéis, ficha PF/PJ, tarefas e perfil público | Administrador opera a carteira e conta de cliente é bloqueada na API administrativa |
| 2. Gerador e portal | Primeiro modelo, recomendação, editor, convite, área Minhas páginas e prévia privada | Duas contas fictícias acessam somente suas páginas. Administrador controla a revisão exibida |
| 3. Exportação e publicação | Aprovação administrativa, ZIP, registro de URL e atualização | Página publicada abre sem sessão. Portal diferencia prévia e site publicado |
| 4. Documentos e experiência completa | Identificadores, quarentena, auditoria, modelos restantes e revisão responsiva | Testes de privacidade, restauração e aceitação aprovados antes do cadastro de documentos reais |
| 5. Evolução opcional | Solicitação de ajustes pelo portal, OCR, IA para textos públicos e integração de hospedagem | Cada recurso recebe escopo próprio e avaliação de permissões e dados |

**Conclusão da primeira versão.** O administrador gerencia a carteira, gera e aprova landing pages e controla quem as vê no portal. O cliente entra com conta própria e acessa apenas as páginas liberadas de seus vínculos. A exportação produz um site estático utilizável na hospedagem.

## 13. Operação e critérios de lançamento

- Separar desenvolvimento, homologação e produção. Usar contas e documentos fictícios nos testes. Provisionar serviços de banco, arquivos, identidade e e-mail transacional por ambiente, com credenciais próprias.
- Testar entrega de convite, expiração, reenvio e recuperação. Exibir falha de entrega no painel e permitir reenvio controlado. Não ativar vínculo quando o envio ou a confirmação falhar.
- Monitorar indisponibilidade, filas de geração, falhas de envio e falhas de autenticação. Separar métricas operacionais da trilha de auditoria. Preparar procedimento para bloquear conta, revogar acesso e restaurar serviços.
- Configurar backups de banco e arquivos, com chaves e acesso restrito. Ensaiar restauração em ambiente isolado antes do lançamento. Verificar a consistência entre usuários, vínculos, revisões, arquivos e registros de publicação.
- Executar homologação com um administrador e dois clientes distintos. Conferir login e recuperação, troca de IDs nas rotas, revogação em sessão aberta, acessibilidade por teclado, contraste e exportação em hospedagem estática.
