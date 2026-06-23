const ConverterEngine = {
  hPaToInHg(hPa) {
    return (parseFloat(hPa) * 0.02953).toFixed(2);
  },
  inHgToHPa(inHg) {
    return (parseFloat(inHg) / 0.02953).toFixed(2);
  }
};