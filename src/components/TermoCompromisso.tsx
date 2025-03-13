import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TermoCompromisso.css';

const TermoCompromisso = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    sobrenome: '',
    equipamento: '',
    equipe: '',
    numeroSerie: '',
    data: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você pode implementar a lógica real de geração da URL
    const urlId = 'asdj-asdko'; // Este ID seria gerado pelo seu backend
    navigate(`/url/${urlId}`);
  };

  return (
    <div className="termo-container">
      <img src="/images/logo.png" alt="Logo" className="logo" />

      <div className="termo-form">
        <h2 className="termo-title">Termo de Compromisso</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nome">Nome</label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="sobrenome">Sobrenome</label>
              <input
                type="text"
                id="sobrenome"
                name="sobrenome"
                value={formData.sobrenome}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="equipamento">Equipamento</label>
            <input
              type="text"
              id="equipamento"
              name="equipamento"
              value={formData.equipamento}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="equipe">Equipe</label>
            <input
              type="text"
              id="equipe"
              name="equipe"
              value={formData.equipe}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="numeroSerie">Nº Série</label>
            <input
              type="text"
              id="numeroSerie"
              name="numeroSerie"
              value={formData.numeroSerie}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="data">Data</label>
            <input
              type="date"
              id="data"
              name="data"
              value={formData.data}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="submit-button">
            Gerar URL
          </button>
        </form>
      </div>

      <p className="copyright">© Desenvolvido por Villela Tech</p>
    </div>
  );
};

export default TermoCompromisso; 