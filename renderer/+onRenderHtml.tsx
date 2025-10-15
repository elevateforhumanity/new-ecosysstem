import React from 'react'
import { renderToString } from 'react-dom/server'
import { dangerouslySkipEscape, escapeInject } from 'vike/server'
import type { OnRenderHtmlAsync } from 'vike/types'
import { PageShell } from './PageShell'

export const onRenderHtml: OnRenderHtmlAsync = async (pageContext): Promise<any> => {
  const { Page, pageProps, data } = pageContext
  
  // Get document metadata from page data
  const title = (data as any)?.title ?? 'Elevate for Humanity | Government Contractor | Workforce Development'
  const description = (data as any)?.description ?? 'Indianapolis-based government contractor providing workforce development solutions. ETPL provider and DOL apprenticeship sponsor.'

  // Render page to string
  const pageHtml = renderToString(
    <PageShell>
      <Page {...pageProps} />
    </PageShell>
  )

  const documentHtml = escapeInject`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:type" content="website" />
    <link rel="icon" href="/images/Elevate_for_Humanity_logo.png" />
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <div id="page-view">${dangerouslySkipEscape(pageHtml)}</div>
  </body>
</html>`

  return {
    documentHtml,
    pageContext: {
      // Make title and description available to the client
      documentProps: { title, description }
    }
  }
}
