export const exportarCSV = (nombreArchivo, datos = []) => {
  if (!datos.length) {
    alert("No hay datos para exportar.");
    return;
  }

  const encabezados = Object.keys(datos[0]);

  const filas = datos.map((fila) =>
    encabezados
      .map((columna) => {
        const valor = fila[columna] ?? "";
        const valorLimpio = String(valor).replace(/"/g, '""');
        return `"${valorLimpio}"`;
      })
      .join(",")
  );

  const contenido = [encabezados.join(","), ...filas].join("\n");

  const blob = new Blob(["\ufeff" + contenido], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${nombreArchivo}.csv`;
  link.click();

  URL.revokeObjectURL(url);
};