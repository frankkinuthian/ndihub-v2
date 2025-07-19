import { formatCurrency, convertCurrency, type SupportedCurrency, isSupportedCurrency } from "@/lib/currency";

interface CurrencyDisplayProps {
  amount: number;
  currency?: string;
  showBothPrices?: boolean;
  className?: string;
}

export function CurrencyDisplay({ 
  amount, 
  currency = "KES", 
  showBothPrices = false,
  className = ""
}: CurrencyDisplayProps) {
  // Handle free courses
  if (amount === 0) {
    return <span className={className}>Free</span>;
  }

  // Validate currency
  const validCurrency = isSupportedCurrency(currency) ? currency as SupportedCurrency : "KES";
  
  // Primary price (always show in KES for local users)
  const primaryPrice = validCurrency === "KES" 
    ? formatCurrency(amount, "KES")
    : formatCurrency(convertCurrency(amount, validCurrency, "KES"), "KES");

  // Secondary price (original currency if different)
  const secondaryPrice = validCurrency !== "KES" 
    ? formatCurrency(amount, validCurrency)
    : formatCurrency(convertCurrency(amount, "KES", "USD"), "USD");

  if (showBothPrices && validCurrency !== "KES") {
    return (
      <div className={className}>
        <div className="text-lg font-bold">{primaryPrice}</div>
        <div className="text-sm text-muted-foreground">({secondaryPrice})</div>
      </div>
    );
  }

  return <span className={className}>{primaryPrice}</span>;
}

interface PriceTagProps {
  amount: number;
  currency?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "card" | "hero";
}

export function PriceTag({ 
  amount, 
  currency = "KES", 
  size = "md",
  variant = "default"
}: PriceTagProps) {
  const sizeClasses = {
    sm: "text-sm px-2 py-1",
    md: "text-base px-3 py-1",
    lg: "text-lg px-4 py-2"
  };

  const variantClasses = {
    default: "bg-primary text-primary-foreground",
    card: "bg-black/50 text-white backdrop-blur-sm",
    hero: "bg-white/10 text-white backdrop-blur-sm"
  };

  return (
    <span className={`
      font-bold rounded-full
      ${sizeClasses[size]}
      ${variantClasses[variant]}
    `}>
      <CurrencyDisplay amount={amount} currency={currency} />
    </span>
  );
}

interface PriceComparisonProps {
  amount: number;
  currency?: string;
  className?: string;
}

export function PriceComparison({ 
  amount, 
  currency = "KES",
  className = ""
}: PriceComparisonProps) {
  if (amount === 0) {
    return <div className={className}>Free Course</div>;
  }

  const validCurrency = isSupportedCurrency(currency) ? currency as SupportedCurrency : "KES";
  
  const kesPrice = validCurrency === "KES" 
    ? amount 
    : convertCurrency(amount, validCurrency, "KES");
    
  const usdPrice = validCurrency === "USD" 
    ? amount 
    : convertCurrency(amount, validCurrency, "USD");

  return (
    <div className={className}>
      <div className="text-2xl font-bold text-green-600">
        {formatCurrency(kesPrice, "KES")}
      </div>
      <div className="text-sm text-muted-foreground">
        ≈ {formatCurrency(usdPrice, "USD")} USD
      </div>
      <div className="text-xs text-muted-foreground mt-1">
        Pay with M-Pesa or Card
      </div>
    </div>
  );
}
