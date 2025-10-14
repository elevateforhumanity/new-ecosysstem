import React from 'react'
import { hydrateRoot } from 'react-dom/client'
import type { OnRenderClientAsync } from 'vike/types'
import { PageShell } from './PageShell'

export const onRenderClient: OnRenderClientAsync = async (pageContext): Promise<void> => {
  const { Page, pageProps } = pageContext
  
  const container = document.getElementById('page-view')
  if (!container) {
    throw new Error('Root element #page-view not found')
  }

  hydrateRoot(
    container,
    <PageShell>
      <Page {...pageProps} />
    </PageShell>
  )
}
