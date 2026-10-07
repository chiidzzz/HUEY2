const AutorotationEngine = {
  calculateRPM(da, gw) {
    if (gw < 7000 || gw > 10000) {
      return "Check GW between 7000 and 10000 lbs.";
    }
    
    // Base RPM bounds at 0 Density Altitude for each GW tier 
    const bases = {
      7000: 294.69,
      7500: 301.25,
      8000: 307.81,
      8500: 314.38,
      9000: 320.95,
      9500: 327.51,
      10000: 334.07
    };
    
    const lower_gw = Math.floor(gw / 500) * 500;
    const upper_gw = Math.ceil(gw / 500) * 500;
    
    let rpm;
    if (lower_gw === upper_gw) {
      rpm = 0.0019 * da + bases[lower_gw];
    } else {
      const lower_rpm = 0.0019 * da + bases[lower_gw];
      const upper_rpm = 0.0019 * da + bases[upper_gw];
      rpm = lower_rpm + ((gw - lower_gw) * (upper_rpm - lower_rpm)) / 500;
    }
    
    // Structural limitations from the HUEY 2 Excel Charts
    if (rpm < 295) return "295.0";
    if (rpm > 339) return "339.0";
    
    return rpm.toFixed(1);
  }
};