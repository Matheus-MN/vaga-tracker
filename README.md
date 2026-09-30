# 🧭 Vaga Tracker

Um rastreador pessoal de candidaturas de estágio/emprego, em formato kanban (Enviado → Em processo → Entrevista → Aprovado/Rejeitado). Criei esse projeto porque é exatamente o problema que eu tinha: várias candidaturas abertas ao mesmo tempo, cada uma em uma etapa diferente, e nenhuma forma centralizada de acompanhar isso.

**Demo publicada:** _[preencher com a URL do Render depois do deploy]_
**Repositório:** _[preencher com a URL do GitHub]_

## Como foi construído

Este projeto foi desenvolvido com apoio de um agente de IA (Claude), seguindo um fluxo de trabalho de especificação → geração → revisão:

1. **Especificação:** defini o problema (organizar candidaturas de estágio que eu mesmo estava enviando), o modelo de dados necessário (empresa, cargo, status, modalidade, localização, prazo, link, notas) e o formato de interface (kanban por status, já que é como eu naturalmente penso sobre o processo de candidatura).
2. **Geração assistida:** o agente gerou o backend (FastAPI + SQLAlchemy + SQLite) e o frontend (HTML/CSS/JS puro, sem framework) a partir dessa especificação, incluindo a API REST completa (CRUD de candidaturas + endpoint de estatísticas).
3. **Revisão e testes:** validei os endpoints manualmente (criação, listagem, atualização de status via drag-and-drop, exclusão) e revisei o código gerado antes de publicar — inclusive testando a instalação das dependências em um ambiente limpo, simulando o ambiente de produção no Render.
4. **Deploy:** publicação no Render a partir do repositório público no GitHub.

## Stack técnica

- **Backend:** Python, FastAPI, SQLAlchemy, SQLite
- **Frontend:** HTML, CSS e JavaScript puro (sem build step — servido diretamente pelo FastAPI)
- **Deploy:** Render (free tier)

## Funcionalidades

- Quadro kanban com 5 colunas de status (Enviado, Em processo, Entrevista, Aprovado, Rejeitado)
- Criar, editar e excluir candidaturas
- Mover candidaturas entre status por drag-and-drop
- Painel de estatísticas (total e contagem por status)
- Campos de modalidade, localização, prazo de inscrição, link da vaga e notas

## Rodando localmente

```bash
# clonar o repositório
git clone https://github.com/<seu-usuario>/vaga-tracker.git
cd vaga-tracker

# criar ambiente virtual e instalar dependências
python3 -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt

# rodar o servidor
uvicorn app.main:app --reload
```

Acesse `http://localhost:8000` no navegador.

## Estrutura do projeto

```
vaga-tracker/
├── app/
│   ├── main.py        # rotas da API e servidor de arquivos estáticos
│   ├── models.py       # modelos SQLAlchemy
│   ├── schemas.py       # schemas Pydantic
│   └── database.py      # configuração do banco (SQLite)
├── static/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── requirements.txt
├── render.yaml           # configuração de deploy no Render
└── README.md
```

## Próximos passos

- Autenticação (hoje é um projeto de uso pessoal, sem login)
- Exportação dos dados em CSV
- Lembretes automáticos de prazo de inscrição próximo do vencimento

## Licença

MIT
