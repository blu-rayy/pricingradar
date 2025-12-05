"use client";

import { useState } from "react";
import {
  MarketplaceType,
  CompetitorProduct,
  InternalProduct,
  ProductMapping as ProductMappingType,
  AlertThreshold,
  ConfigWizardState,
} from "@/lib/scrapers/types";
import { generateId } from "@/lib/scrapers";
import { getMarketplaceConfig } from "@/lib/scrapers/marketplaces";
import { Button, Card } from "@/app/components/ui";
import {
  MarketplaceSelector,
  UrlInput,
  ProductMapping,
  AlertThresholds,
} from "@/app/components/config";

type WizardStep = "marketplace" | "urls" | "mappings" | "alerts" | "review";

const STEPS: { id: WizardStep; label: string; icon: string }[] = [
  { id: "marketplace", label: "Marketplace", icon: "🏪" },
  { id: "urls", label: "URLs", icon: "🔗" },
  { id: "mappings", label: "Products", icon: "📦" },
  { id: "alerts", label: "Alerts", icon: "🔔" },
  { id: "review", label: "Review", icon: "✅" },
];

export default function CompetitorConfigPage() {
  const [currentStep, setCurrentStep] = useState<WizardStep>("marketplace");
  const [marketplace, setMarketplace] = useState<MarketplaceType | undefined>();
  const [urls, setUrls] = useState<string[]>([]);
  const [competitorProducts, setCompetitorProducts] = useState<
    CompetitorProduct[]
  >([]);
  const [internalProducts, setInternalProducts] = useState<InternalProduct[]>(
    []
  );
  const [mappings, setMappings] = useState<ProductMappingType[]>([]);
  const [alerts, setAlerts] = useState<AlertThreshold[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);
  const marketplaceConfig = marketplace
    ? getMarketplaceConfig(marketplace)
    : null;

  // Convert URLs to competitor products when moving from URLs step
  // Preserves existing product IDs for URLs that haven't changed to maintain mappings
  const handleUrlsComplete = () => {
    const products: CompetitorProduct[] = urls.map((url, index) => {
      // Check if this URL already has a product with a stable ID
      const existingProduct = competitorProducts.find((p) => p.url === url);
      if (existingProduct) {
        return existingProduct;
      }
      // New URL, generate new product
      return {
        id: generateId(),
        url,
        name: `Product ${index + 1}`, // Will be updated after scraping
        marketplace: marketplace!,
      };
    });

    // Clear mappings for products that no longer exist (URLs were removed)
    const newProductIds = new Set(products.map((p) => p.id));
    const validMappings = mappings.filter((m) =>
      newProductIds.has(m.competitorProductId)
    );

    setCompetitorProducts(products);
    setMappings(validMappings);
    setCurrentStep("mappings");
  };

  const handleAddInternalProduct = (product: Omit<InternalProduct, "id">) => {
    const newProduct: InternalProduct = {
      ...product,
      id: generateId(),
    };
    setInternalProducts([...internalProducts, newProduct]);
  };

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      if (currentStep === "urls") {
        handleUrlsComplete();
      } else {
        setCurrentStep(STEPS[nextIndex].id);
      }
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex].id);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    // TODO: Save configuration to database/API
    const config = {
      id: generateId(),
      name: `${marketplaceConfig?.name} Competitor`,
      marketplace,
      urls,
      products: competitorProducts,
      productMappings: mappings,
      alertThresholds: alerts,
      scrapeFrequency: "daily" as const,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log("Saving configuration:", config);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSaving(false);
    // TODO: Redirect to dashboard or show success message
    alert("Configuration saved successfully!");
  };

  const canProceed = () => {
    switch (currentStep) {
      case "marketplace":
        return !!marketplace;
      case "urls":
        return urls.length >= 2;
      case "mappings":
        return true; // Optional step
      case "alerts":
        return alerts.length > 0;
      case "review":
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-emerald-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-emerald-950/20">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                PricingRadar
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Configure Competitor Tracking
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = index < currentStepIndex;

              return (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() =>
                      index <= currentStepIndex && setCurrentStep(step.id)
                    }
                    disabled={index > currentStepIndex}
                    className={`
                      flex flex-col items-center gap-2 transition-all
                      ${
                        index <= currentStepIndex
                          ? "cursor-pointer"
                          : "cursor-not-allowed opacity-50"
                      }
                    `}
                  >
                    <div
                      className={`
                        w-12 h-12 rounded-full flex items-center justify-center text-xl
                        transition-all duration-300
                        ${
                          isActive
                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-110"
                            : isCompleted
                            ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                        }
                      `}
                    >
                      {isCompleted ? "✓" : step.icon}
                    </div>
                    <span
                      className={`
                      text-xs font-medium
                      ${
                        isActive
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-zinc-500 dark:text-zinc-400"
                      }
                    `}
                    >
                      {step.label}
                    </span>
                  </button>

                  {index < STEPS.length - 1 && (
                    <div
                      className={`
                      w-12 md:w-24 h-0.5 mx-2
                      ${
                        index < currentStepIndex
                          ? "bg-emerald-500"
                          : "bg-zinc-200 dark:bg-zinc-700"
                      }
                    `}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <Card variant="elevated" padding="lg" className="mb-6">
          {currentStep === "marketplace" && (
            <MarketplaceSelector
              selected={marketplace}
              onSelect={setMarketplace}
            />
          )}

          {currentStep === "urls" && marketplace && (
            <UrlInput
              marketplace={marketplace}
              urls={urls}
              onUrlsChange={setUrls}
            />
          )}

          {currentStep === "mappings" && (
            <ProductMapping
              competitorProducts={competitorProducts}
              internalProducts={internalProducts}
              mappings={mappings}
              onMappingsChange={setMappings}
              onAddInternalProduct={handleAddInternalProduct}
            />
          )}

          {currentStep === "alerts" && (
            <AlertThresholds alerts={alerts} onAlertsChange={setAlerts} />
          )}

          {currentStep === "review" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Review Configuration
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  Confirm your competitor tracking setup
                </p>
              </div>

              <div className="grid gap-4">
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                  <div className="text-sm text-zinc-500 dark:text-zinc-400">
                    Marketplace
                  </div>
                  <div className="font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mt-1">
                    <span>{marketplaceConfig?.icon}</span>
                    {marketplaceConfig?.name}
                  </div>
                </div>

                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                  <div className="text-sm text-zinc-500 dark:text-zinc-400">
                    Tracking URLs
                  </div>
                  <div className="font-medium text-zinc-900 dark:text-zinc-100 mt-1">
                    {urls.length} product URLs
                  </div>
                  <ul className="mt-2 space-y-1">
                    {urls.map((url, i) => (
                      <li
                        key={i}
                        className="text-xs text-zinc-500 dark:text-zinc-400 truncate"
                      >
                        {url}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                  <div className="text-sm text-zinc-500 dark:text-zinc-400">
                    Product Mappings
                  </div>
                  <div className="font-medium text-zinc-900 dark:text-zinc-100 mt-1">
                    {mappings.length} products mapped
                  </div>
                </div>

                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                  <div className="text-sm text-zinc-500 dark:text-zinc-400">
                    Alert Rules
                  </div>
                  <div className="font-medium text-zinc-900 dark:text-zinc-100 mt-1">
                    {alerts.filter((a) => a.enabled).length} active alerts
                  </div>
                  <ul className="mt-2 space-y-1">
                    {alerts
                      .filter((a) => a.enabled)
                      .map((alert) => (
                        <li
                          key={alert.id}
                          className="text-xs text-zinc-500 dark:text-zinc-400"
                        >
                          • {alert.name}
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStepIndex === 0}
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </Button>

          {currentStep === "review" ? (
            <Button onClick={handleSave} loading={isSaving}>
              Save Configuration
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Continue
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
