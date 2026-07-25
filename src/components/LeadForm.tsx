import React, { useState } from 'react';
import { LeadFormData } from '../types';
import { User, Phone, Mail, Building, Lock, Send, Loader2, Instagram, Globe } from 'lucide-react';

interface LeadFormProps {
  onSubmit: (data: LeadFormData) => void;
  isSubmitting: boolean;
}

export const LeadForm: React.FC<LeadFormProps> = ({ onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState<LeadFormData>({
    nome: '',
    whatsapp: '',
    email: '',
    empresa: '',
    instagram: '',
    site: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Phone mask helper
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    let formatted = value;
    if (value.length > 2) {
      formatted = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    }
    if (value.length > 7) {
      formatted = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    }

    setFormData((prev) => ({ ...prev, whatsapp: formatted }));
    if (errors.whatsapp) {
      setErrors((prev) => ({ ...prev, whatsapp: '' }));
    }
  };

  const handleChange = (field: keyof LeadFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!formData.nome.trim()) newErrors.nome = 'Informe seu nome completo';
    if (!formData.whatsapp.trim() || formData.whatsapp.replace(/\D/g, '').length < 10) {
      newErrors.whatsapp = 'Informe um WhatsApp válido com DDD';
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      newErrors.email = 'Informe um e-mail profissional válido';
    }
    if (!formData.empresa.trim()) newErrors.empresa = 'Informe o nome da sua empresa/projeto';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Visual background glows */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center sm:text-left space-y-2">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-semibold uppercase tracking-wider">
            Etapa Final
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Quase lá! Identifique-se para receber seu diagnóstico.
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Utilizamos esses dados para personalizar seu relatório e enviar as melhores estratégias de mercado para o seu perfil.
          </p>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Nome Completo */}
            <div className="space-y-1.5">
              <label htmlFor="nome" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Nome Completo
              </label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="nome"
                  type="text"
                  value={formData.nome}
                  onChange={(e) => handleChange('nome', e.target.value)}
                  placeholder="Como quer ser chamado?"
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 border rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all ${
                    errors.nome ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
              </div>
              {errors.nome && <p className="text-xs text-red-500">{errors.nome}</p>}
            </div>

            {/* WhatsApp */}
            <div className="space-y-1.5">
              <label htmlFor="whatsapp" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                WhatsApp
              </label>
              <div className="relative">
                <Phone className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="whatsapp"
                  type="tel"
                  value={formData.whatsapp}
                  onChange={handlePhoneChange}
                  placeholder="(00) 00000-0000"
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 border rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all ${
                    errors.whatsapp ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
              </div>
              {errors.whatsapp && <p className="text-xs text-red-500">{errors.whatsapp}</p>}
            </div>

            {/* Email Profissional */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                E-mail Profissional
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="nome@exemplo.com"
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 border rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all ${
                    errors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* Empresa / Projeto */}
            <div className="space-y-1.5">
              <label htmlFor="empresa" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Empresa / Projeto
              </label>
              <div className="relative">
                <Building className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="empresa"
                  type="text"
                  value={formData.empresa}
                  onChange={(e) => handleChange('empresa', e.target.value)}
                  placeholder="Nome do seu negócio"
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 border rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all ${
                    errors.empresa ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
              </div>
              {errors.empresa && <p className="text-xs text-red-500">{errors.empresa}</p>}
            </div>

            {/* Instagram (Opcional para análise) */}
            <div className="space-y-1.5">
              <label htmlFor="instagram" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Instagram da Empresa <span className="text-slate-400 font-normal">(Opcional)</span>
              </label>
              <div className="relative">
                <Instagram className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="instagram"
                  type="text"
                  value={formData.instagram || ''}
                  onChange={(e) => handleChange('instagram', e.target.value)}
                  placeholder="@suaempresa"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Site / Link (Opcional para análise) */}
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="site" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Site ou Link do Negócio <span className="text-slate-400 font-normal">(Opcional)</span>
              </label>
              <div className="relative">
                <Globe className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="site"
                  type="text"
                  value={formData.site || ''}
                  onChange={(e) => handleChange('site', e.target.value)}
                  placeholder="www.suaempresa.com.br ou linktree"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              Seus dados estão protegidos pela LGPD.
            </p>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-sm tracking-wide rounded-full shadow-lg shadow-blue-600/30 active:scale-98 transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-75"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>PROCESSANDO...</span>
                </>
              ) : (
                <>
                  <span>ENVIAR RESPOSTAS</span>
                  <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
