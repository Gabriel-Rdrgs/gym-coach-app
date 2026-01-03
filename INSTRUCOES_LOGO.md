# 📸 Instruções para Adicionar a Logo

## ✅ O que já está pronto

- ✅ Header configurado para exibir a logo
- ✅ Favicon configurado no layout
- ✅ Script para gerar favicons automaticamente

## Passo 1: Adicionar a Logo Principal

1. **Salve sua imagem da logo**
2. **Renomeie para `logo.png`**
3. **Coloque em `/public/logo.png`**
4. **Otimize a imagem** (recomendado):
   - Use [TinyPNG](https://tinypng.com/) ou [Squoosh](https://squoosh.app/)
   - Tamanho recomendado: 200-300px de largura
   - Formato: PNG com fundo transparente (melhor para tema escuro)

## Passo 2: Gerar Favicons Automaticamente

### Opção A: Usando o Script (Recomendado)

1. **Instale a dependência**:
   ```bash
   npm install sharp --save-dev
   ```

2. **Execute o script**:
   ```bash
   node scripts/generate-favicons.js
   ```

3. **Pronto!** Os favicons serão gerados automaticamente em `/public/`

### Opção B: Usando Ferramenta Online

1. Use [Favicon Generator](https://realfavicongenerator.net/) ou [Favicon.io](https://favicon.io/)
2. Faça upload da sua `logo.png`
3. Baixe os arquivos gerados
4. Coloque em `/public/`:
   - `favicon.ico`
   - `favicon-16x16.png`
   - `favicon-32x32.png`
   - `apple-touch-icon.png`

## Passo 3: Verificar

Após adicionar os arquivos:
1. Reinicie o servidor de desenvolvimento (`npm run dev`)
2. A logo deve aparecer no header ao lado de "GYM COACH"
3. O favicon deve aparecer na aba do navegador

## Tamanhos dos Favicons Gerados

- `favicon-16x16.png` - 16x16px
- `favicon-32x32.png` - 32x32px
- `apple-touch-icon.png` - 180x180px (para iOS)
- `favicon.ico` - 32x32px (formato ICO)

## Notas

- Se a logo não aparecer, verifique se o arquivo está em `/public/logo.png`
- O header tem um fallback: se a logo não existir, apenas o texto "GYM COACH" será exibido
- A logo no header tem um efeito de glow (brilho) que combina com o tema neon

