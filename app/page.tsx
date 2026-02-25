'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { ProtectedLayout } from '@/components/protected-layout'

function HomeContent() {
  return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Compliance Assessment Platform
          </h2>
          <p className="text-xl text-muted-foreground">
            Streamline your compliance workflows with AI-powered requirements extraction and assessment tracking
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card className="flex flex-col p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <span className="text-2xl">📋</span>
            </div>
            <h3 className="mb-2 font-semibold text-lg">Templates</h3>
            <p className="mb-4 flex-1 text-sm text-muted-foreground">
              Upload compliance documents as PDFs and automatically extract requirements using AI
            </p>
            <Link href="/templates">
              <Button variant="outline" className="w-full">
                Browse Templates
              </Button>
            </Link>
          </Card>

          <Card className="flex flex-col p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <span className="text-2xl">✅</span>
            </div>
            <h3 className="mb-2 font-semibold text-lg">Assessments</h3>
            <p className="mb-4 flex-1 text-sm text-muted-foreground">
              Create and manage assessments based on templates, tracking compliance status
            </p>
            <Link href="/assessments">
              <Button variant="outline" className="w-full">
                View Assessments
              </Button>
            </Link>
          </Card>

          <Card className="flex flex-col p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="mb-2 font-semibold text-lg">Tracking</h3>
            <p className="mb-4 flex-1 text-sm text-muted-foreground">
              Real-time progress tracking and submission review with detailed reporting
            </p>
            <Button variant="outline" className="w-full" disabled>
              Coming Soon
            </Button>
          </Card>
        </div>

        <Card className="mt-12 p-8">
          <h3 className="mb-4 text-lg font-semibold">Quick Start</h3>
          <ol className="space-y-3 text-muted-foreground">
            <li className="flex gap-3">
              <span className="font-semibold text-foreground">1.</span>
              <span>Go to Templates and upload a compliance document (PDF)</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-foreground">2.</span>
              <span>Wait for AI processing to extract requirements</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-foreground">3.</span>
              <span>Create an Assessment from the template</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-foreground">4.</span>
              <span>Fill out and submit your compliance responses</span>
            </li>
          </ol>
        </Card>
      </div>
    )
  }

export default function Home() {
  return (
    <ProtectedLayout>
      <HomeContent />
    </ProtectedLayout>
  )
}
