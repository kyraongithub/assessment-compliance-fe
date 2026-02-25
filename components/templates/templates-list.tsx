'use client'

import { useTemplates } from '@/hooks/useTemplates'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'

export function TemplatesList() {
  const { data: templates, isLoading, error } = useTemplates()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        Failed to load templates. Please try again.
      </div>
    )
  }

  if (!templates || templates.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        <p>No templates available yet.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => (
        <Card key={template.id} className="flex flex-col p-6">
          <div className="mb-4 flex items-start justify-between">
            <h3 className="font-semibold text-lg">{template.title}</h3>
            <Badge
              variant={
                template.status === 'AVAILABLE'
                  ? 'default'
                  : template.status === 'PROCESSING'
                    ? 'secondary'
                    : 'destructive'
              }
            >
              {template.status}
            </Badge>
          </div>

          {template.categoriesCount && (
            <p className="mb-2 text-sm text-muted-foreground">
              {template.categoriesCount} categories • {template.requirementsCount} requirements
            </p>
          )}

          {template.createdAt && (
            <p className="mb-4 text-xs text-muted-foreground">
              {new Date(template.createdAt).toLocaleDateString()}
            </p>
          )}

          <div className="mt-auto">
            {template.status === 'AVAILABLE' ? (
              <Link href={`/assessments/new?templateId=${template.id}`}>
                <Button className="w-full">Start Assessment</Button>
              </Link>
            ) : (
              <Button disabled className="w-full">
                Not Available
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}
