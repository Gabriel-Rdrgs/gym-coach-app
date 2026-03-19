# Como ver o que falhou na aba Network (para "unexpected response")

Siga estes passos no **Chrome** (ou Edge) no site da Vercel quando o erro aparecer:

---

## 1. Abrir as ferramentas

- Pressione **F12** (ou botão direito → "Inspecionar").
- Clique na aba **Network** (Rede).

---

## 2. Reproduzir o erro

- Deixe a aba **Network** aberta.
- Recarregue a página (**F5** ou Ctrl+R) ou acesse de novo a URL que quebra.
- Quando aparecer "An unexpected response...", não feche a página.

---

## 3. O que procurar na lista

Na lista de requisições (coluna "Name"):

- Procure por algo em **vermelho** (status 4xx ou 5xx).
- Procure por:
  - **`session`** ou **`auth`**
  - **Algo como `_rsc`** ou o nome da sua página (ex.: um request para a URL da página).

Clique em **uma** requisição que esteja em vermelho ou que pareça ligada a auth/session.

---

## 4. O que copiar e colar

Com a requisição selecionada:

1. **Headers (Cabeçalhos)**  
   - Aba **Headers**.  
   - Copie e cole para mim:
     - **Request URL** (URL completa).
     - **Status Code** (ex.: 500, 302, 404).

2. **Response (Resposta)**  
   - Aba **Response** (ou **Preview**).  
   - Copie as **primeiras 10–20 linhas** do que aparecer (HTML ou JSON), ou cole o texto inteiro se for curto.

Exemplo do que me enviar:

```
Request URL: https://seu-app.vercel.app/api/auth/session
Status Code: 500 Internal Server Error

Response:
<!DOCTYPE html>
<html>...
```

ou

```
Request URL: https://seu-app.vercel.app/
Status Code: 200

Response:
{"error":"..."}
```

---

## 5. Se não houver nada em vermelho

- Clique na **primeira** requisição da lista (geralmente o nome da sua página ou da URL).
- Me envie:
  - **Request URL**
  - **Status Code**
  - E o que aparecer na aba **Response** (início do conteúdo).

Com isso dá para ver se o problema é a API de sessão, a página principal ou outra rota.
