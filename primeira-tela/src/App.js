import { BrowserRouter, Routes, Route } from "react-router-dom";
import CadastroClientes from "./components/CadastroClientes";
import NovoCadastro from "./components/NovoCadastro";
import React from "react";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota para a lista de clientes (path foi mudado de /CadastroClientes para /clientes) */}
        <Route path="/" element={<CadastroClientes />} />
        
        {/* ✅ NOVO: A rota do novo cadastro deve ser "/clientes/novo" para corresponder à navegação */}
        <Route path="/clientes/novo" element={<NovoCadastro />} /> 
        
        {/* A rota /NovoCadastro (antiga) não é mais necessária */}
      </Routes>
    </BrowserRouter>
  );
}