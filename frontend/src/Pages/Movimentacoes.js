import { useState } from "react";
import "../styles/Movimentacoes.css";

 function MovimentacoesPage() {
  const [tipo, setTipo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [item, setItem] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [mensagem, setMensagem] = useState("");
  const usuarioLogado = "Gabriel";

  const itensCelular = ["iPhone 12", "iPhone XR", "Moto G8"];
  const itensPecas = ["Tela A30", "Bateria Samsung", "Carcaça Xiaomi"];

  const enviarMovimentacao = (e) => {
    e.preventDefault();

    if (
      (tipo === "venda" || tipo === "conserto") &&
      quantidade > 5 // apenas para simulação
    ) {
      setMensagem("❌ Quantidade maior do que o estoque!");
      return;
    }

    setMensagem("✔ Movimentação registrada com sucesso!");

    const novaMovimentacao = {
      tipo,
      categoria,
      item,
      quantidade,
      dataHora: new Date().toLocaleString(),
      usuario: usuarioLogado,
    };

    const historico = JSON.parse(localStorage.getItem("historico")) ?? [];
    historico.push(novaMovimentacao);
    localStorage.setItem("historico", JSON.stringify(historico));
  };

  return (
    <div className="pagina-movimentacoes">
      <h1 className="titulo">Registrar Movimentação</h1>

      <form className="formulario-movimentacao" onSubmit={enviarMovimentacao}>
        <label>Tipo da Operação:</label>
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="campo-selecao">
          <option value="">Selecione</option>
          <option value="compra">Compra</option>
          <option value="venda">Venda</option>
          <option value="devolucao">Devolução</option>
          <option value="conserto">Conserto</option>
        </select>

        <label>Categoria:</label>
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="campo-selecao">
          <option value="">Selecione</option>
          <option value="celular">Celular</option>
          <option value="peca">Peça</option>
        </select>

        <label>Item:</label>
        <select value={item} onChange={(e) => setItem(e.target.value)} className="campo-selecao">
          <option value="">Selecione</option>
          {(categoria === "celular" ? itensCelular : itensPecas).map((i, idx) => (
            <option key={idx}>{i}</option>
          ))}
        </select>

        <label>Quantidade:</label>
        <input
          type="number"
          className="campo-numero"
          min="1"
          value={quantidade}
          onChange={(e) => setQuantidade(Number(e.target.value))}
        />

        <button className="botao-registrar">Registrar</button>
      </form>

      {mensagem && <p className="mensagem-retorno">{mensagem}</p>}
    </div>
  );
}
export default MovimentacoesPage;