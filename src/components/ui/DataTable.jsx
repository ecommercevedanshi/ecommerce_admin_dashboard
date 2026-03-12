const DataTable = ({ columns, data }) => {
  return (
    <table className="table w-full">

      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col} className="text-start">{col}</th>
          ))}
        </tr>
      </thead>

      <tbody>
        {data.map((row, index) => (
          <tr key={index}>
            {row.map((cell, i) => (
              <td key={i}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>

    </table>
  );
};

export default DataTable;