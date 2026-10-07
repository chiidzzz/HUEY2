const app = Vue.createApp({
  data() {
    return {
      currentTab: "PPC",
      pressureUnitFrom: "millibar, hPa",
      pressureUnitTo: "inHg",
      PressureInputValue: null,
      PressureConvertedValue: "",
      mgt: "", pwrAssActualtorque: "", pwrAssDiff: "", resultMRT: "",
      PwrAssFAT: 20, PwrAssIA: "", PwrAssIAErrorMessage: "", PwrAssPressureAltitude: null, PwrAssMGTErrorMessage: "", pwrAssWarningMessage: "",
      selectedAircraft: "",
      aircraftWeights: Object.fromEntries(Object.entries(HUEY_AIRCRAFT_DATA).map(([k, v]) => [k, v.weight])),
      cgAircraftDetails: HUEY_AIRCRAFT_DATA,
      bucketPercentage: null, showDropdown: false, showFirefightingText: false,
      fuelErrorMessage: "", TOGWErrorMessage: "", basicWeight: null, fuel: 1400, load: 600, loadUnit: "lbs", takeoffGW: null, unroundedTakeoffGW: 0.0,
      qnh: 29.92, qnhUnit: "inHg", fat: 20, TempErrorMessage: "", indicatedAltitude: null, IAErrorMessage: "", pressureAltitude: null, densityAltitude: null,
      maxTQ: null, predictedHoverTQ2ft: null, predictedHoverTQ4ft: null, predictedHoverTQ30ft: null, predictedHoverTQ100ft: null,

      // CG Fields
      cgAircraft: "", cgBasicWeight: null, cgBasicMoment: null, cgFuel: 920,
      cgPilot1: 90, cgPilot1Unit: "Kg", cgPilot2: 90, cgPilot2Unit: "Kg", cgPassenger1: 0, cgPassenger1Unit: "Kg",
      totalWeight: "-", totalMoment: "-", calculatedCG: "-",
      minFuelDesiredCG: 140, minFuelPilot1: 90, minFuelPilot1Unit: "Kg", minFuelPilot2: 90, minFuelPilot2Unit: "Kg", minFuelPassenger1: 0, minFuelPassenger1Unit: "Kg", minFuelResult: "-",

      // Auto Fields
      autoAircraft: "", autoBasicWeight: null, autoFuel: 1325,
      autoPilot: 70, autoPilotUnit: "Kg", autoCopilot: 90, autoCopilotUnit: "Kg", autoPassenger: 80, autoPassengerUnit: "Kg",
      autoTotalWeight: "-", autoQnh: 30.21, autoQnhUnit: "inHg", autoFat: 18, autoIndicatedAltitude: 1000,
      autoPressureAltitude: "-", autoDensityAltitude: "-", autoAllowedRPM: "-", 
      autoLowerBound: null, autoUpperBound: null, autoActualRPM: null, autoStatusText: ""
    };
  },
  computed: {
    autoAircraftList() {
      const list = {};
      for (const ac in this.cgAircraftDetails) {
        if (ac.startsWith('L12')) {
          list[ac] = this.cgAircraftDetails[ac];
        }
      }
      return list;
    }
  },
  watch: {
    PressureInputValue: "convertPressure",
    pressureUnitFrom: "updateConversionUnits",
    mgt() { this.computeMRT(); },
    pwrAssActualtorque() { this.calculateDiff(); }
  },
  methods: {
    convertPressure() {
      if (this.pressureUnitFrom === "millibar, hPa" && this.pressureUnitTo === "inHg") {
        this.PressureConvertedValue = ConverterEngine.hPaToInHg(this.PressureInputValue) + " inHg";
      } else if (this.pressureUnitFrom === "inHg" && this.pressureUnitTo === "millibar, hPa") {
        this.PressureConvertedValue = ConverterEngine.inHgToHPa(this.PressureInputValue) + " millibar, hPa";
      }
    },
    updateConversionUnits() {
      this.pressureUnitTo = this.pressureUnitFrom === "millibar, hPa" ? "inHg" : "millibar, hPa";
      this.convertPressure();
    },
    updateBasicWeight() {
      this.basicWeight = this.aircraftWeights[this.selectedAircraft] || "";
      this.calculateTakeoffGW();
    },
    validateFuel() {
      const fuelValue = parseFloat(this.fuel);
      if (isNaN(fuelValue) || fuelValue < 200 || fuelValue > 1450) {
        this.fuelErrorMessage = "Check fuel between 200 and 1450 lbs.";
        this.calculateTakeoffGW();
        this.maxTQ = 0; this.predictedHoverTQ2ft = this.predictedHoverTQ4ft = this.predictedHoverTQ30ft = this.predictedHoverTQ100ft = null;
      } else {
        this.calculateTakeoffGW(); this.fuelErrorMessage = "";
      }
    },
    validateTOGW() {
      const TOGWValue = parseFloat(this.takeoffGW);
      if (isNaN(TOGWValue) || TOGWValue < 7500 || TOGWValue > 11200) {
        this.TOGWErrorMessage = "Check TO/GW between 7500 and 11200 lbs.";
        this.maxTQ = this.predictedHoverTQ2ft = this.predictedHoverTQ4ft = this.predictedHoverTQ30ft = this.predictedHoverTQ100ft = 0;
      } else {
        this.triggerAllPPCCalculations(); this.TOGWErrorMessage = "";
      }
    },
    validateTemperature() {
      const temp = parseFloat(this.fat);
      if (isNaN(temp) || temp < -20 || temp > 50) {
        this.TempErrorMessage = "Check Temperature between -20 and 50.";
        this.maxTQ = this.predictedHoverTQ2ft = this.predictedHoverTQ4ft = this.predictedHoverTQ30ft = this.predictedHoverTQ100ft = 0;
      } else {
        this.triggerAllPPCCalculations(); this.TempErrorMessage = "";
      }
    },
    calculateTakeoffGW() {
      const basicWeightLbs = this.aircraftWeights[this.selectedAircraft] || 0;
      const loadLbs = this.loadUnit === "kg" ? this.load * 2.20462 : parseFloat(this.load);
      const fuelLbs = parseFloat(this.fuel) || 0;
      this.takeoffGW = (basicWeightLbs + loadLbs + fuelLbs).toFixed(0);
      this.unroundedTakeoffGW = basicWeightLbs + loadLbs + fuelLbs;
      this.validateTOGW();
    },
    limitIndicatedAltitude() {
      const indicatedAltitude = parseFloat(this.indicatedAltitude);
      if (isNaN(indicatedAltitude) || indicatedAltitude < 0 || indicatedAltitude > 14000) {
        this.IAErrorMessage = "Check Indicated Altitude between 0 and 14000 ft.";
        this.maxTQ = this.predictedHoverTQ2ft = this.predictedHoverTQ4ft = this.predictedHoverTQ30ft = this.predictedHoverTQ100ft = 0;
      } else {
        this.pressureAltitude = (indicatedAltitude + (29.92 - (parseFloat(this.qnh) / (this.qnhUnit === "inHg" ? 1 : 33.8639))) * 1000).toFixed(0);
        this.densityAltitude = (parseFloat(this.pressureAltitude) + 120 * (parseFloat(this.fat) - (15 - parseFloat(this.pressureAltitude) * 0.00198))).toFixed(0);
        this.triggerAllPPCCalculations(); this.IAErrorMessage = "";
      }
    },
    triggerAllPPCCalculations() {
      this.maxTQ = PPCEngine.calculateMaxTQ(this.pressureAltitude, this.fat);
      const gX = PPCEngine.calculateVirtualX(this.pressureAltitude, this.fat);
      const jVal = PPCEngine.calculateVirtualY(this.unroundedTakeoffGW, gX);
      
      if (jVal) {
        this.predictedHoverTQ2ft = parseFloat((-0.000011 * Math.pow(jVal, 3) - 0.000419 * Math.pow(jVal, 2) + 0.80214 * jVal + 32.043856).toFixed(1));
        this.predictedHoverTQ4ft = parseFloat((0.00001249 * Math.pow(jVal, 3) - 0.00218006 * Math.pow(jVal, 2) + 0.86450974 * jVal + 34.93633987).toFixed(1));
        const j8 = -0.00000062 * Math.pow(jVal, 3) - 0.00019146 * Math.pow(jVal, 2) + 0.95976235 * jVal + 37.50445077;
        this.predictedHoverTQ100ft = parseFloat((-0.000088 * Math.pow(jVal, 2) + 1.009451 * jVal + 39.757143).toFixed(1));
        this.predictedHoverTQ30ft = parseFloat((j8 + (this.predictedHoverTQ100ft - j8) * (15 / 85)).toFixed(1));
      }
    },
    limitPwrAssIndicatedAltitude() {
      const indicatedAltitude = parseFloat(this.PwrAssIA);
      if (isNaN(indicatedAltitude) || indicatedAltitude < 0 || indicatedAltitude > 10000) {
        this.PwrAssIAErrorMessage = "Check Indicated Altitude between 0 and 10000 ft.";
        this.resultMRT = this.pwrAssDiff = 0;
      } else {
        const qnhFactor = this.qnhUnit === "inHg" ? 1 : 33.8639;
        this.PwrAssPressureAltitude = (indicatedAltitude + (29.92 - parseFloat(this.qnh) / qnhFactor) * 1000).toFixed(0);
        this.PwrAssIAErrorMessage = ""; this.computeMRT();
      }
    },
    limitMGT() {
      const mgt = parseFloat(this.mgt);
      if (isNaN(mgt) || mgt < 400 || mgt > 880) {
        this.PwrAssMGTErrorMessage = "Check MGT Altitude between 400 and 880.";
        this.resultMRT = this.pwrAssDiff = 0;
      } else {
        this.PwrAssMGTErrorMessage = ""; this.computeMRT();
      }
    },
    computeMRT() {
      const virX = PAEngine.calculatePwrAssVirX(this.PwrAssFAT, this.mgt);
      const mrt = PAEngine.calculateMRT(this.PwrAssPressureAltitude, virX);
      this.resultMRT = mrt ? parseFloat(mrt.toFixed(1)) : 0;
      this.calculateDiff();
    },
    calculateDiff() {
      if (this.pwrAssActualtorque) {
        this.pwrAssDiff = parseFloat((parseFloat(this.pwrAssActualtorque) - this.resultMRT).toFixed(1));
        this.pwrAssWarningMessage = this.pwrAssDiff < 0 ? "The difference is negative. Shut down the aircraft." : "";
      } else { this.pwrAssWarningMessage = ""; }
    },
    updateCGAircraftData() {
      if (this.cgAircraft && this.cgAircraftDetails[this.cgAircraft]) {
        this.cgBasicWeight = this.cgAircraftDetails[this.cgAircraft].weight;
        this.cgBasicMoment = this.cgAircraftDetails[this.cgAircraft].moment;
      } else { this.cgBasicWeight = this.cgBasicMoment = null; }
      this.calculateCG(); this.calculateMinFuel();
    },
    calculateCG() {
      if (!this.cgAircraft) { this.totalWeight = this.totalMoment = "-"; this.calculatedCG = "Select an Aircraft"; return; }
      
      if (this.cgFuel !== null && this.cgFuel !== "") {
        if (this.cgFuel > 1420) this.cgFuel = 1420;
        if (this.cgFuel < 10) this.cgFuel = 10;
      }

      const wFuel = parseFloat(this.cgFuel) || 0;
      const wP1 = CGEngine.getWeightLbs(this.cgPilot1, this.cgPilot1Unit);
      const wP2 = CGEngine.getWeightLbs(this.cgPilot2, this.cgPilot2Unit);
      const wPax1 = CGEngine.getWeightLbs(this.cgPassenger1, this.cgPassenger1Unit);
      
      const totW = this.cgBasicWeight + wFuel + wP1 + wP2 + wPax1;
      const totM = this.cgBasicMoment + CGEngine.getFuelMoment(wFuel) + (wP1 * 46.7) + (wP2 * 46.7) + (wPax1 * 85);
      
      this.totalWeight = totW.toFixed(2); this.totalMoment = totM.toFixed(2);
      this.calculatedCG = totW > 0 ? (totM / totW).toFixed(2) : "0.00";
    },
    calculateMinFuel() {
      if (!this.cgAircraft || !this.minFuelDesiredCG) { this.minFuelResult = "Select Aircraft & Desired CG"; return; }
      this.minFuelResult = CGEngine.calculateMinFuel(
        this.cgBasicWeight, this.cgBasicMoment, parseFloat(this.minFuelDesiredCG),
        CGEngine.getWeightLbs(this.minFuelPilot1, this.minFuelPilot1Unit),
        CGEngine.getWeightLbs(this.minFuelPilot2, this.minFuelPilot2Unit),
        CGEngine.getWeightLbs(this.minFuelPassenger1, this.minFuelPassenger1Unit)
      );
    },
    updateAutoData() {
      if (this.autoAircraft && this.cgAircraftDetails[this.autoAircraft]) {
        this.autoBasicWeight = this.cgAircraftDetails[this.autoAircraft].weight;
      } else {
        this.autoBasicWeight = null;
      }
      this.calculateAuto();
    },
    calculateAuto() {
      if (!this.autoAircraft) {
        this.autoTotalWeight = "-";
        this.autoPressureAltitude = "-";
        this.autoDensityAltitude = "-";
        this.autoAllowedRPM = "-";
        this.autoLowerBound = null;
        this.autoUpperBound = null;
        this.autoStatusText = "";
        return;
      }

      const wFuel = parseFloat(this.autoFuel) || 0;
      const wPilot = CGEngine.getWeightLbs(this.autoPilot, this.autoPilotUnit);
      const wCopilot = CGEngine.getWeightLbs(this.autoCopilot, this.autoCopilotUnit);
      const wPassenger = CGEngine.getWeightLbs(this.autoPassenger, this.autoPassengerUnit);

      const totW = this.autoBasicWeight + wFuel + wPilot + wCopilot + wPassenger;
      this.autoTotalWeight = totW.toFixed(2);

      const qnh = parseFloat(this.autoQnh);
      const indAlt = parseFloat(this.autoIndicatedAltitude);
      const fat = parseFloat(this.autoFat);

      if (isNaN(qnh) || isNaN(indAlt) || isNaN(fat)) {
        this.autoPressureAltitude = "-";
        this.autoDensityAltitude = "-";
        this.autoAllowedRPM = "-";
        this.autoLowerBound = null;
        this.autoUpperBound = null;
        this.autoStatusText = "";
        return;
      }

      const qnhFactor = this.autoQnhUnit === "inHg" ? 1 : 33.8639;
      const pa = indAlt + (29.92 - qnh / qnhFactor) * 1000;
      this.autoPressureAltitude = pa.toFixed(1);

      const da = pa + 120 * (fat - (15 - pa * 0.00198));
      this.autoDensityAltitude = da.toFixed(1);

      const rawRPM = AutorotationEngine.calculateRPM(da, totW);
      
      if (typeof rawRPM === "string") {
        this.autoAllowedRPM = rawRPM;
        this.autoLowerBound = null;
        this.autoUpperBound = null;
        this.autoStatusText = "";
      } else {
        // Build the base display format
        this.autoAllowedRPM = rawRPM.toFixed(1) + " ± 8";
        
        // Define exact bounds to check limits against
        this.autoLowerBound = rawRPM - 8;
        this.autoUpperBound = rawRPM + 8;

        // Perform limits verification if user inputs an Actual RPM
        if (this.autoActualRPM) {
          const actual = parseFloat(this.autoActualRPM);
          if (actual >= this.autoLowerBound && actual <= this.autoUpperBound) {
            this.autoStatusText = "Within Limit";
          } else {
            this.autoStatusText = "Out of Limit";
          }
        } else {
          this.autoStatusText = "";
        }
      }
    },
    resetForm() {
      this.showFirefightingText = this.showDropdown = false;
      this.selectedAircraft = this.fuelErrorMessage = this.TOGWErrorMessage = this.TempErrorMessage = this.IAErrorMessage = "";
      this.basicWeight = this.pressureAltitude = this.densityAltitude = this.maxTQ = this.predictedHoverTQ2ft = this.predictedHoverTQ4ft = this.predictedHoverTQ30ft = this.predictedHoverTQ100ft = null;
      this.fuel = 1400; this.load = 600; this.loadUnit = "lbs"; this.qnh = 29.92; this.qnhUnit = "inHg"; this.fat = 20; this.unroundedTakeoffGW = 0.0; this.indicatedAltitude = null;
    },
    toggleDropdown() { this.showDropdown = !this.showDropdown; },
    setFirefightingLoad(pct) { this.load = pct === 70 ? 3239 : 4239; this.loadUnit = "lbs"; this.calculateTakeoffGW(); this.showFirefightingText = true; this.showDropdown = false; this.bucketPercentage = pct; }
  }
}).mount("#app");