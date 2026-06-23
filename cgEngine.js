const CGEngine = {
  getWeightLbs(val, unit) {
    const value = parseFloat(val) || 0;
    return unit === "Kg" ? value * 2.204623 : value;
  },
  getFuelMoment(fuelW) {
    // Clamping limits to ensure equations process strictly inside the authorized 10-1420 envelope
    let clampedFuel = Math.max(10, Math.min(1420, fuelW));

    if (clampedFuel >= 68 && clampedFuel <= 544) {
      return -0.0163778627 * clampedFuel * clampedFuel + 134.2851074737 * clampedFuel + 1273.6328075858;
    } else if (clampedFuel > 544 && clampedFuel <= 1420) {
      return 169.06 * clampedFuel - 22291;
    }
    return 0;
  },
  calculateMinFuel(w0, m0, targetCG, wP1, wP2, wPax1) {
    const W_empty = w0 + wP1 + wP2 + wPax1;
    const M_empty = m0 + (wP1 * 46.7) + (wP2 * 46.7) + (wPax1 * 85);
    const alpha = M_empty - targetCG * W_empty;

    // Quadratic interpolation limits
    const a = -0.0163778627, b = 134.2851074737, c = 1273.6328075858;
    const E1 = b - targetCG;
    const C_quad = alpha + c;
    const delta = (E1 * E1) - (4 * a * C_quad);

    let solutions = [];
    if (delta >= 0) {
      const x1 = (-E1 - Math.sqrt(delta)) / (2 * a);
      const x2 = (-E1 + Math.sqrt(delta)) / (2 * a);
      if (x1 >= 68 && x1 <= 544) solutions.push(x1);
      if (x2 >= 68 && x2 <= 544) solutions.push(x2);
    }

    // Linear envelope limits
    const a2 = 169.06, b2 = -22291;
    if (targetCG !== a2) {
      const x3 = (alpha + b2) / (targetCG - a2);
      if (x3 > 544) solutions.push(x3); // Allow un-clamped values here to check if it busts the ceiling
    }

    if (solutions.length > 0) {
      let finalFuel = Math.max(...solutions);
      
      // If the math requires more than 1420 lbs of fuel to sit at that CG balance line
      if (finalFuel > 1420) {
        return "1420 lbs (Note: You could start autorotation right away... CG is already above 140)";
      }
      
      // Otherwise, keep standard structural lower floor constraint logic
      finalFuel = Math.max(10, finalFuel);
      return finalFuel.toFixed(0) + " lbs";
    } else {
      // Direct fall-through handle alternative for extreme target parameter offsets
      return "1420 lbs (Note: You could start autorotation right away... CG is already above 140)";
    }
  }
};