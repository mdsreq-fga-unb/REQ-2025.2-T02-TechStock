import React from "react";
import '../styles/Login.css';
import {useState} from 'react';



function Login(){

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit =(event) => {
        event.preventDefault();
        console.log("teste", username, password); 
    };

    return(
        <div className="container">
            <form className="FormularioLogin" onSubmit={handleSubmit}>
                <h1 className="Logo"> CellVex</h1>
                <div className="BotaoUseraname"> 
                    <h4>E-mail</h4>
                <input type="email" placeholder="seu@gmail.com" onChange={(e)=> setUsername(e.target.value)} />
                </div>
                <div className="BotaoPassword"> <h4>Senha</h4><input type="password" placeholder="Senha"
                onChange={(e)=> setPassword(e.target.value)} />
                </div>
                <button className="BotaoEntrarNoSistema" type="submit">Entrar no Sistema</button>
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