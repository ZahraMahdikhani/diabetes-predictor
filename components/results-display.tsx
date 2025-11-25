"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function ResultsDisplay({
  results,
  onReset,
}: {
  results: { result: number; prob: number }
  onReset: () => void
}) {
  const isHighRisk = results.result === 1
  const probability = Math.round(results.prob * 100)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground">Your Assessment Results</h1>
        <p className="text-lg text-muted-foreground">Here's what we found based on your responses</p>
      </div>

      {/* Main Result Card */}
      <Card
        className={`p-8 md:p-12 border-0 shadow-xl overflow-hidden relative ${
          isHighRisk ? "bg-gradient-to-br from-red-50 to-orange-50" : "bg-gradient-to-br from-green-50 to-emerald-50"
        }`}
      >
        <div
          className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10 ${
            isHighRisk ? "bg-red-500" : "bg-green-500"
          }`}
        />

        <div className="relative space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className={`text-3xl md:text-4xl font-bold mb-2 ${isHighRisk ? "text-red-700" : "text-green-700"}`}>
                {isHighRisk ? "⚠️ Higher Risk Detected" : "✅ Low Risk Detected"}
              </h2>
              <p className={`text-lg md:text-xl ${isHighRisk ? "text-red-600" : "text-green-600"}`}>
                {isHighRisk
                  ? "Our assessment suggests an elevated diabetes risk. We recommend consulting with a healthcare professional."
                  : "Great news! Our assessment suggests a lower risk of diabetes. Continue maintaining healthy habits."}
              </p>
            </div>
          </div>

          {/* Risk Score */}
          <div className="mt-8 pt-8 border-t-2 border-white/30">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Risk Probability</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                    {probability}%
                  </span>
                  <span className="text-lg text-muted-foreground">chance of diabetes</span>
                </div>
              </div>
              <div className={`text-6xl ${isHighRisk ? "opacity-20" : "opacity-30"}`}>{isHighRisk ? "⚠️" : "💚"}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Recommendations */}
      <Card className="p-8 md:p-10 border-2 border-emerald-200 bg-white shadow-lg">
        <h3 className="text-2xl font-bold mb-6 text-foreground">Recommended Actions</h3>
        <ul className="space-y-4">
          {isHighRisk ? (
            <>
              <li className="flex gap-4">
                <span className="text-2xl">🩺</span>
                <div>
                  <p className="font-semibold text-foreground">Schedule a doctor visit</p>
                  <p className="text-sm text-muted-foreground">
                    Consult with your healthcare provider for professional evaluation and testing
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="text-2xl">🏃</span>
                <div>
                  <p className="font-semibold text-foreground">Increase physical activity</p>
                  <p className="text-sm text-muted-foreground">Aim for 150 minutes of moderate exercise per week</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="text-2xl">🥗</span>
                <div>
                  <p className="font-semibold text-foreground">Improve diet quality</p>
                  <p className="text-sm text-muted-foreground">Focus on whole grains, vegetables, and lean proteins</p>
                </div>
              </li>
            </>
          ) : (
            <>
              <li className="flex gap-4">
                <span className="text-2xl">✨</span>
                <div>
                  <p className="font-semibold text-foreground">Maintain current habits</p>
                  <p className="text-sm text-muted-foreground">Keep up the healthy lifestyle choices you're making</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="text-2xl">🔄</span>
                <div>
                  <p className="font-semibold text-foreground">Regular check-ups</p>
                  <p className="text-sm text-muted-foreground">Visit your doctor annually for preventive care</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="text-2xl">📚</span>
                <div>
                  <p className="font-semibold text-foreground">Stay informed</p>
                  <p className="text-sm text-muted-foreground">Learn more about diabetes prevention strategies</p>
                </div>
              </li>
            </>
          )}
        </ul>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <Button onClick={onReset} variant="outline" className="flex-1 h-12 text-base bg-transparent">
          New Assessment
        </Button>
        <Button className="flex-1 h-12 text-base bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700">
          Download PDF Report
        </Button>
      </div>
    </div>
  )
}
