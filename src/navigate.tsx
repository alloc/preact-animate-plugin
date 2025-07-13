import { Fragment, render, type ComponentType } from 'preact'

const pages = import.meta.glob(['./**/index.tsx', './404.tsx'], {
  base: './pages/',
})

const layouts = import.meta.glob('./**/layout.tsx', {
  base: './pages/',
})

export function navigate(url: URL) {
  const currentPage = url.pathname
    .replace(/^\/?/, './')
    .replace(/\/?$/, '/index.tsx')

  const getPageModule = (pages[currentPage] ?? pages['404.tsx']) as
    | (() => Promise<{ default: ComponentType }>)
    | undefined

  let getLayoutModule: typeof getPageModule
  for (
    let parts = currentPage.split('/').slice(0, -1);
    parts.length > 0;
    parts.pop()
  ) {
    getLayoutModule = layouts[
      parts.join('/') + '/layout.tsx'
    ] as typeof getLayoutModule
  }

  getLayoutModule ??= async () => ({
    default: Fragment,
  })

  if (getPageModule) {
    Promise.all([getPageModule(), getLayoutModule()]).then(
      ([{ default: Page }, { default: Layout }]) => {
        render(
          <Layout>
            <Page />
          </Layout>,
          document.getElementById('app')!
        )
      }
    )
  }
}
