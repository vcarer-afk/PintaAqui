import React, { useState } from 'react';
import {
  Paintbrush,
  Sun,
  Moon,
  Database,
  Calculator,
  ShieldCheck,
  CheckCircle2,
  FolderTree,
  ExternalLink,
  Layers,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { calculateRoomArea, calculatePaintCans, estimateSupplies } from './utils/paintCalculations';
import { formatCurrency } from './utils/formatters';

function BaseOverview() {
  const { theme, toggleTheme } = useTheme();
  const { isConfigured, user } = useAuth();

  // Estado interativo do simulador matemático puro para validação do motor de cálculo
  const [length, setLength] = useState<number>(5);
  const [width, setWidth] = useState<number>(4);
  const [height, setHeight] = useState<number>(2.7);
  const [doors, setDoors] = useState<number>(1);
  const [windows, setWindows] = useState<number>(1);
  const [includeCeiling, setIncludeCeiling] = useState<boolean>(true);
  const [sqmRate, setSqmRate] = useState<number>(22);

  const roomCalc = calculateRoomArea({
    length,
    width,
    height,
    doorsCount: doors,
    windowsCount: windows,
    includeCeiling,
  });

  const paintCalc = calculatePaintCans(roomCalc.totalPaintArea, 2, 100, 10);
  const supplies = estimateSupplies(roomCalc.totalPaintArea);
  const estimatedLaborCost = roomCalc.totalPaintArea * sqmRate * roomCalc.heightMultiplier;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <Paintbrush className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg leading-tight tracking-tight text-slate-900 dark:text-white">
                  PintorPro
                </h1>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  Fase 1: Base Pronta
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sistema Profissional de Orçamentos e Gestão de Obras
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
              aria-label="Alternar tema"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Banner de Status da Infraestrutura */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  isConfigured
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                }`}
              >
                <Database className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                    Status da Conexão Supabase
                  </h2>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                      isConfigured
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isConfigured ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                    />
                    {isConfigured ? 'Conectado à Nuvem' : 'Aguardando Credenciais'}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                  {isConfigured
                    ? 'O cliente Supabase JS está inicializado e autenticado com a URL da nuvem. O banco de dados relacional e Row Level Security (RLS) estão ativos.'
                    : 'A biblioteca @supabase/supabase-js, o cliente singleton e a tipagem TypeScript estão prontos. Para conectar seu banco, insira sua URL e Chave Anon no arquivo .env.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                supabase/schema.sql incluído
              </span>
            </div>
          </div>
        </section>

        {/* Grade de 2 colunas: Arquitetura Implementada + Validador Matemático */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Coluna 1: Arquitetura Base & Estrutura de Pastas (7 cols) */}
          <section className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-5">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-base">
                <FolderTree className="w-5 h-5 text-amber-500" />
                <h3>Arquitetura Modular Base Criada</h3>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                A estrutura do projeto foi organizada seguindo os princípios de código limpo, separação de responsabilidades e tipagem estrita para PostgreSQL/Supabase:
              </p>

              <div className="bg-slate-900 text-slate-200 rounded-xl p-4 font-mono text-xs overflow-x-auto space-y-1.5 border border-slate-800 shadow-inner">
                <div className="text-amber-400 font-bold">/</div>
                <div className="text-slate-400">├── .env.example <span className="text-slate-500">(Variáveis Supabase documentadas)</span></div>
                <div className="text-slate-400">├── public/</div>
                <div className="text-slate-400">│   ├── favicon.svg <span className="text-slate-500">(Identidade visual PintorPro)</span></div>
                <div className="text-slate-400">│   └── manifest.json <span className="text-slate-500">(Configuração PWA instalável)</span></div>
                <div className="text-slate-400">├── supabase/</div>
                <div className="text-slate-400">│   └── schema.sql <span className="text-emerald-400 font-semibold">(Tabelas, RLS, Foreign Keys, Triggers)</span></div>
                <div className="text-slate-400">├── src/</div>
                <div className="text-slate-400">│   ├── lib/</div>
                <div className="text-slate-400">│   │   └── supabase.ts <span className="text-amber-400">(Cliente singleton Supabase + validador)</span></div>
                <div className="text-slate-400">│   ├── types/</div>
                <div className="text-slate-400">│   │   └── database.ts <span className="text-sky-400">(Tipagens TypeScript das 8 tabelas)</span></div>
                <div className="text-slate-400">│   ├── contexts/</div>
                <div className="text-slate-400">│   │   ├── AuthContext.tsx <span className="text-purple-400">(Supabase Auth por e-mail/senha)</span></div>
                <div className="text-slate-400">│   │   └── ThemeContext.tsx <span className="text-yellow-400">(Modo Escuro / Claro nativo)</span></div>
                <div className="text-slate-400">│   ├── utils/</div>
                <div className="text-slate-400">│   │   ├── formatters.ts <span className="text-slate-300">(Moeda BRL, telefones, documentos)</span></div>
                <div className="text-slate-400">│   │   └── paintCalculations.ts <span className="text-emerald-300">(Cálculo de m², tintas e insumos)</span></div>
                <div className="text-slate-400">│   ├── index.css <span className="text-slate-500">(Tailwind CSS v4 + estilos de impressão)</span></div>
                <div className="text-slate-400">│   └── App.tsx</div>
              </div>

              {/* RLS e Segurança */}
              <div className="rounded-xl p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Segurança e Row Level Security (RLS)</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  O script <code className="text-amber-600 dark:text-amber-400">supabase/schema.sql</code> já contém as diretivas de RLS para isolar clientes, orçamentos, insumos e tabelas de preços de cada pintor através do UUID do <code className="text-amber-600 dark:text-amber-400">auth.uid()</code>. Zero vazamento de dados entre profissionais.
                </p>
              </div>

              {/* Etapas do Projeto */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Próximos Passos (Aguardando Aprovação):
                </h4>
                <div className="space-y-2">
                  {[
                    { step: 1, title: 'Base Arquitetural & Conexão', done: true },
                    { step: 2, title: 'Telas de Autenticação & Perfil do Pintor (PIX, Diária, Logo)', done: false },
                    { step: 3, title: 'Gestão de Clientes e Obras (m², tipo de parede, fotos)', done: false },
                    { step: 4, title: 'Tabela de Mão de Obra e Multiplicador de Pé-Direito', done: false },
                    { step: 5, title: 'Calculadora de Tintas e Insumos (Quem compra: Cliente vs Pintor)', done: false },
                    { step: 6, title: 'Gerador de Proposta, Assinatura Digital & Compartilhamento WhatsApp', done: false },
                  ].map((item) => (
                    <div
                      key={item.step}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                        item.done
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300 font-medium'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {item.done ? (
                          <CheckCircle2 className="w-4 h-4 text-amber-500" />
                        ) : (
                          <span className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-[10px]">
                            {item.step}
                          </span>
                        )}
                        <span>{item.title}</span>
                      </div>
                      <span className="text-[10px] font-semibold">
                        {item.done ? 'Pronto' : 'Pendente'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Coluna 2: Demonstração Interativa do Motor Matemático Puro (5 cols) */}
          <section className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-base">
                  <Calculator className="w-5 h-5 text-amber-500" />
                  <h3>Validador de Cálculos</h3>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                  100% Algorítmico
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Teste as fórmulas de área, descontos de portas/janelas e rendimento de tintas criadas no módulo <code className="text-amber-500">paintCalculations.ts</code>:
              </p>

              {/* Controles do Simulador */}
              <div className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                      Comprimento (m)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      value={length}
                      onChange={(e) => setLength(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                      Largura (m)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      value={width}
                      onChange={(e) => setWidth(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                      Pé Direito (m)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="2.2"
                      value={height}
                      onChange={(e) => setHeight(Math.max(2, Number(e.target.value)))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                      Preço Mão de Obra (R$/m²)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="10"
                      value={sqmRate}
                      onChange={(e) => setSqmRate(Math.max(0, Number(e.target.value)))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                      Portas (desc. ~1.7m²)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={doors}
                      onChange={(e) => setDoors(Math.max(0, Number(e.target.value)))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                      Janelas (desc. ~2.0m²)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={windows}
                      onChange={(e) => setWindows(Math.max(0, Number(e.target.value)))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={includeCeiling}
                    onChange={(e) => setIncludeCeiling(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-slate-300"
                  />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    Incluir teto na pintura (+{length * width} m²)
                  </span>
                </label>
              </div>

              {/* Resultados Calculados */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400">Área Líquida Total:</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {roomCalc.totalPaintArea} m²
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">
                    Latas 18L (2 demãos + 10% margem):
                  </span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">
                    {paintCalc.cansNeeded} lata(s) ({paintCalc.exactCans} exato)
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Insumos Recomendados:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {supplies.sandpaperSheets} lixas • {supplies.maskingTapeRolls50m} fita(s) 50m
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Multiplicador Altura:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {roomCalc.heightMultiplier > 1 ? `${roomCalc.heightMultiplier}x (Pé-direito alto)` : '1.0x (Padrão)'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Prazo Estimado:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    ~{roomCalc.suggestedDays} dia(s) úteis
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Mão de Obra Estimada:
                  </span>
                  <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(estimatedLaborCost)}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BaseOverview />
      </AuthProvider>
    </ThemeProvider>
  );
}
