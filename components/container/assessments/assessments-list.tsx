'use client'

import { useAssessments } from '@/hooks/useAssessments'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export function AssessmentsList() {
  const { data: assessments, isLoading, error } = useAssessments()

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
        Failed to load assessments. Please try again.
      </div>
    )
  }

  if (!assessments || assessments.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        <p>No assessments yet. Start by selecting a template.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {assessments.map((assessment) => (
        <Link key={assessment.id} href={`/assessments/${assessment.id}`}>
          <Card className="p-4 transition-colors hover:bg-muted/50">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">Assessment</h3>
                  <Badge
                    variant={
                      assessment.status === 'SUBMITTED'
                        ? 'default'
                        : assessment.status === 'REVIEWED'
                          ? 'secondary'
                          : 'outline'
                    }
                  >
                    {assessment.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  ID: {assessment.id.slice(0, 8)}...
                </p>
                {assessment.updatedAt && (
                  <p className="text-xs text-muted-foreground/70">
                    Updated {new Date(assessment.updatedAt).toLocaleDateString()}
                  </p>
                )}
              </div>

              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}
