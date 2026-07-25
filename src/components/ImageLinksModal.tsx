import React, { useState, useEffect } from 'react';
import { X, Copy, Check, ExternalLink, Image as ImageIcon, Link as LinkIcon, Code } from 'lucide-react';

interface ImageItem {
  id: string;
  name: string;
  directUrl: string;
  relativeUrl: string;
  htmlTag: string;
  description: string;
}

interface ImageLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImageLinksModal: React.FC<ImageLinksModalProps> = ({ isOpen, onClose }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [customUrl, setCustomUrl] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;

    const host = window.location.origin;

    const defaultImages: ImageItem[] = [
      {
        id: 'tche_logo',
        name: 'Logotipo Oficial (Tchê Tech Insights)',
        directUrl: `${host}/src/assets/images/tche_logo_1784945402070.jpg`,
        relativeUrl: '/src/assets/images/tche_logo_1784945402070.jpg',
        htmlTag: `<img src="${host}/src/assets/images/tche_logo_1784945402070.jpg" alt="Logo Tchê Tech" referrerPolicy="no-referrer" />`,
        description: 'Logotipo 3D metálico oficial em alta resolução',
      },
      {
        id: 'office_workspace',
        name: 'Banner de Fundo Workspace (Market Insights)',
        directUrl: `${host}/src/assets/images/office_workspace_1784945414869.jpg`,
        relativeUrl: '/src/assets/images/office_workspace_1784945414869.jpg',
        htmlTag: `<img src="${host}/src/assets/images/office_workspace_1784945414869.jpg" alt="Office Workspace" referrerPolicy="no-referrer" />`,
        description: 'Ambiente tecnológico de análise e gráficos de mercado',
      },
      {
        id: 'picsum_sample',
        name: 'Imagem Exemplo CDN / Web Direct Link',
        directUrl: 'https://picsum.photos/seed/marketinsights/800/600',
        relativeUrl: 'https://picsum.photos/seed/marketinsights/800/600',
        htmlTag: `<img src="https://picsum.photos/seed/marketinsights/800/600" alt="Market Sample" referrerPolicy="no-referrer" />`,
        description: 'Link direto externo em alta definição para testes em HTML',
      }
    ];

    setImages(defaultImages);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;

    const newImg: ImageItem = {
      id: `custom_${Date.now()}`,
      name: `Imagem Customizada #${images.length + 1}`,
      directUrl: customUrl.trim(),
      relativeUrl: customUrl.trim(),
      htmlTag: `<img src="${customUrl.trim()}" alt="Custom Image" referrerPolicy="no-referrer" />`,
      description: 'Link direto fornecido pelo usuário',
    };

    setImages((prev) => [newImg, ...prev]);
    setCustomUrl('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 dark:bg-blue-950/80 rounded-lg text-blue-600 dark:text-blue-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-slate-100 text-lg leading-tight">
                Hub de Links Diretos das Imagens
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Copie URLs diretas e tags HTML para embed imediato
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors hover:bg-slate-200/50 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-grow">
          {/* Information Notice */}
          <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded-xl p-4 text-xs text-blue-900 dark:text-blue-200 space-y-1">
            <p className="font-semibold flex items-center gap-1.5">
              <LinkIcon className="w-4 h-4 text-blue-600" />
              Sim! Todas as imagens possuem links diretos e acessíveis.
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              Você pode usar qualquer um dos links abaixo diretamente em seu código HTML, tags <code className="bg-blue-100 dark:bg-blue-900/60 px-1 py-0.5 rounded text-blue-800 dark:text-blue-300">&lt;img src="..." /&gt;</code> ou sistemas externos.
            </p>
          </div>

          {/* Add Custom Direct URL Form */}
          <form onSubmit={handleAddCustomUrl} className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Testar ou Adicionar Novo Link Direto de Imagem:
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://exemplo.com/imagem.png"
                className="flex-grow px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors shrink-0"
              >
                Adicionar
              </button>
            </div>
          </form>

          {/* Image Cards List */}
          <div className="space-y-4">
            {images.map((img) => (
              <div
                key={img.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-xs space-y-3"
              >
                <div className="flex items-start gap-4">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100 dark:bg-slate-800">
                    <img
                      src={img.directUrl}
                      alt={img.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info & Links */}
                  <div className="flex-grow space-y-1.5 min-w-0">
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                      {img.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {img.description}
                    </p>

                    {/* Direct URL input read-only */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <input
                        type="text"
                        readOnly
                        value={img.directUrl}
                        className="flex-grow px-2.5 py-1 text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700 focus:outline-none truncate"
                      />

                      <button
                        onClick={() => handleCopy(img.directUrl, `${img.id}_url`)}
                        className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 hover:bg-blue-100 font-medium text-[11px] rounded border border-blue-200 dark:border-blue-900 transition-all flex items-center gap-1 shrink-0"
                        title="Copiar Link Direto"
                      >
                        {copiedId === `${img.id}_url` ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600 font-bold">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Link</span>
                          </>
                        )}
                      </button>

                      <a
                        href={img.directUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-slate-500 hover:text-blue-600 transition-colors"
                        title="Abrir Imagem em Nova Aba"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    {/* HTML Code Snippet */}
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        readOnly
                        value={img.htmlTag}
                        className="flex-grow px-2.5 py-1 text-[10px] font-mono bg-slate-900 text-emerald-400 rounded border border-slate-800 focus:outline-none truncate"
                      />
                      <button
                        onClick={() => handleCopy(img.htmlTag, `${img.id}_html`)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-medium rounded border border-slate-700 transition-all flex items-center gap-1 shrink-0"
                        title="Copiar Tag HTML <img />"
                      >
                        {copiedId === `${img.id}_html` ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Code className="w-3 h-3 text-slate-400" />
                        )}
                        <span>HTML</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-xl transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
