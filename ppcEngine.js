const PPCEngine = {
  // Curves
  Fat0(fat) { return 0.0095 * Math.pow(fat, 2) - 2.1571 * fat + 166.05; },
  Fat2000(fat) { return -0.00074786 * Math.pow(fat, 3) + 0.10096154 * Math.pow(fat, 2) - 5.72457265 * fat + 204.30769231; },
  Fat4000(fat) { return -0.00017721 * Math.pow(fat, 3) + 0.01506658 * Math.pow(fat, 2) - 1.47211474 * fat + 128.53679353; },
  Fat6000(fat) { return 0.0000101 * Math.pow(fat, 3) - 0.00277056 * Math.pow(fat, 2) - 0.81259019 * fat + 112.78571429; },
  Fat8000(fat) { return -0.00005439 * Math.pow(fat, 3) + 0.00251748 * Math.pow(fat, 2) - 0.83150738 * fat + 104.1; },
  Fat10000(fat) { return 0.00000668 * Math.pow(fat, 4) - 0.00041017 * Math.pow(fat, 3) - 0.00270513 * Math.pow(fat, 2) - 0.39245176 * fat + 93.94326262; },
  Fat12000(fat) { return 0.00000867 * Math.pow(fat, 4) - 0.0005301 * Math.pow(fat, 3) - 0.00275058 * Math.pow(fat, 2) - 0.29468669 * fat + 86.69107363; },
  Fat14000(fat) { return 0.00000629 * Math.pow(fat, 4) - 0.00037949 * Math.pow(fat, 3) - 0.00326224 * Math.pow(fat, 2) - 0.31544789 * fat + 80.16723277; },

  calculateMaxTQ(pressAlt, fat) {
    const N3 = parseFloat(pressAlt);
    const f0 = this.Fat0(fat), f2000 = this.Fat2000(fat), f4000 = this.Fat4000(fat), f6000 = this.Fat6000(fat);
    const f8000 = this.Fat8000(fat), f10000 = this.Fat10000(fat), f12000 = this.Fat12000(fat), f14000 = this.Fat14000(fat);
    let maxTQ = null;

    if (N3 >= 0 && N3 < 2000) maxTQ = f0 - (f0 - f2000) * (N3 / 2000);
    else if (N3 >= 2000 && N3 < 4000) maxTQ = f2000 - ((f2000 - f4000) * (N3 - 2000)) / 2000;
    else if (N3 >= 4000 && N3 < 6000) maxTQ = f4000 - ((f4000 - f6000) * (N3 - 4000)) / 2000;
    else if (N3 >= 6000 && N3 < 8000) maxTQ = f6000 - ((f6000 - f8000) * (N3 - 6000)) / 2000;
    else if (N3 >= 8000 && N3 < 10000) maxTQ = f8000 - ((f8000 - f10000) * (N3 - 8000)) / 2000;
    else if (N3 >= 10000 && N3 < 12000) maxTQ = f10000 - ((f10000 - f12000) * (N3 - 10000)) / 2000;
    else if (N3 >= 12000 && N3 < 14000) maxTQ = f12000 - ((f12000 - f14000) * (N3 - 12000)) / 2000;
    else if (N3 === 14000) maxTQ = f14000;

    return maxTQ !== null ? Math.min(maxTQ, 100).toFixed(1) : null;
  },

  calculateVirtualX(pressAlt, fat) {
    const PA = parseFloat(pressAlt);
    const E2 = 0.0028 * PA + 1, E5 = 0.0025 * PA + 7, E8 = 0.0026 * PA + 11, E11 = 0.0025 * PA + 16, E14 = 0.0025 * PA + 20;
    if (fat >= -20 && fat < 0) return E2 + (E5 - E2) * ((fat + 20) / 20);
    else if (fat >= 0 && fat < 20) return E5 + (E8 - E5) * (fat / 20);
    else if (fat >= 20 && fat < 40) return E8 + (E11 - E8) * ((fat - 20) / 20);
    else if (fat >= 40 && fat < 60) return E11 + (E14 - E11) * ((fat - 40) / 20);
    return null;
  },

  // Hover TQ functions
  VX7500(g) { return 0.00000455 * Math.pow(g, 4) - 0.00036092 * Math.pow(g, 3) + 0.01598776 * Math.pow(g, 2) - 0.12107615 * g + 21.29166667; },
  VX8000(g) { return 0.00016301 * Math.pow(g, 3) - 0.00416084 * Math.pow(g, 2) + 0.25360528 * g + 23.74666667; },
  VX8500(g) { return 0.00017172 * Math.pow(g, 3) - 0.0019697 * Math.pow(g, 2) + 0.22979798 * g + 28.83333333; },
  VX9000(g) { return 0.0008101 * Math.pow(g, 3) - 0.0372987 * Math.pow(g, 2) + 0.85134921 * g + 31.17142857; },
  VX9500(g) { return 0.00005 * Math.pow(g, 4) - 0.00336869 * Math.pow(g, 3) + 0.08238636 * Math.pow(g, 2) - 0.39045815 * g + 40.33928571; },
  VX10000(g) { return 0.00088889 * Math.pow(g, 3) - 0.03095238 * Math.pow(g, 2) + 0.78730159 * g + 42.10714286; },
  VX10500(g) { return 0.001044 * Math.pow(g, 3) - 0.027711 * Math.pow(g, 2) + 0.715536 * g + 48.007464; },
  VX11000(g) { return 0.00099 * Math.pow(g, 3) - 0.009714 * Math.pow(g, 2) + 0.372381 * g + 55.257143; },
  VX11200(g) { return 0.02 * Math.pow(g, 2) + 0.2 * g + 58; },

  calculateVirtualY(unroundedGW, gX) {
    if (!gX) return null;
    const O3 = parseFloat(unroundedGW);
    const H2 = this.VX7500(gX), H5 = this.VX8000(gX), H8 = this.VX8500(gX), H11 = this.VX9000(gX), H14 = this.VX9500(gX), H17 = this.VX10000(gX), H20 = this.VX10500(gX), H23 = this.VX11000(gX), H26 = this.VX11200(gX);
    
    if (O3 >= 7500 && O3 < 8000) return H2 + (H5 - H2) * ((O3 - 7500) / 500);
    else if (O3 >= 8000 && O3 < 8500) return H5 + (H8 - H5) * ((O3 - 8000) / 500);
    else if (O3 >= 8500 && O3 < 9000) return H8 + (H11 - H8) * ((O3 - 8500) / 500);
    else if (O3 >= 9000 && O3 < 9500) return H11 + (H14 - H11) * ((O3 - 9000) / 500);
    else if (O3 >= 9500 && O3 < 10000) return H14 + (H17 - H14) * ((O3 - 9500) / 500);
    else if (O3 >= 10000 && O3 < 10500) return H17 + (H20 - H17) * ((O3 - 10000) / 500);
    else if (O3 >= 10500 && O3 < 11000) return H20 + (H23 - H20) * ((O3 - 10500) / 500);
    else if (O3 >= 11000 && O3 < 11200) return H23 + (H26 - H23) * ((O3 - 11000) / 200);
    else if (O3 === 11200) return H26;
    return null;
  }
};