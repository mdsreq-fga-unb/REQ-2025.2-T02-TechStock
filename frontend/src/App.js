import { BrowserRouter, Routes, Route } from "react-router-dom";
import CadastroClientes from "./Pages/CadastroClientes";
import NovoCadastro from "./Pages/NovoCadastro";
import CadastroPecas from "./Pages/CadastroPecas";
import React from "react";
import NovoCadastroPecas from "./Pages/NovoCadastroPecas";
import CadastroCelulares from "./Pages/CadastroCelulares";
import NovoCadastroCelulares from "./Pages/NovoCadastroCelulares";
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboards";
import OrdemDeServico from "./Pages/OrdemDeServico";
import NovoOS from "./Pages/NovoOrdemDeServico";
import { AuthProvider } from "./context/AuthContext";
import RequireAuth from "./components/RequireAuth";
import Vendas from "./Pages/Vendas"
import TestesOrdemServico from "./Pages/TestesOrdemServico";
import HistoricoCelular from "./Pages/HistoricoCelular";
import HistoricoClientes from "./Pages/HistoricoCliente";;
import NovoVendas from "./Pages/NovoVendas";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={(
              <RequireAuth>
                <CadastroClientes />
              </RequireAuth>
            )}
          />
          <Route
            path="/dashboards"
            element={(
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            )}
          />
          <Route
            path="/clientes/novo"
            element={(
              <RequireAuth>
                <NovoCadastro />
              </RequireAuth>
            )}
          />
          <Route
            path="/pecas"
            element={(
              <RequireAuth>
                <CadastroPecas />
              </RequireAuth>
            )}
          />
          <Route
            path="/pecas/novo"
            element={(
              <RequireAuth>
                <NovoCadastroPecas />
              </RequireAuth>
            )}
          />
          <Route
            path="/celulares"
            element={(
              <RequireAuth>
                <CadastroCelulares />
              </RequireAuth>
            )}
          />
          <Route
            path="/celulares/novo"
            element={(
              <RequireAuth>
                <NovoCadastroCelulares />
              </RequireAuth>
            )}
          />
          <Route
            path="/ordemdeservico"
            element={(
              <RequireAuth>
                <OrdemDeServico />
              </RequireAuth>
            )}
          />
          <Route
            path="/novaOS"
            element={(
              <RequireAuth>
                <NovoOS />
              </RequireAuth>
            )}
          />
          <Route
            path="/vendas"
            element={(
              <RequireAuth>
                <Vendas />
              </RequireAuth>
            )}
          />
          <Route
            path="/vendas/novo"
            element={(
              <RequireAuth>
                <NovoVendas />
              </RequireAuth>
            )}
          />
          <Route
            path="/testesordemservico"
            element={(
              <RequireAuth>
                <TestesOrdemServico />
              </RequireAuth>
            )}
          />
          <Route
            path="/historicocelular"
            element={(
              <RequireAuth>
                <HistoricoCelular />
              </RequireAuth>
            )}
          />
          <Route
            path="/historicocliente"
            element={(
              <RequireAuth>
                <HistoricoClientes />
              </RequireAuth>
            )}
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}