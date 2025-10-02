import { NextResponse } from 'next/server'

export async function GET() {
  const commitSha = process.env.VERCEL_GIT_COMMIT_SHA || null
  const commitRef = process.env.VERCEL_GIT_COMMIT_REF || null
  const repoOwner = process.env.VERCEL_GIT_REPO_OWNER || null
  const repoSlug = process.env.VERCEL_GIT_REPO_SLUG || null
  const env = process.env.VERCEL_ENV || (process.env.NODE_ENV === 'production' ? 'production' : 'development')

  return NextResponse.json({
    commitSha,
    commitRef,
    repository: repoOwner && repoSlug ? `${repoOwner}/${repoSlug}` : null,
    nodeVersion: process.version,
    env,
    timestamp: new Date().toISOString(),
  })
}


