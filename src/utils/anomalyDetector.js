export function stockStatusFromPercent(percent) {
  if (percent > 50) return "green";
  if (percent >= 20) return "yellow";
  return "red";
}

export function stockStatusColor(status) {
  return {
    green: "bg-[#16A34A]",
    yellow: "bg-[#D97706]",
    red: "bg-[#DC2626]",
  }[status] || "bg-slate-400";
}

export function stockTextColor(status) {
  return {
    green: "text-[#16A34A]",
    yellow: "text-[#D97706]",
    red: "text-[#DC2626]",
  }[status] || "text-slate-600";
}

export function getStockStatus(current, max) {
  return stockStatusFromPercent((current / max) * 100);
}

export function normalizeName(value) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

export function fuzzyMatchBeneficiary(name, beneficiaries) {
  const normalized = normalizeName(name);
  if (!normalized) return null;

  return beneficiaries.find((beneficiary) => {
    const target = normalizeName(beneficiary.name);
    return target === normalized || target.includes(normalized) || normalized.includes(target);
  }) || null;
}

export function calculateDistrictStats(shops) {
  const healthy = shops.filter((shop) => shop.status === "green").length;
  const needsHelp = shops.length - healthy;
  const critical = shops.filter((shop) => shop.status === "red").length;
  const served = shops.reduce((sum, shop) => sum + shop.served, 0);
  const total = shops.reduce((sum, shop) => sum + shop.total, 0);

  return { healthy, needsHelp, critical, served, total };
}

