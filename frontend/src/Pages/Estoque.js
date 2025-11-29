import { useEffect, useState } from "react";

function EstoquePage() {
  const [estoque, setEstoque] = useState([]);

  useEffect(() => {
    setEstoque([
      { item: "iPhone 12", categoria: "celular", quantidade: 10, status: "em estoque" },
      { item: "Tela A30", categoria: "peca", quantidade: 4, status: "em estoque" },
      { item: "Moto G8", categoria: "celular", quantidade: 0, status: "vendido" },
    ]);
  }, []);

  return (
    <div className="pagina-estoque">
      <h1 className="titulo">Estoque Atual</h1>

      <table className="tabela-estoque">
        <thead>
          <tr>
            <th>Item</th>
            <th>Categoria</th>
            <th>Quantidade</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {estoque.map((e, idx) => (
            <tr key={idx}>
              <td>{e.item}</td>
              <td>{e.categoria}</td>
              <td>{e.quantidade}</td>
              <td>{e.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default EstoquePage;