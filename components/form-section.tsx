"use client"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface Field {
  name: string
  label: string
  type: "text" | "number" | "select" | "boolean"
  [key: string]: any
}

interface Section {
  title: string
  subtitle: string
  icon: string
  fields: Field[]
}

export default function FormSection({
  section,
  formData,
  onFieldChange,
}: {
  section: Section
  formData: Record<string, any>
  onFieldChange: (fieldName: string, value: any) => void
}) {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{section.icon}</span>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">{section.title}</h2>
            <p className="text-sm md:text-base text-muted-foreground">{section.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {section.fields.map((field) => (
          <div key={field.name} className="space-y-3">
            <Label htmlFor={field.name} className="text-base font-medium text-foreground">
              {field.label}
            </Label>

            {field.type === "number" && (
              <Input
                id={field.name}
                type="number"
                min={field.min}
                max={field.max}
                step={field.step || 1}
                value={formData[field.name] || ""}
                onChange={(e) => onFieldChange(field.name, e.target.value ? Number.parseFloat(e.target.value) : "")}
                className="h-11 border-2 border-border focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                placeholder={`Enter ${field.label.toLowerCase()}`}
              />
            )}

            {field.type === "text" && (
              <Input
                id={field.name}
                type="text"
                value={formData[field.name] || ""}
                onChange={(e) => onFieldChange(field.name, e.target.value)}
                className="h-11 border-2 border-border focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                placeholder={field.label}
              />
            )}

            {field.type === "select" && (
              <Select
                value={String(formData[field.name] || "")}
                onValueChange={(value) => onFieldChange(field.name, Number.parseInt(value))}
              >
                <SelectTrigger className="h-11 border-2 border-border focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20">
                  <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {field.options.map((option: any) => (
                    <SelectItem key={option.value} value={String(option.value)}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {field.type === "boolean" && (
              <RadioGroup
                value={String(formData[field.name] || "")}
                onValueChange={(value) => onFieldChange(field.name, Number.parseInt(value))}
              >
                <div className="flex gap-6">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id={`${field.name}-no`} />
                    <Label htmlFor={`${field.name}-no`} className="font-normal cursor-pointer text-base">
                      No
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id={`${field.name}-yes`} />
                    <Label htmlFor={`${field.name}-yes`} className="font-normal cursor-pointer text-base">
                      Yes
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
