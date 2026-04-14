import React, { useState, useEffect } from 'react';
import { 
  Gamepad2, 
  Library, 
  LayoutGrid, 
  Wallet, 
  Search, 
  Bell, 
  X, 
  ExternalLink,
  PlusCircle,
  TrendingUp,
  ChevronLeft,
  Maximize2,
  RefreshCw,
  MoreVertical,
  User
} from 'lucide-react';

const GAMES_DATABASE = [
  {
    id: 'pixels',
    title: 'Pixels',
    description: 'Um mundo aberto de agricultura e exploração construído na Ronin Network.',
    category: 'Social RPG',
    network: 'Ronin',
    thumbnail: 'https://api.dicebear.com/7.x/shapes/svg?seed=pixels&backgroundColor=fbbf24',
    cover: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=800&q=80',
    url: 'https://play.pixels.xyz/',
    players: '150k+'
  },
  {
    id: 'parallel',
    title: 'Parallel',
    description: 'Jogo de cartas colecionáveis de ficção científica competitivo.',
    category: 'TCG',
    network: 'Base',
    thumbnail: 'https://api.dicebear.com/7.x/shapes/svg?seed=parallel&backgroundColor=3b82f6',
    cover: 'https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=800&q=80',
    url: 'https://parallel.life/',
    players: '45k'
  },
  {
    id: 'ev-io',
    title: 'EV.IO',
    description: 'FPS tático em primeira pessoa baseado em navegador com recompensas.',
    category: 'FPS',
    network: 'Solana',
    thumbnail: 'https://api.dicebear.com/7.x/shapes/svg?seed=evio&backgroundColor=ef4444',
    cover: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80',
    url: 'https://ev.io/',
    players: '12k'
  }
];

const App = () => {
  const [activeTab, setActiveTab] = useState('store');
  const [library, setLibrary] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [currentGameUrl, setCurrentGameUrl] = useState(null);
  const [isLoadingGame, setIsLoadingGame] = useState(false);

  const addToLibrary = (game) => {
    if (!library.find(g => g.id === game.id)) {
      setLibrary([...library, game]);
    }
  };

  const launchGame = (game) => {
    setIsLoadingGame(true);
    setCurrentGameUrl(game.url);
    setSelectedGame(null); // Fecha o modal se estiver aberto
  };

  const closeGame = () => {
    setCurrentGameUrl(null);
    setIsLoadingGame(false);
  };

  // Se o jogo estiver aberto, renderizamos apenas o Game Runner
  if (currentGameUrl) {
    return (
      <div className="fixed inset-0 bg-black z-[200] flex flex-col overflow-hidden animate-in fade-in duration-300">
        {/* Barra de Ferramentas Superior (Estilo Telegram) */}
        <div className="h-14 bg-[#161a23] border-b border-white/10 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={closeGame}
              className="p-2 hover:bg-white/5 rounded-full text-gray-400 transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="flex flex-col">
              <span className="text-sm font-bold leading-tight">
                {GAMES_DATABASE.find(g => g.url === currentGameUrl)?.title}
              </span>
              <span className="text-[10px] text-gray-500 uppercase font-mono">
                Nexus Web3 Host
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-500 hover:text-white" title="Recarregar">
              <RefreshCw size={18} />
            </button>
            <button className="p-2 text-gray-500 hover:text-white" title="Tela Cheia">
              <Maximize2 size={18} />
            </button>
            <button className="p-2 text-gray-500 hover:text-white">
              <MoreVertical size={18} />
            </button>
            <button 
              onClick={closeGame}
              className="ml-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white p-2 rounded-lg transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Iframe do Jogo */}
        <div className="flex-1 relative bg-[#0b0e14]">
          {isLoadingGame && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0b0e14]">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-400 font-medium">Carregando ambiente seguro...</p>
            </div>
          )}
          <iframe 
            src={currentGameUrl}
            className="w-full h-full border-none"
            onLoad={() => setIsLoadingGame(false)}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; gamepad"
            sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-scripts allow-same-origin"
          ></iframe>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0e14] text-gray-100 font-sans">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-[#0f121a] border-r border-white/5 flex-col z-50">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg"><Gamepad2 size={24} /></div>
          <h1 className="text-xl font-bold">NEXUS</h1>
        </div>
        <nav className="flex-1 px-4 mt-6 space-y-2">
          <button onClick={() => setActiveTab('store')} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl ${activeTab === 'store' ? 'bg-blue-600/10 text-blue-400' : 'text-gray-400'}`}>
            <LayoutGrid size={22} /> Loja
          </button>
          <button onClick={() => setActiveTab('library')} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl ${activeTab === 'library' ? 'bg-blue-600/10 text-blue-400' : 'text-gray-400'}`}>
            <Library size={22} /> Biblioteca
          </button>
          <button onClick={() => setActiveTab('wallet')} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl ${activeTab === 'wallet' ? 'bg-blue-600/10 text-blue-400' : 'text-gray-400'}`}>
            <Wallet size={22} /> Carteira
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="md:pl-64 pb-24">
        <header className="sticky top-0 z-40 bg-[#0b0e14]/80 backdrop-blur-md border-b border-white/5 p-4 md:px-8 flex justify-between">
          <h2 className="text-lg font-bold md:hidden">NEXUS</h2>
          <div className="hidden sm:block relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 text-sm" placeholder="Buscar games..." />
          </div>
          <div className="flex gap-4"><Bell size={20} /><div className="w-8 h-8 rounded-full bg-blue-500"></div></div>
        </header>

        <div className="p-4 md:p-8">
          {activeTab === 'store' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
              {GAMES_DATABASE.map(game => (
                <div key={game.id} onClick={() => setSelectedGame(game)} className="bg-[#161a23] rounded-2xl overflow-hidden border border-white/5 cursor-pointer hover:border-blue-500/40 transition-all">
                  <div className="h-40 relative">
                    <img src={game.cover} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-[10px] font-bold">{game.network}</div>
                  </div>
                  <div className="p-4 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold">{game.title}</h4>
                      <p className="text-xs text-gray-500">{game.category}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); launchGame(game); }} className="p-2 bg-blue-600 rounded-lg">
                      <Gamepad2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'library' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Prontos para Jogar</h3>
              {library.length === 0 ? (
                <div className="p-8 text-center text-gray-500 bg-white/5 rounded-2xl border border-dashed border-white/10">Adicione jogos da loja primeiro.</div>
              ) : (
                library.map(game => (
                  <div key={game.id} className="flex items-center justify-between bg-[#161a23] p-4 rounded-xl">
                    <div className="flex items-center gap-4">
                      <img src={game.thumbnail} className="w-12 h-12 rounded-lg" />
                      <h4 className="font-bold">{game.title}</h4>
                    </div>
                    <button onClick={() => launchGame(game)} className="px-6 py-2 bg-blue-600 rounded-lg font-bold text-sm">JOGAR</button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>

      {/* Tab Bar Mobile */}
      <nav className="md:hidden fixed bottom-0 w-full h-16 bg-[#0f121a] border-t border-white/10 flex justify-around items-center z-50">
        <button onClick={() => setActiveTab('store')} className={activeTab === 'store' ? 'text-blue-500' : 'text-gray-500'}><LayoutGrid size={24} /></button>
        <button onClick={() => setActiveTab('library')} className={activeTab === 'library' ? 'text-blue-500' : 'text-gray-500'}><Library size={24} /></button>
        <button onClick={() => setActiveTab('wallet')} className={activeTab === 'wallet' ? 'text-blue-500' : 'text-gray-500'}><Wallet size={24} /></button>
      </nav>

      {/* Modal de Detalhes com Botão de Launch Interno */}
      {selectedGame && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-8 animate-in fade-in">
          <div className="absolute inset-0 bg-black/80" onClick={() => setSelectedGame(null)}></div>
          <div className="bg-[#1c222d] w-full max-w-2xl rounded-t-3xl md:rounded-3xl overflow-hidden relative border-t md:border border-white/10">
            <img src={selectedGame.cover} className="w-full h-48 object-cover" />
            <div className="p-6">
              <h3 className="text-2xl font-bold">{selectedGame.title}</h3>
              <p className="text-gray-400 text-sm mt-2">{selectedGame.description}</p>
              <div className="mt-8 flex gap-3">
                <button 
                  onClick={() => launchGame(selectedGame)} 
                  className="flex-1 bg-blue-600 py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  <Gamepad2 size={20} /> JOGAR AGORA (INTERNAL)
                </button>
                <button onClick={() => { addToLibrary(selectedGame); setSelectedGame(null); }} className="bg-white/5 px-6 rounded-xl border border-white/10">
                  <PlusCircle size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
