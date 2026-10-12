// A download link for one plugin's zip, on the Manual install page (/install/manual):
//
//   <PluginDownload plugin="acme" />   ->   acme-0.1.0.zip (40 KB), a link
//
// The zips and plugin-downloads.gen.json are built from the plugins by
// scripts/plugin-zips.mjs before every dev and build run, so the file name
// always carries the version the site was built from. A build that skipped the
// script fails on the missing JSON instead of shipping dead links.
// Server component: no state.

import downloads from './plugin-downloads.gen.json'

type Download = { file: string; href: string; bytes: number }

function size(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`
}

export function PluginDownload({ plugin }: { plugin: string }) {
  const d = (downloads as Record<string, Download>)[plugin]
  if (!d) throw new Error(`PluginDownload: no zip for "${plugin}". Is it in .claude-plugin/marketplace.json?`)
  return (
    <>
      {/* data-v and data-v-link give it the style of Vocs' own links */}
      <a href={d.href} download data-v="" data-v-link="">
        {d.file}
      </a>{' '}
      <span className="download-size">({size(d.bytes)})</span>
    </>
  )
}

export default PluginDownload
