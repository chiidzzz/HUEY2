const PAEngine = {
  PwrAssFATminus10(mgt) { return -0.000002176 * Math.pow(mgt, 3) + 0.004704132 * Math.pow(mgt, 2) - 2.942152186 * mgt + 531.135914195; },
  PwrAssFAT0(mgt) { return -0.000004342 * Math.pow(mgt, 3) + 0.009725196 * Math.pow(mgt, 2) - 6.815988615 * mgt + 1513.83290876; },
  PwrAssFAT15(mgt) { return -0.000003449 * Math.pow(mgt, 3) + 0.007848524 * Math.pow(mgt, 2) - 5.516750478 * mgt + 1212.264525819; },
  PwrAssFAT20(mgt) { return -0.000001284 * Math.pow(mgt, 3) + 0.002978302 * Math.pow(mgt, 2) - 1.887290123 * mgt + 310.539950484; },
  PwrAssFAT25(mgt) { return -0.000004668 * Math.pow(mgt, 3) + 0.010934662 * Math.pow(mgt, 2) - 8.10533222 * mgt + 1920.086763982; },
  PwrAssFAT30(mgt) { return -0.000003648 * Math.pow(mgt, 3) + 0.008790669 * Math.pow(mgt, 2) - 6.642401446 * mgt + 1593.317837745; },
  PwrAssFAT35(mgt) { return -0.000007062 * Math.pow(mgt, 3) + 0.016841555 * Math.pow(mgt, 2) - 12.964059332 * mgt + 3240.446679491; },
  PwrAssFAT40(mgt) { return -0.000004601 * Math.pow(mgt, 3) + 0.011281935 * Math.pow(mgt, 2) - 8.813101951 * mgt + 2211.320364814; },
  PwrAssFAT45(mgt) { return -0.00000387 * Math.pow(mgt, 3) + 0.009691694 * Math.pow(mgt, 2) - 7.69374242 * mgt + 1953.136257021; },
  PwrAssFAT50(mgt) { return -0.00000523 * Math.pow(mgt, 3) + 0.013030312 * Math.pow(mgt, 2) - 10.438476141 * mgt + 2702.77433028; },

  calculatePwrAssVirX(fat, mgt) {
    const B38 = parseFloat(fat);
    const D3 = this.PwrAssFATminus10(mgt), D6 = this.PwrAssFAT0(mgt), D9 = this.PwrAssFAT0(mgt); // mapping mirror
    const D12 = this.PwrAssFAT15(mgt), D15 = this.PwrAssFAT20(mgt), D18 = this.PwrAssFAT25(mgt), D21 = this.PwrAssFAT30(mgt), D24 = this.PwrAssFAT35(mgt), D27 = this.PwrAssFAT40(mgt), D30 = this.PwrAssFAT45(mgt), D33 = this.PwrAssFAT50(mgt);

    if (B38 >= -10 && B38 < 0) return D3 + (D6 - D3) * ((B38 + 10) / 10);
    else if (B38 >= 0 && B38 < 10) return D6 + (D9 - D6) * (B38 / 10);
    else if (B38 >= 10 && B38 < 15) return D9 + (D12 - D9) * ((B38 - 10) / 5);
    else if (B38 >= 15 && B38 < 20) return D12 + (D15 - D12) * ((B38 - 15) / 5);
    else if (B38 >= 20 && B38 < 25) return D15 + (D18 - D15) * ((B38 - 20) / 5);
    else if (B38 >= 25 && B38 < 30) return D18 + (D21 - D18) * ((B38 - 25) / 5);
    else if (B38 >= 30 && B38 < 35) return D21 + (D24 - D21) * ((B38 - 30) / 5);
    else if (B38 >= 35 && B38 < 40) return D24 + (D27 - D24) * ((B38 - 35) / 5);
    else if (B38 >= 40 && B38 < 45) return D27 + (D30 - D27) * ((B38 - 40) / 5);
    else if (B38 >= 45 && B38 < 50) return D30 + (D33 - D30) * ((B38 - 45) / 5);
    return null;
  },

  calculateMRT(pAlt, virX) {
    if (virX === null) return null;
    const A38 = parseFloat(pAlt);
    const J3 = 1.0459 * virX + 41.368,     J6 = 0.9524 * virX + 39.04;
    const J9 = 0.9132 * virX + 38.261,     J12 = 0.9013 * virX + 35.954;
    const J15 = 0.8669 * virX + 34.395,    J18 = 0.8173 * virX + 33.637;
    const J21 = 0.8 * virX + 32,           J24 = 0.7686 * virX + 30.841;
    const J27 = 0.74 * virX + 29.705,      J30 = 0.7143 * virX + 28.571;
    const J33 = 0.6813 * virX + 27.738;

    if (A38 >= 0 && A38 < 1000) return J3 + (J6 - J3) * (A38 / 1000);
    else if (A38 >= 1000 && A38 < 2000) return J6 + (J9 - J6) * ((A38 - 1000) / 1000);
    else if (A38 >= 2000 && A38 < 3000) return J9 + (J12 - J9) * ((A38 - 2000) / 1000);
    else if (A38 >= 3000 && A38 < 4000) return J12 + (J15 - J12) * ((A38 - 3000) / 1000);
    else if (A38 >= 4000 && A38 < 5000) return J15 + (J18 - J15) * ((A38 - 4000) / 1000);
    else if (A38 >= 5000 && A38 < 6000) return J18 + (J21 - J18) * ((A38 - 5000) / 1000);
    else if (A38 >= 6000 && A38 < 7000) return J21 + (J24 - J21) * ((A38 - 6000) / 1000);
    else if (A38 >= 7000 && A38 < 8000) return J24 + (J27 - J24) * ((A38 - 7000) / 1000);
    else if (A38 >= 8000 && A38 < 9000) return J27 + (J30 - J27) * ((A38 - 8000) / 1000);
    else if (A38 >= 9000 && A38 <= 10000) return J30 + (J33 - J30) * ((A38 - 9000) / 1000);
    return null;
  }
};  