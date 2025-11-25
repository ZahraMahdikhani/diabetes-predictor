"use client"

import { useState } from "react"
import DiabetesForm from "@/components/diabetes-form"
import ResultsDisplay from "@/components/results-display"

export default function Home() {
  const [results, setResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (formData: Record<string, any>) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-blue-50 to-emerald-50 py-8 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        {results ? (
          <ResultsDisplay results={results} onReset={() => setResults(null)} />
        ) : (
          <DiabetesForm onSubmit={handleSubmit} isLoading={isLoading} />
        )}
      </div>
    </main>
  )
}
