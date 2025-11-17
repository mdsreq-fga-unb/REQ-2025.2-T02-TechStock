import { BrowserRouter, Routes, Route } from "react-router-dom";
import CadastroClientes from "./Pages/CadastroClientes";
import NovoCadastro from "./Pages/NovoCadastro";
import CadastroPecas from "./Pages/CadastroPecas";
import React from "react";
import NovoCadastroPecas from "./Pages/NovoCadastroPecas";
import CadastroCelulares from "./Pages/CadastroCelulares";
import NovoCadastroCelulares from "./Pages/NovoCadastroCelulares";
import Login from "./Pages/Login";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota para a lista de clientes (path foi mudado de /CadastroClientes para /clientes) */}
        <Route path="/" element={<CadastroClientes />} />
        
        {/*rota do novo cadastro deve ser "/clientes/novo" para corresponder à navegação */}
        <Route path="/clientes/novo" element={<NovoCadastro />} />
        <Route path="/pecas" element={<CadastroPecas />} />
        <Route path="/pecas/novo" element={<NovoCadastroPecas />} /> 
        <Route path="/celulares" element={<CadastroCelulares/>} />
        <Route path="/celulares/novo" element={<NovoCadastroCelulares/>} />
        <Route path="/login" element={<Login/>} />
        
        
      </Routes>
    </BrowserRouter>
  );
}