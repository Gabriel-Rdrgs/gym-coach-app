# Plano de Melhorias - Aba de Progresso

## 📊 Objetivo
Transformar a aba de progresso em uma ferramenta completa e intuitiva para acompanhamento de evolução física e de treino, com métricas mais relevantes e visualizações mais úteis.

---

## 🎯 Melhorias Propostas

### 1. **Expansão de Métricas Corporais** 📏

#### 1.1 Adicionar Novos Campos ao Schema
- **Circunferência de Braço** (`armCircumference`)
- **Circunferência de Coxa** (`thighCircumference`)
- **Circunferência de Peito** (`chestCircumference`)
- **Percentual de Gordura Corporal** (`bodyFatPercentage`) - opcional
- **IMC** (`bmi`) - calculado automaticamente

#### 1.2 Atualizar Interface de Métricas
- Adicionar campos na página `/metrics` para registrar as novas medidas
- Validação de valores (ex: circunferências em cm, percentual de gordura em %)

#### 1.3 Visualizações
- **Gráfico de Evolução Corporal**: Linha temporal com todas as medidas
- **Cards de Estatísticas**: Mostrar última medida e variação desde o início
- **Comparação Visual**: Gráfico de barras comparando medidas iniciais vs atuais

---

### 2. **Sistema de Séries Válidas Baseado em RIR** 🎯

#### 2.1 Lógica de Classificação
```
RIR > 3:     Série de Aquecimento    → 0 séries válidas
RIR 2-3:     Série de Ajuste         → 0.5 séries válidas
RIR < 2:     Série Válida            → 1 série válida
RIR null:    Considerar como válida  → 1 série válida (para compatibilidade)
```

#### 2.2 Cálculo no Backend
- Criar função `calculateValidSets(workout)` que:
  - Itera sobre todos os sets do treino
  - Classifica cada set baseado no RIR
  - Retorna total de séries válidas por exercício e por grupo muscular

#### 2.3 Métricas de Volume
- **Volume de Séries Válidas**: Total de séries válidas por treino
- **Volume por Grupo Muscular**: Séries válidas separadas por grupo
- **Tendência de Volume**: Evolução do volume de séries válidas ao longo do tempo

#### 2.4 Substituir Volume Atual
- Remover ou complementar o cálculo atual de volume (peso × reps)
- Adicionar gráfico de "Séries Válidas" como métrica principal
- Manter volume tradicional como métrica secundária (opcional)

---

### 3. **Progresso Separado por Grupo Muscular** 💪

#### 3.1 Estrutura de Dados
- Agrupar todos os dados de progresso por `muscleGroup`
- Criar visualizações específicas para cada grupo

#### 3.2 Visualizações por Grupo
- **Aba/Seção por Grupo**: Tabs ou seções para cada grupo muscular
- **Gráfico de Evolução**: Séries válidas ao longo do tempo por grupo
- **Frequência de Treino**: Quantas vezes cada grupo foi treinado
- **Volume por Grupo**: Total de séries válidas por grupo

#### 3.3 Grupos Musculares Principais
- Peito
- Costas
- Ombros
- Bíceps
- Tríceps
- Pernas
- Glúteos
- Core/Abdômen

---

### 4. **Sistema de Filtragem e Períodos** 🔍

#### 4.1 Filtros de Período
- **Últimos 7 dias**
- **Últimos 30 dias**
- **Últimos 3 meses**
- **Últimos 6 meses**
- **Último ano**
- **Período customizado** (date picker)

#### 4.2 Filtros de Métricas
- **Tipo de Métrica**: Peso, Circunferências, Sono, Energia, etc.
- **Grupo Muscular**: Filtrar visualizações por grupo específico
- **Tipo de Treino**: Filtrar por template de treino

#### 4.3 Interface de Filtros
- **Barra de Filtros Superior**: Dropdowns e seletores
- **Aplicar Filtros**: Botão para aplicar múltiplos filtros
- **Reset**: Botão para limpar todos os filtros
- **Salvar Filtros**: Opção para salvar configurações favoritas

---

### 5. **Reestruturação da Interface** 🎨

#### 5.1 Layout em Abas/Seções
```
┌─────────────────────────────────────┐
│  [Métricas Corporais] [Treino] [PRs]│
└─────────────────────────────────────┘
```

#### 5.2 Dashboard Resumo
- Cards com principais métricas
- Indicadores de tendência (↑↓)
- Comparação com período anterior

#### 5.3 Visualizações Interativas
- **Gráficos Interativos**: Hover para detalhes
- **Zoom e Pan**: Para análise detalhada
- **Exportar Dados**: Botão para exportar gráficos/dados

---

## 📋 Implementação - Ordem de Prioridade

### Fase 1: Fundação (Essencial)
1. ✅ Adicionar campos de métricas corporais ao schema
2. ✅ Implementar cálculo de séries válidas baseado em RIR
3. ✅ Atualizar API de progresso com novos cálculos
4. ✅ Atualizar interface de métricas para novos campos

### Fase 2: Visualizações (Importante)
5. ✅ Criar gráficos de séries válidas por grupo muscular
6. ✅ Adicionar gráficos de evolução corporal
7. ✅ Implementar separação de progresso por grupo muscular
8. ✅ Reestruturar layout da página de progresso

### Fase 3: Filtros e UX (Melhorias)
9. ✅ Implementar sistema de filtros
10. ✅ Adicionar períodos pré-definidos
11. ✅ Melhorar interatividade dos gráficos
12. ✅ Adicionar exportação de dados

---

## 🔧 Detalhes Técnicos

### Schema de Métricas (Prisma)
```prisma
model Metric {
  id                  Int      @id @default(autoincrement())
  date                DateTime @default(now())
  weight              Float?
  waist               Float?
  armCircumference    Float?   // Nova
  thighCircumference  Float?   // Nova
  chestCircumference  Float?   // Nova
  bodyFatPercentage   Float?   // Nova
  sleep               Float?
  energy              Int?
  stress              Int?
  notes               String?
}
```

### Função de Cálculo de Séries Válidas
```typescript
function calculateValidSets(workout: Workout): {
  totalValidSets: number;
  byMuscleGroup: { [muscleGroup: string]: number };
  byExercise: { [exerciseName: string]: number };
} {
  // Lógica de classificação RIR
  // Agregação por grupo muscular
  // Retorno estruturado
}
```

### Estrutura de Dados da API
```typescript
interface ProgressData {
  metrics: Metric[];
  validSetsByWorkout: Array<{
    date: string;
    totalValidSets: number;
    byMuscleGroup: { [key: string]: number };
  }>;
  validSetsEvolution: Array<{
    date: string;
    muscleGroup: string;
    validSets: number;
  }>;
  // ... outros dados
}
```

---

## 📈 Métricas de Sucesso

- ✅ Usuário consegue ver evolução clara de todas as medidas corporais
- ✅ Séries válidas refletem melhor o progresso real de treino
- ✅ Progresso por grupo muscular permite identificar desequilíbrios
- ✅ Filtros permitem análise focada em períodos específicos
- ✅ Interface mais intuitiva e organizada

---

## 🚀 Próximos Passos

1. Revisar e aprovar o plano
2. Implementar Fase 1 (Fundação)
3. Testar cálculos e visualizações
4. Implementar Fase 2 (Visualizações)
5. Implementar Fase 3 (Filtros e UX)
6. Testes finais e ajustes

---

## 💡 Sugestões Adicionais (Futuro)

- **Comparação com Objetivos**: Definir metas e comparar progresso
- **Análise de Correlação**: Correlacionar métricas (ex: sono vs performance)
- **Alertas e Notificações**: Alertar sobre tendências negativas
- **Relatórios Semanais/Mensais**: Geração automática de relatórios
- **Integração com Wearables**: Importar dados de smartwatches

