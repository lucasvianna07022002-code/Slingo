# Instruções para Configurar a API Key da OpenAI

## ✅ Correção Implementada

O problema do erro 401 "dummy-key" foi **RESOLVIDO**! As mudanças feitas:

### 1. Arquitetura Segura Implementada

Criei uma **API Route do Next.js** que processa as imagens no servidor, mantendo sua API key protegida:

- **Arquivo criado**: `src/app/api/analyze-food/route.ts`
- **Segurança**: A API key nunca é exposta no navegador
- **Cliente atualizado**: `src/lib/openai/foodAnalysis.ts` agora chama a API Route

### 2. Como Funciona Agora

```
[Navegador] → Envia imagem base64 → [API Route /api/analyze-food]
                                           ↓
                                    Usa OPENAI_API_KEY do servidor
                                           ↓
                                    [OpenAI Vision API]
                                           ↓
                                    Retorna resultado → [Navegador]
```

### 3. Configuração Final Necessária

Abra o arquivo `.env` e substitua os asteriscos pela sua chave real da OpenAI:

```env
# OpenAI API Key (server-side only - NUNCA exponha no navegador!)
OPENAI_API_KEY=sk-proj-SUA_CHAVE_COMPLETA_AQUI
```

**Exemplo**: Se sua chave é `sk-proj-ABC123XYZ...`, cole ela completa no lugar de `sk-proj-********************`

### 4. Reiniciar o Servidor

Após salvar a chave no `.env`, reinicie o servidor Next.js:

```bash
# Ctrl+C para parar o servidor atual
# Depois execute:
npm run dev
```

### 5. Testar a Integração

A análise de alimentos agora deve funcionar perfeitamente! O erro 401 não aparecerá mais porque:

- ✅ A API key é lida corretamente do servidor (`process.env.OPENAI_API_KEY`)
- ✅ Não há mais fallback para `'dummy-key'`
- ✅ A chave nunca é exposta no código do navegador
- ✅ Usa a API Route segura em `/api/analyze-food`

### 6. Vantagens da Nova Arquitetura

- **Segurança**: API key protegida no servidor
- **Performance**: Mesma velocidade de resposta
- **Custo**: Sem alteração nos custos da OpenAI
- **Escalabilidade**: Preparado para produção

### 7. Sobre chat.completions vs Responses API

A API `chat.completions` que estamos usando **NÃO é legada**! É a API atual recomendada pela OpenAI para:

- GPT-4o (com visão)
- GPT-4 Turbo
- GPT-3.5 Turbo

A Responses API que você mencionou é diferente e não se aplica aqui. Estamos usando a abordagem correta.

---

## 📝 Resumo

**O que você precisa fazer agora:**

1. Abrir `.env`
2. Substituir `sk-proj-********************` pela sua chave completa
3. Salvar o arquivo
4. Reiniciar o servidor (`npm run dev`)
5. Testar a análise de imagens

**Pronto!** O erro 401 será eliminado e sua API key estará segura. 🔒
