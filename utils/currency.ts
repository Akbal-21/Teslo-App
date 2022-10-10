export const format = (value: number) => {
  //Se crea el formateador
  const formatter = new Intl.NumberFormat("en-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(value);
};
