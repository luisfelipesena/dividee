# Carteira - Product Documentation

## 1. Visão Geral do Produto

**Nome do Produto:** Carteira

**Resumo/Descrição do Produto:** Carteira é uma plataforma inovadora que permite compartilhar de forma segura os acessos a serviços de streaming e assinaturas com as pessoas que você mais ama. Com ela, você divide os custos, economiza no orçamento e mantém um controle organizado sobre o uso e a renovação das assinaturas.

## 2. Objetivos e Metas

- Facilitar o compartilhamento seguro de senhas e assinaturas.
- Ajudar usuários a economizar ao dividir os custos dos serviços.
- Medir o sucesso por meio do número de usuários, solicitações processadas e feedbacks positivos sobre a economia gerada.

## 3. Público-Alvo

- Estudantes universitários (universitário econômico) e usuários empreendedores que desejam lucrar revendendo acessos.

## 4. Funcionalidades e Requisitos Funcionais do MVP

### 4.1 Gestão de Contas Compartilhadas

1.  **Cadastro de Contas**
    - Registro de nova subscription compartilhada
    - Definição de tipo (pública/privada)
    - Configuração de valor e número máximo de membros
    - Definição de data de expiração/renovação
2.  **Controle de Expiração**
    - Monitoramento automático de datas de expiração
    - Sistema de alertas antecipados
    - Registro de histórico de renovações
    - Gestão de trocas periódicas de senha

### 4.2 Fluxo de Acesso

1.  **Solicitação de Acesso**
    - Interface para pedidos de participação
    - Formulário com justificativa (opcional)
    - Visualização do valor e regras de participação
    - Confirmação de termos de uso
2.  **Gestão de Aprovações**
    - Dashboard do admin para aprovações
    - Visualização de solicitações pendentes
    - Interface de aprovação/rejeição
    - Comunicação automática com solicitante

### 4.3 Sistema de Notificações

1.  **Notificações para Admin**
    - Alertas de necessidade de troca de senha
    - Notificações de novas solicitações
    - Alertas de problemas de pagamento
    - Lembretes de ações pendentes
2.  **Notificações para Usuários**
    - Lembretes de pagamento
    - Avisos de renovação próxima
    - Confirmações de alterações de senha
    - Atualizações de status de solicitação

### 4.4 Integração Bitwarden

1.  **Armazenamento Seguro**
    - Conexão segura com API do Bitwarden
    - Gestão automatizada de credenciais
    - Compartilhamento seguro de senhas
    - Registros de auditoria de acesso
2.  **Gestão de Credenciais**
    - Rotação automática de senhas
    - Sincronização com membros
    - Histórico de alterações
    - Backup de segurança

### 4.5 Dashboard Financeiro

1.  **Visualização de Economia**
    - Cálculo de economia individual
    - Métricas de economia do grupo
    - Gráficos comparativos
    - Projeções de economia futura
2.  **Histórico de Transações**
    - Registro detalhado de pagamentos
    - Histórico de renovações
    - Extrato por usuário
    - Relatórios de custos compartilhados

### 4.6 Requisitos Técnicos Essenciais

- Autenticação segura de dois fatores
- Criptografia de dados sensíveis
- Backup automático de informações
- Logs de auditoria de ações críticas
- API RESTful documentada
- Interface responsiva

### 4.7 Métricas de Sucesso do MVP

- Taxa de conversão de solicitações
- Tempo médio de aprovação
- Satisfação dos usuários
- Economia média por usuário
- Retenção de membros
- Crescimento de grupos ativos

## 5. Requisitos Não Funcionais

- Segurança robusta
- De forma alguma alguém que tem acesso ao sistema pode conseguir acessar as senhas cadastradas, é esperado atingir isso via encriptação e2e (preferível) ou via integrações como a do bitwarden
- Performance adequada para acesso frequente pelos usuários

## 6. Fluxos de Usuário e Casos de Uso

### 6.1 Gestão de Grupos

**Caso de Uso: Criar Grupo**

- Ator: Usuário (Criador)
- Fluxo Principal:
  1.  Usuário cria um novo grupo
  2.  Define nome e configurações básicas
  3.  Grupo é criado como entidade privada
  4.  Usuário se torna administrador do grupo

**Caso de Uso: Convidar para Grupo**

- Ator: Administrador do Grupo
- Fluxo Principal:
  1.  Administrador seleciona "Convidar Membro"
  2.  Insere email do convidado
  3.  Sistema envia convite por email
  4.  Convidado recebe e aceita o convite
  5.  Convidado ganha acesso ao grupo

### 6.2 Gestão de Subscriptions

**Caso de Uso: Gerenciar Subscription Privada**

- Ator: Administrador do Grupo
- Fluxo Principal:
  1.  Administrador adiciona subscription ao grupo
  2.  Define como privada
  3.  Convida membros específicos
  4.  Membros recebem convite com detalhes da subscription
  5.  Membros aceitam e visualizam informações

**Caso de Uso: Solicitar Acesso à Subscription Pública**

- Ator: Usuário Interessado
- Fluxo Principal:
  1.  Usuário encontra subscription pública
  2.  Solicita acesso
  3.  Sistema notifica administradores
  4.  Administrador revisa solicitação
  5.  Se aprovado, sistema gera cobrança
  6.  Usuário efetua pagamento
  7.  Sistema libera acesso após confirmação

### 6.3 Gestão Financeira

**Caso de Uso: Processar Novo Membro**

- Ator: Sistema
- Fluxo Principal:
  1.  Novo membro é aprovado
  2.  Sistema calcula valor proporcional até próxima renovação
  3.  Gera cobrança inicial
  4.  Após pagamento, inclui membro na divisão de custos
  5.  Agenda próxima cobrança para data unificada do grupo

**Caso de Uso: Renovação Mensal**

- Ator: Sistema
- Fluxo Principal:
  1.  Sistema identifica data de renovação
  2.  Calcula valor por membro
  3.  Gera cobranças simultâneas para todos
  4.  Processa pagamentos
  5.  Atualiza acesso/credenciais

### 6.4 Monitoramento e Notificações

**Caso de Uso: Gerenciar Expiração**

- Ator: Sistema
- Fluxo Principal:
  1.  Sistema monitora datas de expiração
  2.  Envia notificações preventivas (7 dias, 3 dias, 1 dia)
  3.  Notifica sobre necessidade de troca de senha
  4.  Coordena renovação sincronizada

### 6.5 Métricas e Visualização

**Caso de Uso: Visualizar Economia**

- Ator: Usuário
- Fluxo Principal:
  1.  Usuário acessa dashboard
  2.  Sistema calcula economia:
      - Valor normal da subscription
      - Valor pago no compartilhamento
      - Diferença = economia
  3.  Exibe métricas:
      - Economia mensal
      - Economia total (lifetime)
      - Economia por subscription

### 6.6 Regras de Negócio Importantes

#### 6.6.1. Sincronização de Pagamentos

- Todos os membros pagam na mesma data mensal
- Entrada de novos membros requer pagamento proporcional

#### 6.6.2. Entrada de Novos Membros

- Se entrar próximo à renovação: paga proporcional + próximo mês
- Sistema calcula automaticamente valores proporcionais

#### 6.6.3. Privacidade e Segurança

- Grupos sempre privados
- Subscriptions podem ser públicas ou privadas
- Informações sensíveis só visíveis após confirmação de pagamento

#### 6.6.4. Gestão de Custos

- Valor dividido igualmente entre membros ativos
- Reajustes aplicados na renovação do ciclo

## 7. Integrações e Dependências

- Integração principal com Bitwarden.
- Dependência de servidores seguros e frameworks para notificações.
- Integrações futuras com gateways de pagamento para automatização.

## 8. Cronograma e Roadmap

- MVP: 3–4 meses (desenvolvimento básico e integração com Bitwarden).
- Iteração pós-MVP: Ajustes e melhorias baseados em feedback.
- Funcionalidades futuras: Automatização via pagamento, funcionalidades avançadas de revenda.

## 9. Riscos e Desafios

- Desenvolvimento part-time, segurança e escalabilidade.
- Mitigação: uso de tecnologias consolidadas, monitoramento contínuo e priorização de funcionalidades essenciais.

## 10. Feedback e Iteração

- Coleta de feedback via canal interno no app e e-mail.
- Revisões periódicas para atualização e melhoria contínua.
