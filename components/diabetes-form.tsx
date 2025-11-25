"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import FormSection from "./form-section"
import ProgressBar from "./progress-bar"

export default function DiabetesForm({
  onSubmit,
  isLoading,
}: { onSubmit: (data: Record<string, any>) => void; isLoading: boolean }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Record<string, any>>({})

  const sections = [
    {
      title: "Basic Health Metrics",
      subtitle: "Start with your essential health information",
      icon: "❤️",
      fields: [
        { name: "BMI", label: "BMI", type: "number", min: 10, max: 60, step: 0.1, required: true },
        {
          name: "GenHlth",
          label: "Overall Health Status",
          type: "select",
          options: [
            { value: 1, label: "Excellent" },
            { value: 2, label: "Very Good" },
            { value: 3, label: "Good" },
            { value: 4, label: "Fair" },
            { value: 5, label: "Poor" },
          ],
          required: true,
        },
        {
          name: "Age",
          label: "Age Group",
          type: "select",
          options: [
            { value: 1, label: "18–24" },
            { value: 2, label: "25–29" },
            { value: 3, label: "30–34" },
            { value: 4, label: "35–39" },
            { value: 5, label: "40–44" },
            { value: 6, label: "45–49" },
            { value: 7, label: "50–54" },
            { value: 8, label: "55–59" },
            { value: 9, label: "60–64" },
            { value: 10, label: "65–69" },
            { value: 11, label: "70–74" },
            { value: 12, label: "75+" },
          ],
          required: true,
        },
      ],
    },
    {
      title: "Medical History",
      subtitle: "Tell us about any health conditions you may have",
      icon: "🏥",
      fields: [
        { name: "HighBP", label: "High Blood Pressure", type: "boolean", required: true },
        { name: "HighChol", label: "High Cholesterol", type: "boolean", required: true },
        { name: "Stroke", label: "History of Stroke", type: "boolean", required: true },
        { name: "HeartDiseaseorAttack", label: "History of Heart Disease", type: "boolean", required: true },
      ],
    },
    {
      title: "Lifestyle Habits",
      subtitle: "Share information about your daily habits",
      icon: "🏃",
      fields: [
        { name: "Smoker", label: "Do you smoke?", type: "boolean", required: true },
        { name: "PhysActivity", label: "Do you exercise regularly?", type: "boolean", required: true },
        { name: "Fruits", label: "Do you eat fruits daily?", type: "boolean", required: true },
        { name: "Veggies", label: "Do you eat vegetables daily?", type: "boolean", required: true },
        { name: "HvyAlcoholConsump", label: "Heavy alcohol consumption?", type: "boolean", required: true },
      ],
    },
    {
      title: "Healthcare Access",
      subtitle: "Information about your healthcare coverage",
      icon: "🏛️",
      fields: [
        { name: "AnyHealthcare", label: "Do you have healthcare coverage?", type: "boolean", required: true },
        { name: "NoDocbcCost", label: "Unable to see doctor due to cost?", type: "boolean", required: true },
        { name: "CholCheck", label: "Had cholesterol check in last 5 years?", type: "boolean", required: true },
      ],
    },
    {
      title: "Health Metrics",
      subtitle: "Recent health observations",
      icon: "📊",
      fields: [
        { name: "DiffWalk", label: "Do you have difficulty walking?", type: "boolean", required: true },
        {
          name: "MentHlth",
          label: "Mental health days (past 30 days)",
          type: "number",
          min: 0,
          max: 30,
          required: true,
        },
        {
          name: "PhysHlth",
          label: "Physical health days (past 30 days)",
          type: "number",
          min: 0,
          max: 30,
          required: true,
        },
      ],
    },
    {
      title: "Demographics",
      subtitle: "Final information about you",
      icon: "👤",
      fields: [
        {
          name: "Gender",
          label: "Gender",
          type: "select",
          options: [
            { value: 0, label: "Female" },
            { value: 1, label: "Male" },
          ],
          required: true,
        },
        {
          name: "Education",
          label: "Education Level",
          type: "select",
          options: [
            { value: 1, label: "Less than high school" },
            { value: 2, label: "High school graduate" },
            { value: 3, label: "Some college" },
            { value: 4, label: "College graduate" },
            { value: 5, label: "Bachelor's degree" },
            { value: 6, label: "Master's degree or higher" },
          ],
          required: true,
        },
        {
          name: "Income",
          label: "Income Level",
          type: "select",
          options: [
            { value: 1, label: "Less than $10k" },
            { value: 2, label: "$10–15k" },
            { value: 3, label: "$15–20k" },
            { value: 4, label: "$20–25k" },
            { value: 5, label: "$25–35k" },
            { value: 6, label: "$35–50k" },
            { value: 7, label: "$50–75k" },
            { value: 8, label: "$75k+" },
          ],
          required: true,
        },
      ],
    },
  ]

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData({ ...formData, [fieldName]: value })
  }

  const handleNext = () => {
    if (currentStep < sections.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    onSubmit(formData)
  }

  const isStepComplete = sections[currentStep].fields.every(
    (field) => formData[field.name] !== undefined && formData[field.name] !== "",
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
          Diabetes Risk Assessment
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Answer a few questions to understand your diabetes risk level. Your health matters.
        </p>
      </div>

      {/* Progress */}
      <ProgressBar current={currentStep + 1} total={sections.length} />

      {/* Form Card */}
      <Card className="p-8 md:p-12 shadow-lg border-0 bg-white/95 backdrop-blur">
        <FormSection section={sections[currentStep]} formData={formData} onFieldChange={handleFieldChange} />

        {/* Navigation */}
        <div className="flex gap-4 mt-12 pt-8 border-t border-border">
          <Button variant="outline" onClick={handlePrev} disabled={currentStep === 0} className="flex-1 bg-transparent">
            ← Previous
          </Button>
          {currentStep === sections.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={!isStepComplete || isLoading}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700"
            >
              {isLoading ? "Analyzing..." : "Get Assessment"}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!isStepComplete}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700"
            >
              Next →
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
