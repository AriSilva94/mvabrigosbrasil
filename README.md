# MVAbrigos Brasil

MVAbrigos Brasil é a primeira iniciativa de mapeamento e coleta de dados de abrigos de cães e gatos no Brasil. O site apresenta o banco de dados e o mapa nacional de abrigos, reúne materiais técnicos sobre medicina de abrigos e facilita o cadastro de abrigos, lares temporários e voluntários.

## O que já está no ar
- Landing page com chamada para cadastro de abrigos e voluntários.
- Mapa inicial de abrigos com contagem resumida por tipo.
- Biblioteca com publicações técnicas (detalhes por slug).
- Páginas institucionais e de dados estruturadas para expansão futura.

## Stack
- Next.js 16 (App Router) e React 19.
- Tailwind CSS 4 para estilos.
- Highcharts + highcharts-react para visualização de mapa.
- Lucide React para ícones.

## Como rodar localmente
Pré-requisito: Node 18+ (recomendado Node 20).

```bash
npm install
npm run dev
# depois acesse http://localhost:3000
```

Build e lint:

```bash
npm run build
npm run lint
```

## Estrutura rápida
- `src/app`: páginas públicas (home, biblioteca, institucional, dados, autenticacão).
- `src/components`: componentes da UI e seções da home.
- `src/data/libraryItems.ts`: conteúdo estático da biblioteca.
- `src/styles`, `src/constants`, `src/lib`, `src/hooks`, `src/store`: utilitários e base para futuras integrações.
