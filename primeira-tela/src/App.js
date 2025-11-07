import { BrowserRouter, Routes, Route } from "react-router-dom";
import CadastroClientes from "./components/CadastroClientes";
import NovoCadastro from "./components/NovoCadastro";
import CadastroPecas from "./components/CadastroPecas";
import React from "react";
import NovoCadastroPecas from "./components/NovoCadastroPecas";

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
        
        
        {/* rota /NovoCadastro (antiga) não é mais necessária */}
      </Routes>
    </BrowserRouter>
  );
}