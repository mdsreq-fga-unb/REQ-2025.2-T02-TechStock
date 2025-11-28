import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import '../styles/Login.css';
import { useAuth } from '../context/AuthContext';



function Login(){

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState('');
    const { login, isAuthenticated, authMessage, clearAuthMessage } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';

    useEffect(() => {
        if (authMessage) {
            setError(authMessage);
            setSuccess('');
            clearAuthMessage();
        }
    }, [authMessage, clearAuthMessage]);

    useEffect(() => {
        if (isAuthenticated) {
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, from, navigate]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        setSuccess('');
        setLoading(true);
        try {
            const user = await login({ email: username, senha: password });
            setSuccess(`Bem-vindo(a), ${user.nome}! Redirecionando...`);
        } catch (err) {
            setError(err.message || 'Erro ao autenticar');
        } finally {
            setLoading(false);
        }
    };

    return(
        <div className="container">
            <form className="FormularioLogin" onSubmit={handleSubmit}>
                <h1 className="Logo"> CellVex</h1>
                <div className="BotaoUseraname"> 
                    <h4>E-mail</h4>
                <input type="email" placeholder="seu@gmail.com" value={username} onChange={(e)=> setUsername(e.target.value)} required autoComplete="email" />
                </div>
                <div className="BotaoPassword"> <h4>Senha</h4><input type="password" placeholder="Senha"
                value={password} onChange={(e)=> setPassword(e.target.value)} required autoComplete="current-password" />
                </div>
                <button className="BotaoEntrarNoSistema" type="submit" disabled={loading}>
                    {loading ? 'Entrando...' : 'Entrar no Sistema'}
                </button>
                {error && <p className="MensagemErro">{error}</p>}
                {success && <p className="MensagemSucesso">{success}</p>}
                <div>
                    <label>
                        <input type="checkbox" className="Senha" />
                        Lembrar-me
                    </label>
                </div>
                
            </form>
        </div>
    )
}

export default Login;