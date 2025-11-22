# BAR DO LAGO - Controle de Estoque (Frontend)

Pequeno sistema frontend (HTML/CSS/JS) para controle de estoque de bar, pronto para publicar no GitHub Pages.

## Como usar
1. Extraia os arquivos e suba o conteudo da pasta 'bar-do-lago' para o seu repositorio no GitHub.
2. No GitHub, ative GitHub Pages apontando para a branch main e root (/).
3. Acesse a pagina e use o app:
   - Adicione produtos em "Adicionar Produto".
   - Use "Registrar Entrada" para repor estoque.
   - Use "Registrar Venda" para tirar itens do estoque e gravar vendas.
   - Exporte e importe dados em JSON para backup/transferencia.

## Observacoes
- Os dados sao salvos no localStorage do navegador. Ao limpar o cache, os dados locais serao perdidos - use exportacao JSON para backup.
- Cores: tema escuro e botoes verdes. Para ajustar a cor do brasao substitua assets/crest-placeholder.svg pela sua imagem real (mesmo nome) ou altere --accent no styles.css.
- Se quiser integracao com servidor/banco de dados, posso adicionar backend em Node/Flask/SQLite.

## Estrutura
- index.html
- styles.css
- app.js
- assets/crest-placeholder.svg

Desenvolvido rapidamente com foco em usabilidade e deploy facil via GitHub Pages.
