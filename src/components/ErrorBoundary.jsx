import React from 'react';
import Icon from './Icon.jsx';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturou uma exceção:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 rounded-3xl bg-[#0D1930] border border-rose-900/60 text-slate-200 space-y-4 shadow-2xl">
          <div className="flex items-center gap-3 text-rose-400">
            <span className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-800">
              <Icon name="alert-triangle" size={22} />
            </span>
            <div>
              <h3 className="text-base font-bold text-white">
                {this.props.fallbackTitle || 'Ocorreu um erro ao carregar esta seção'}
              </h3>
              <p className="text-xs text-rose-300 mt-0.5">
                {this.state.error?.message || 'Erro inesperado na renderização dos dados.'}
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            O Farol isolou esta falha para que você possa continuar utilizando as outras funcionalidades normalmente.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={this.handleRetry}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-2"
            >
              <Icon name="rotate-cw" size={14} />
              <span>Tentar recarregar seção</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
